"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfileCreation() {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if username is already taken
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingProfile && !existingProfileError) {
        throw new Error('Username is already taken');
      }

      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user?.id,
            username,
            avatar_url: avatarUrl,
            character_class: characterClass,
            bio
          }
        ]);

      if (insertError) throw insertError;

      // Redirect to main page after successful profile creation
      router.push('/');
    } catch (err: Error) {
      setError(err.message || 'Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  // Character classes for the dropdown
  const characterClasses = [
    'NetRunner',
    'Blade',
    'Mage',
    'Engineer',
    'Corp',
    'Nomad',
    'Media',
    'Fixer'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Create Your Character
        </h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="avatarUrl" className="block text-gray-300 mb-2">
              Avatar URL (optional)
            </label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="https://example.com/avatar.png"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="characterClass" className="block text-gray-300 mb-2">
              Character Class
            </label>
            <select
              id="characterClass"
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              <option value="">Select a class</option>
              {characterClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="bio" className="block text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={4}
              placeholder="Tell us about your character..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Character'}
          </button>
        </form>
      </div>
    </div>
  );
}