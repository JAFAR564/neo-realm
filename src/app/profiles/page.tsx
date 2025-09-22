"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  character_class: string | null;
  bio: string | null;
  created_at: string;
};

type ProfileWithFollowers = Profile & {
  followers?: any[];
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load all profiles
  useEffect(() => {
    if (user) {
      const loadProfiles = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setProfiles(data || []);
        } catch (err: any) {
          setError(err.message || 'Error loading profiles');
        } finally {
          setLoading(false);
        }
      };

      loadProfiles();
    }
  }, [user]);

  // Toggle follow status
  const toggleFollow = async (profileId: string) => {
    if (!user) return;

    try {
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFollow) {
        // Unfollow
        const { error: deleteError } = await supabase
          .from('followers')
          .delete()
          .eq('id', existingFollow.id);

        if (deleteError) throw deleteError;
      } else {
        // Follow
        const { error: insertError } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: profileId
          });

        if (insertError) throw insertError;
      }

      // Refresh profiles to update follow status
      const { data: updatedProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProfiles(updatedProfiles || []);
    } catch (err: any) {
      setError(err.message || 'Error updating follow status');
    }
  };

  // Check if user is following a profile
  const isFollowing = (profileId: string) => {
    if (!user) return false;
    
    // This is a simplified check - in a real app, you would check against a list of followed profiles
    // For now, we'll just return false since we don't have the follower data
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">Character Profiles</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{profile.username}</h2>
                  {profile.character_class && (
                    <p className="text-cyan-400">{profile.character_class}</p>
                  )}
                </div>
              </div>
              
              <p className="mb-4 text-gray-300">
                {profile.bio || 'No bio available.'}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
                
                {user && user.id !== profile.id && (
                  <button
                    onClick={() => toggleFollow(profile.id)}
                    className={`px-4 py-2 rounded font-medium transition duration-200 ${
                      isFollowing(profile.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    }`}
                  >
                    {isFollowing(profile.id) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}