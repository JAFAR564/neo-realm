'use client';

import { useState, useEffect } from 'react';
import styles from './BootupSequence.module.css';

const BootupSequence = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);

  const bootupLines = [
    'NEOREALM OS v2.7.3',
    '(c) 2025 AetherCorp Systems',
    'Booting from /dev/sda1',
    'Initializing kernel...',
    'Loading drivers...',
    'Mounting filesystems...',
    'Starting services...',
    'Connecting to network...',
    'Authenticating user...',
    'Welcome, operator.',
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lines.length < bootupLines.length) {
        setLines((prevLines) => [...prevLines, bootupLines[lines.length]]);
      } else {
        setTimeout(() => setVisible(false), 1000);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [lines]);

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        {lines.map((line, index) => (
          <p key={index} className={styles.line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BootupSequence;
