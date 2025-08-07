import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc,getDoc, onSnapshot } from 'firebase/firestore';
import { db } from "../firebase"; // adjust path if needed

import frame from '../assets/wall/wall.png';
import eyeIcon from '../assets/wall/eye.svg';

import blueBg from '../assets/wall/vector-blue.png';
import pinkBg from '../assets/wall/vector-pink.png';
import beigeBg from '../assets/wall/vector-beige.png';
import blackBg from '../assets/wall/vector-black.png';

import logo from '../assets/logo.svg';

import ChangeBgColor from '../components/ChangeBgColor';

import "../css/Wall.css";
import { useParams } from 'react-router-dom';

export default function Wall({ hideBgColorUI = false, bgIndex: bgIndexProp }) {
  const { userId } = useParams();

  const navigate = useNavigate();


  const location = useLocation();
  const backgrounds = [blueBg, pinkBg, beigeBg, blackBg];

  const initialBgIndex = bgIndexProp !== undefined ? bgIndexProp : (location.state?.bgIndex ?? 0);
  const [bgIndex, setBgIndex] = useState(initialBgIndex);

    const [stickers, setStickers] = useState([]);

    useEffect(() => {
  if (!userId) return;

  // Define stickers collection reference
  const stickersCol = collection(db, 'walls', userId, 'stickers');

  // Set up listener with onSnapshot
  const unsubscribe = onSnapshot(stickersCol, (snapshot) => {
    const loadedStickers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Wall stickers updated:", loadedStickers);
    setStickers(loadedStickers);
  });

  // Cleanup function to unsubscribe on unmount or userId change
  return () => unsubscribe();
}, [userId]);


  // Add this effect to sync state when prop changes
  useEffect(() => {
    if (bgIndexProp !== undefined && bgIndexProp !== bgIndex) {
      setBgIndex(bgIndexProp);
    }
  }, [bgIndexProp]);


  const [username, setUsername] = useState('');

useEffect(() => {
  async function fetchUsername() {
    if (!userId) return;
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      setUsername(userDoc.data().username);
    } else {
      setUsername('Unknown user');
    }
  }
  fetchUsername();
}, [userId]);



  const handleChangeBackground = () => {
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
  };

  return (
    <div className="wall-page">
      <img src={backgrounds[bgIndex]} className="wall-bg" alt="background" />
      
      {!hideBgColorUI && (
        <ChangeBgColor
          backgrounds={backgrounds}
          bgIndex={bgIndex}
          onChange={handleChangeBackground}
        />
      )}

      <header className="wall-header">
        <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="MiMeMo logo" className="logo" />
        </div>
        <div className="header-center">{username ? `${username}'s wall` : 'Loading...'}</div>
        <div className="header-right">
          <Link to={`/${userId}/wall/edit`} state={{ bgIndex }}>
            <img src={eyeIcon} alt="edit" className="header-icon" />
          </Link>
        </div>
      </header>

      <div className="wall-frame-container">
        <img src={frame} alt="wall frame" className="wall-frame" />
        {stickers.map(({ id, src, x, y, width = 100, height = 100, rotation = 0 }) => {
          console.log(`Rendering sticker ${id} with src:`, src);
          return (
            <img
              key={id}
              src={src}
              alt="sticker"
              className="wall-sticker"
              style={{
                position: 'absolute',
                top: y,
                left: x,
                width,
                height,
                transform: `rotate(${rotation}deg)`,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
      

      <footer className="wall-footer">
        decorate your wall ! ^^ decorate your wall ! ^^ decorate your wall ! ^^
      </footer>
    </div>
  );
}
