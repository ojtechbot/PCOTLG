
"use client"

import React, { createContext, useContext, useCallback, ReactNode } from 'react';

type SoundType = 'notification' | 'sendMessage';

interface SoundContextType {
  playSound: (sound: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const soundFiles: Record<SoundType, string> = {
  notification: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2c6a8a313c.mp3', // Simple notification
  sendMessage: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c6d1f3b2d1.mp3', // Pop sound
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {

  const playSound = useCallback((sound: SoundType) => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundFiles[sound]);
        audio.volume = 0.3; // Lowered volume slightly
        audio.play().catch(error => {
          if (error.name !== 'AbortError') {
            console.error(`Error playing sound '${sound}':`, error);
          }
        });
      } catch (e) {
          console.error("Failed to create or play audio:", e);
      }
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
