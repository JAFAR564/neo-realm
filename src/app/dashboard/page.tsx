"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  character_class: string | null;
  bio: string | null;
};

type Follower = {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_profile: {
    username: string;
  };
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load user profile and social data
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          // Load profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);

          // Load followers
          const { data: followersData, error: followersError } = await supabase
            .from('followers')
            .select(`
              id,
              follower_id,
              following_id,
              created_at,
              follower_profile:profiles!followers_follower_id_fkey(username)
            `)
            .eq('following_id', user.id);

          if (followersError) throw followersError;
          setFollowers(followersData || []);

          // Load following
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select(`
              id,
              follower_id,
              following_id,
              created_at,
              following_profile:profiles!followers_following_id_fkey(username)
            `)
            .eq('follower_id', user.id);

          if (followingError) throw followingError;
          setFollowing(followingData || []);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="mb-4">Please create your character profile to continue.</p>
          <Link 
            href="/profile" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username} 
                className="w-24 h-24 rounded-full object-cover mr-6 mb-4 md:mb-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mr-6 mb-4 md:mb-0">
                <span className="text-4xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-cyan-400">{profile.username}</h1>
              {profile.character_class && (
                <p className="text-xl text-purple-400">{profile.character_class}</p>
              )}
              <p className="mt-2 text-gray-300">
                {profile.bio || 'No bio available.'}
              </p>
              
              <div className="flex justify-center md:justify-start space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{following.length}</div>
                  <div className="text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{followers.length}</div>
                  <div className="text-gray-400">Followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Recent Activity</h2>
            <div className="text-gray-400 italic">
              Your recent activity will appear here.
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-center transition duration-200"
              >
                Enter Terminal
              </Link>
              <Link 
                href="/profiles" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center transition duration-200"
              >
                Browse Characters
              </Link>
              <Link 
                href="/profile" 
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center transition duration-200"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}