import { useCallback, useRef } from 'react';

export const useBeepSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playBeep = useCallback((frequency: number = 1000, duration: number = 150) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      gainNode.gain.value = 0.3;
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Audio context may not be available
    }
  }, []);

  const startAlertBeeping = useCallback((intensity: 'low' | 'medium' | 'high') => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    const config = {
      low: { freq: 800, interval: 600, duration: 100 },
      medium: { freq: 1200, interval: 350, duration: 120 },
      high: { freq: 1800, interval: 150, duration: 80 },
    };
    const { freq, interval, duration } = config[intensity];
    playBeep(freq, duration);
    intervalRef.current = window.setInterval(() => playBeep(freq, duration), interval);
  }, [playBeep]);

  const stopAlertBeeping = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { playBeep, startAlertBeeping, stopAlertBeeping };
};
