"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TerminalChat from '@/components/terminal/TerminalChat';
import ChannelSidebar from '@/components/channels/ChannelSidebar';
import DebugLogViewer from '@/components/DebugLogViewer';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentChannel, setCurrentChannel] = useState(null);

  // Check if user has a profile
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          setProfileLoading(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            // If profile doesn't exist, redirect to profile creation
            if (error.code === 'PGRST116') {
              router.push('/profile');
            } else {
              console.error('Error fetching profile:', error);
            }
          } else {
            setProfile(data);
          }
        } catch (err) {
          console.error('Error:', err);
        } finally {
          setProfileLoading(false);
        }
      };

      fetchProfile();
    } else if (user === null && !authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load the default "General" channel when profile is loaded
  useEffect(() => {
    if (profile) {
      const fetchDefaultChannel = async () => {
        try {
          const response = await fetch('/api/channels');
          
          if (!response.ok) {
            throw new Error('Failed to fetch channels');
          }
          
          const data = await response.json();
          const generalChannel = data.channels.find((channel: any) => channel.name === 'General');
          
          if (generalChannel) {
            setCurrentChannel(generalChannel);
          }
        } catch (err) {
          console.error('Error fetching default channel:', err);
        }
      };

      fetchDefaultChannel();
    }
  }, [profile]);

  // Show loading state while checking auth and profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user has a profile, show the terminal interface with channels
  if (profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex">
        <ChannelSidebar 
          currentChannel={currentChannel} 
          onChannelSelect={setCurrentChannel} 
        />
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)]">
            {currentChannel ? (
              <TerminalChat 
                profile={profile} 
                channelId={currentChannel.id}
                channelName={currentChannel.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-500 mb-4">Select a channel to start chatting</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Show debug log viewer in development mode */}
        {process.env.NODE_ENV === 'development' && <DebugLogViewer />}
      </div>
    );
  }

  // Default landing page for users without profiles
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-cyan-400">NeoRealm</h1>
        <p className="text-xl mb-8">
          A gamified cyberpunk roleplay social platform
        </p>
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <p className="mb-4">
            Create your character profile to enter the NeoRealm.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            Create Character
          </button>
        </div>
      </div>
      {/* Show debug log viewer in development mode */}
      {process.env.NODE_ENV === 'development' && <DebugLogViewer />}
    </div>
  );
}
