'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  username: string;
};

const CharacterSwitcher = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfiles = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('user_id', user.id);

        if (data) {
          setProfiles(data);
          if (data.length > 0) {
            setCurrentProfile(data[0].id);
          }
        }
      };

      fetchProfiles();
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentProfile(e.target.value);
    // Here you would typically update the global state to reflect the new active profile
  };

  return (
    <div className="character-switcher">
      <select value={currentProfile || ''} onChange={handleProfileChange}>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CharacterSwitcher;
