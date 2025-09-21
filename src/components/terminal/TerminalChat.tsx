"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
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

export default function TerminalChat({ profile }: { profile: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from database
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Get messages with user profiles
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            user_id,
            content,
            message_type,
            created_at,
            profiles:profiles(id, username, avatar_url, character_class),
            reactions(*)
          `)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) throw messagesError;

        // Format messages with user data
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          user_id: msg.user_id,
          content: msg.content,
          message_type: msg.message_type,
          created_at: msg.created_at,
          username: (msg.profiles as UserProfile)?.username || 'Unknown',
          avatar_url: (msg.profiles as UserProfile)?.avatar_url || null,
          character_class: (msg.profiles as UserProfile)?.character_class || null,
          reactions: msg.reactions || []
        }));

        setMessages(formattedMessages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Get user profile for the new message
          supabase
            .from('profiles')
            .select('username, avatar_url, character_class')
            .eq('id', payload.new.user_id)
            .single()
            .then(({ data: userData, error: userError }) => {
              const newMessage = {
                id: payload.new.id,
                user_id: payload.new.user_id,
                content: payload.new.content,
                message_type: payload.new.message_type,
                created_at: payload.new.created_at,
                username: userError ? 'Unknown' : userData?.username || 'Unknown',
                avatar_url: userError ? null : userData?.avatar_url || null,
                character_class: userError ? null : userData?.character_class || null,
                reactions: []
              };
              
              setMessages(prev => [...prev, newMessage]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      // Parse command if it starts with /
      if (inputValue.startsWith('/')) {
        const [command, ...args] = inputValue.slice(1).split(' ');
        
        switch (command.toLowerCase()) {
          case 'me':
            // Action command
            await supabase.from('messages').insert([
              {
                user_id: profile.id,
                content: args.join(' '),
                message_type: 'action'
              }
            ]);
            break;
            
          case 'roll':
            // Dice roll command
            const diceNotation = args[0] || '1d20';
            const rollResult = rollDice(diceNotation);
            await supabase.from('messages').insert([
              {
                user_id: profile.id,
                content: `${diceNotation} = ${rollResult}`,
                message_type: 'dice_roll'
              }
            ]);
            break;
            
          case 'help':
            // Help command
            await supabase.from('messages').insert([
              {
                user_id: profile.id,
                content: 'Available commands: /me [action], /roll [XdY], /help',
                message_type: 'system'
              }
            ]);
            break;
            
          default:
            // Unknown command
            await supabase.from('messages').insert([
              {
                user_id: profile.id,
                content: `Unknown command: /${command}. Type /help for available commands.`,
                message_type: 'system'
              }
            ]);
        }
      } else {
        // Regular chat message
        await supabase.from('messages').insert([
          {
            user_id: profile.id,
            content: inputValue,
            message_type: 'chat'
          }
        ]);
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