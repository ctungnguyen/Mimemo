import React, { useEffect, useRef } from 'react';
import clickSound from '../audio/clicking.wav';
import { useSound } from './SoundContext.jsx';

function ClickSoundPlayer() {
  const audioRef = useRef(null);
  const { isSoundOn } = useSound();

  useEffect(() => {
    const handleClick = () => {
      if (!isSoundOn || !audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isSoundOn]); // Re-bind if sound toggles

  return <audio ref={audioRef} src={clickSound} preload="auto" />;
}

export default ClickSoundPlayer;
