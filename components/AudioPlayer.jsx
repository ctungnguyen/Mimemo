import React, { useEffect, useRef } from 'react';
import { useSound } from './SoundContext'; // ✅ Import sound context

function AudioPlayer({ src = '/audio/ambient.mp3', volume = 0.3, loop = true }) {
  const audioRef = useRef(null);
  const { isSoundOn } = useSound(); // ✅ Get global sound setting

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = loop;
    audio.muted = !isSoundOn;

    if (isSoundOn) {
      audio.play().catch(e => console.warn("Autoplay blocked:", e));
    } else {
      audio.pause();
    }
  }, [isSoundOn, volume, loop]);

  // If src changes, reload audio
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.load();
    if (isSoundOn) {
      audioRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
    }
  }, [src]);

  return (
    <audio ref={audioRef} src={src} preload="auto" />
  );
}

export default AudioPlayer;
