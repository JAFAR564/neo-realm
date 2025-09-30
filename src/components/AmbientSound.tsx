'use client';

import { useEffect } from 'react';
import { soundManager } from '@/lib/SoundManager';

const AmbientSound = () => {
  useEffect(() => {
    soundManager.playSound('ambient');
  }, []);

  return null;
};

export default AmbientSound;
