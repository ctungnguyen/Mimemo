import React, { useEffect, useRef, useState } from 'react';

function AudioPlayer({ src = '/audio/ambient.mp3', volume = 0.3 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true); // try playing immediately
  const [muted, setMuted] = useState(true);     // start muted to allow autoplay

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;
    audio.muted = muted;

    if (playing) {
      audio.play().catch(e => {
        console.warn("Autoplay blocked:", e);
      });
    } else {
      audio.pause();
    }
  }, [playing, muted, volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.load();
    audioRef.current.play().catch(e => {
        console.warn("Autoplay blocked:", e);
    });
    }, [src]);

  useEffect(() => {
    // On first user interaction, unmute and play if currently playing
    function handleUserInteraction() {
      if (audioRef.current && muted) {
        audioRef.current.muted = false;
        setMuted(false);
        audioRef.current.play();
      }
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    }

    if (muted) {
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('keydown', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [muted]);

  const toggleAudio = () => {
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      if (muted) {
        // wait for user interaction to unmute
      }
    }
  };

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
      <button onClick={toggleAudio}>
        {playing ? '🔊 Playing' : '🔈 Muted'}
      </button>
      <audio ref={audioRef} src={src} preload="auto" />
    </div>
  );
}

export default AudioPlayer;
