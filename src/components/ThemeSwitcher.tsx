'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const allThemes = ['neon-blade', 'netrunner', 'corpo-chic'];

const ThemeSwitcher = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('neon-blade');
  const [availableThemes, setAvailableThemes] = useState(['neon-blade', 'netrunner']);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (data && data.subscription_tier === 'premium') {
          setAvailableThemes(allThemes);
        }
      };

      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="theme-switcher">
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {availableThemes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
