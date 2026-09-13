import { useState, useEffect } from 'react';
import { sounds } from './sound';

export function useSoundVolume() {
  const [soundState, setSoundState] = useState(() => ({
    volume: sounds.getVolume(),
    isMuted: sounds.isMuted,
    isAmbient: sounds.isAmbientPlaying
  }));

  useEffect(() => {
    return sounds.subscribe((state) => {
      setSoundState({ ...state });
    });
  }, []);

  const getAudioLabel = () => {
    if (soundState.isMuted || soundState.volume <= 0.05) return '🔇 Mute';
    if (soundState.volume <= 0.45) return '🔉 30%';
    if (soundState.volume <= 0.8) return '🔊 70%';
    return '🔊 100%';
  };

  return {
    volume: soundState.volume,
    isMuted: soundState.isMuted,
    isAmbient: soundState.isAmbient,
    audioLabel: getAudioLabel(),
    cycleVolume: () => sounds.cycleVolume(),
    setVolume: (v) => sounds.setVolume(v),
    toggleMute: () => sounds.toggleMute(),
    toggleAmbient: () => sounds.toggleAmbient()
  };
}
