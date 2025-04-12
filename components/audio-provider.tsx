"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface AudioContextType {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

const AudioContext = createContext<AudioContextType>({
  audioEnabled: false,
  setAudioEnabled: () => {},
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle audio playback
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio("/3am-in-a-deserted-spaceport-17456.mp3");
      audioRef.current.volume = 0.2;
      audioRef.current.loop = true;
    }
    
    // Play or pause based on audioEnabled state
    if (audioEnabled) {
      const playPromise = audioRef.current.play();
      
      // Handle play promise to avoid uncaught promise errors
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback failed:", error);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioEnabled]);

  return (
    <AudioContext.Provider value={{ audioEnabled, setAudioEnabled }}>
      {children}
    </AudioContext.Provider>
  );
}
