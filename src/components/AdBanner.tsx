'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const AdBanner = () => {
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

  if (isPremium) {
    return null;
  }

  return (
    <div className="ad-banner">
      <p>This is an advertisement. Upgrade to premium for an ad-free experience!</p>
    </div>
  );
};

export default AdBanner;
