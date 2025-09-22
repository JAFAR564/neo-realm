"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import EnergyReaction from './EnergyReaction';

type Message = {
  id: number;
  user_id: string;
  content: string;
  message_type: 'chat' | 'action' | 'dice_roll' | 'system';
  created_at: string;
  username?: string;
  avatar_url?: string;
  character_class?: string;
  reactions?: Reaction[];
};

type Reaction = {
  id: number;
  user_id: string;
  message_id: number;
  reaction_type: string;
  created_at: string;
};

type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  character_class: string | null;
};

export default function TerminalChat({ 
  profile,
  channelId,
  channelName
}: { 
  profile: { id: string };
  channelId?: string;
  channelName?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user profiles for messages
  const loadUserProfiles = async (userIds: string[]) => {
    // Filter out already loaded profiles
    const userIdsToLoad = userIds.filter(id => !userProfiles[id] && id !== null);
    
    if (userIdsToLoad.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, character_class')
        .in('id', userIdsToLoad);

      if (error) {
        console.error('Error loading user profiles:', error);
        return;
      }

      // Update user profiles state
      const newUserProfiles = { ...userProfiles };
      data.forEach(profile => {
        newUserProfiles[profile.id] = profile;
      });
      setUserProfiles(newUserProfiles);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  };

  // Load messages from database for the specific channel
  useEffect(() => {
    if (!channelId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages?channelId=${channelId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.messages);
        
        // Load user profiles for all messages
        const userIds = data.messages
          .map((msg: Message) => msg.user_id)
          .filter((id: string | null) => id !== null);
        await loadUserProfiles(userIds);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages for this channel
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          // Get user profile for the new message from cache or fetch if needed
          const userId = payload.new.user_id;
          let userProfile = userProfiles[userId];
          
          if (userId && !userProfile) {
            // Load the user profile if not in cache
            loadUserProfiles([userId]);
            // Use temporary display while loading
            userProfile = {
              id: userId,
              username: 'Loading...',
              avatar_url: null,
              character_class: null
            };
          }
          
          const newMessage = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            message_type: payload.new.message_type,
            created_at: payload.new.created_at,
            username: userProfile ? userProfile.username : 'Unknown',
            avatar_url: userProfile ? userProfile.avatar_url : null,
            character_class: userProfile ? userProfile.character_class : null,
            reactions: []
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userProfiles]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim() || !channelId) return;

    try {
      // Parse command if it starts with /
      if (inputValue.startsWith('/')) {
        const [command, ...args] = inputValue.slice(1).split(' ');
        
        switch (command.toLowerCase()) {
          case 'me':
            // Action command
            await fetch('/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channelId,
                content: args.join(' '),
                messageType: 'action'
              }),
            });
            break;
            
          case 'roll':
            // Dice roll command
            const diceNotation = args[0] || '1d20';
            const rollResult = rollDice(diceNotation);
            await fetch('/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channelId,
                content: `${diceNotation} = ${rollResult}`,
                messageType: 'dice_roll'
              }),
            });
            break;
            
          case 'help':
            // Help command
            await fetch('/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channelId,
                content: 'Available commands: /me [action], /roll [XdY], /help',
                messageType: 'system'
              }),
            });
            break;
            
          default:
            // Unknown command
            await fetch('/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channelId,
                content: `Unknown command: /${command}. Type /help for available commands.`,
                messageType: 'system'
              }),
            });
        }
      } else {
        // Regular chat message
        await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId,
            content: inputValue,
            messageType: 'chat'
          }),
        });
      }
      
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Simple dice rolling function
  const rollDice = (notation: string): number => {
    const match = notation.match(/(\d+)d(\d+)/i);
    if (!match) return 0;
    
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    
    return total;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message styling based on type
  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'action':
        return 'text-purple-400 italic';
      case 'dice_roll':
        return 'text-yellow-400';
      case 'system':
        return 'text-cyan-400';
      default:
        return 'text-green-300';
    }
  };

  // Get user display name with class
  const getUserDisplay = (message: Message) => {
    if (message.message_type === 'system') {
      return 'SYSTEM';
    }
    
    if (message.message_type === 'dice_roll' || message.message_type === 'action') {
      return message.username;
    }
    
    return message.character_class 
      ? `${message.username} (${message.character_class})` 
      : message.username;
  };

  if (!channelId) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
        <div className="bg-gray-700 px-4 py-2 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="ml-4 text-sm font-mono">
            NeoRealm Terminal v0.1.0
          </div>
        </div>
        
        <div className="p-4 font-mono text-sm flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            Select a channel to start chatting
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="bg-gray-700 px-4 py-2 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-sm font-mono">
          {channelName ? `#${channelName}` : 'NeoRealm Terminal v0.1.0'}
        </div>
      </div>
      
      <div className="p-4 font-mono text-sm flex-1 flex flex-col">
        <div className="mb-4 flex-1 overflow-y-auto bg-gray-900 p-2 rounded">
          {loading ? (
            <div className="text-gray-500 text-center">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 text-center italic">
              No messages yet. Be the first to send a message!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="mb-3">
                <div className="flex items-start">
                  <span className={getMessageStyle(message.message_type)}>
                    [{formatTime(message.created_at)}] {getUserDisplay(message)}:
                  </span>
                </div>
                <div className={`ml-4 ${message.message_type === 'action' ? 'italic' : ''}`}>
                  {message.content}
                </div>
                {message.message_type === 'chat' && (
                  <EnergyReaction 
                    messageId={message.id} 
                    userId={profile.id}
                    reactions={message.reactions || []}
                  />
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="mt-4 flex">
          <span className="text-green-400 mr-2">&gt;</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-900 text-white font-mono focus:outline-none"
            placeholder="Type your message or command..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1 rounded transition duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}