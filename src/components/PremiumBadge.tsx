'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const PremiumBadge = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .single();

        if (data && data.subscription_tier === 'premium') {
          setIsPremium(true);
        }
      };

      fetchProfile();
    }
  }, [user]);

  if (!isPremium) {
    return null;
  }

  return (
    <span className="premium-badge" title="Premium User">⚡</span>
  );
};

export default PremiumBadge;
