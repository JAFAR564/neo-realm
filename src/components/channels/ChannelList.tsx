'use client';

import { useState } from 'react';

type Channel = {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'unlisted';
  member_count: number;
  created_at: string;
};

export default function ChannelList({ 
  channels, 
  currentChannel, 
  onChannelSelect 
}: { 
  channels: Channel[]; 
  currentChannel: Channel | null; 
  onChannelSelect: (channel: Channel) => void; 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return '🌐';
      case 'private':
        return '🔒';
      case 'unlisted':
        return '🕵️';
      default:
        return '🌐';
    }
  };

  return (
    <div className="p-2">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search channels..."
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-1">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            className={`p-2 rounded cursor-pointer transition duration-200 flex items-center justify-between ${
              currentChannel?.id === channel.id
                ? 'bg-cyan-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => onChannelSelect(channel)}
          >
            <div className="flex items-center">
              <span className="mr-2">{getPrivacyIcon(channel.privacy)}</span>
              <span className="truncate">{channel.name}</span>
            </div>
            <span className="text-xs bg-gray-600 rounded-full px-2 py-1">
              {channel.member_count}
            </span>
          </div>
        ))}
      </div>
      
      {filteredChannels.length === 0 && searchTerm && (
          <div className="text-gray-500 text-center py-4">
            No channels found matching &quot;{searchTerm}&quot;
          </div>
        )}
    </div>
  );
}