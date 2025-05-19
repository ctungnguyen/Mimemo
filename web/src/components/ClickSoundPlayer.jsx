import React, { useEffect, useRef } from 'react';
import clickSoundFile from '../audio/clicking.wav';

export default function ClickSoundPlayer() {
  const clickAudioRef = useRef(null);

  useEffect(() => {
    function playClickSound() {
      if (clickAudioRef.current) {
        // Reset and play sound on every click
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.play().catch(() => {});
      }
    }
    window.addEventListener('click', playClickSound);
    return () => window.removeEventListener('click', playClickSound);
  }, []);

  return <audio ref={clickAudioRef} src={clickSoundFile} preload="auto" />;
}
