'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ChannelList from './ChannelList';
import ChannelCreationModal from './ChannelCreationModal';

type Channel = {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'unlisted';
  member_count: number;
  created_at: string;
};

export default function ChannelSidebar({ 
  currentChannel, 
  onChannelSelect 
}: { 
  currentChannel: Channel | null; 
  onChannelSelect: (channel: Channel) => void; 
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch channels with debounce to prevent excessive API calls
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/channels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      
      const data = await response.json();
      setChannels(data.channels);
      setError(null);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version of fetchChannels
  const debouncedFetchChannels = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchChannels();
    }, 300); // 300ms debounce
    
    setDebounceTimer(timer);
  }, [fetchChannels, debounceTimer]);

  // Load channels on component mount
  useEffect(() => {
    fetchChannels();
    
    // Set up real-time subscription for channels with debounce
    const channel = supabase
      .channel('channels')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channels'
        },
        (payload) => {
          debouncedFetchChannels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channels'
        },
        (payload) => {
          debouncedFetchChannels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'channels'
        },
        (payload) => {
          debouncedFetchChannels();
        }
      )
      .subscribe();
    
    setRealtimeChannel(channel);
    
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [fetchChannels, realtimeChannel, debounceTimer, debouncedFetchChannels]);

  const handleCreateChannel = async (name: string, description: string, privacy: 'public' | 'private' | 'unlisted') => {
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, privacy }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create channel');
      }
      
      const newChannel = await response.json();
      setChannels([...channels, newChannel]);
      setIsCreateModalOpen(false);
      onChannelSelect(newChannel);
    } catch (err) {
      console.error('Error creating channel:', err);
      alert('Failed to create channel');
    }
  };

  return (
    <div className="bg-gray-800 w-64 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-cyan-400">Channels</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-400">Loading channels...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <ChannelList 
            channels={channels} 
            currentChannel={currentChannel} 
            onChannelSelect={onChannelSelect} 
          />
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded transition duration-200 flex items-center justify-center"
        >
          <span>+ Create Channel</span>
        </button>
      </div>
      
      <ChannelCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateChannel}
      />
    </div>
  );
}