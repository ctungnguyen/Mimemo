import React, { createContext, useContext, useState } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const toggleSound = () => setIsSoundOn(prev => !prev);

  return (
    <SoundContext.Provider value={{ isSoundOn, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
