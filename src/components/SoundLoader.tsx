'use client';

import { useEffect } from 'react';
import { soundManager } from '@/lib/SoundManager';

const SoundLoader = () => {
  useEffect(() => {
    soundManager.loadSound('typing', '/sounds/typing.wav');
    soundManager.loadSound('notification', '/sounds/notification.wav');
    soundManager.loadSound('ambient', '/sounds/ambient.wav');
  }, []);

  return null;
};

export default SoundLoader;
