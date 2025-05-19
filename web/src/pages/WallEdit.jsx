import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from "../firebase";

import frame from '../assets/wall/wall.png';
import libraryFrame from '../assets/wall/wall.png';
import backIcon from '../assets/wall/eye-off.svg';
import stickerOff from '../assets/wall/sticker.svg';
import stickerOn from '../assets/wall/sticker-on.svg';
import lib from '../assets/wall/add-circle.svg';
import libOn from '../assets/wall/add-circle-active.svg';

import blueBg from '../assets/wall/vector-blue.png';
import pinkBg from '../assets/wall/vector-pink.png';
import beigeBg from '../assets/wall/vector-beige.png';
import blackBg from '../assets/wall/vector-black.png';

import StickerPicker from '../components/StickerPicker';
import ChangeBgColor from '../components/ChangeBgColor';
import { Rnd } from 'react-rnd';

import ResizableElement from '../components/ResizableElement';

import "../css/Wall.css";

import { useParams } from 'react-router-dom';

export default function WallEdit() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const backgrounds = [blueBg, pinkBg, beigeBg, blackBg];

  const initialBgIndex = location.state?.bgIndex ?? 0;
  const [bgIndex, setBgIndex] = useState(initialBgIndex);
  const backgroundImage = backgrounds[bgIndex];

  const [showStickers, setShowStickers] = useState(false);
  const [libraryMode, setLibraryMode] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);

  const [stickersOnWall, setStickersOnWall] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);

  // Load stickers and library images from Firestore on mount
  useEffect(() => {
    async function fetchWallData() {
      if (!userId) return;
      // Load stickers
      const stickersCol = collection(db, 'walls', userId, 'stickers');
      const stickersSnap = await getDocs(stickersCol);
      const loadedStickers = stickersSnap.docs.map(doc => doc.data());
      setStickersOnWall(loadedStickers);

      // Load library images
      const libraryCol = collection(db, 'walls', userId, 'library');
      const librarySnap = await getDocs(libraryCol);
      const loadedLibrary = librarySnap.docs.map(doc => doc.data());
      setLibraryImages(loadedLibrary);
    }
    fetchWallData();
  }, [userId]);

  const handleChangeBackground = () => {
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
  };

  const toggleLibrary = () => {
    setLibraryMode(l => !l);
    if (!libraryMode) setShowStickers(false);
  };

  const toggleStickers = () => {
    setShowStickers(s => !s);
    if (!showStickers) setLibraryMode(false);
  };

  // Save sticker to Firestore and state
  const addStickerToWall = async (sticker) => {
    if (!userId) return;
    const stickerDocRef = doc(db, 'walls', userId, 'stickers', String(sticker.id));
    await setDoc(stickerDocRef, sticker);
    setStickersOnWall(prev => [...prev, sticker]);
  };

  // Add sticker from picker
  const handleAddSticker = (src) => {
    const id = Date.now();
    const newSticker = { id, src, x: 50, y: 50, width: 100, height: 100, rotation: 0 };
    addStickerToWall(newSticker);
    setShowStickers(false);
  };

  // Move library image to wall as sticker
  const moveLibraryImageToWall = (image) => {
    const id = Date.now();
    const sticker = { id, src: image.src, x: 50, y: 50, width: 100, height: 100, rotation: 0 };
    addStickerToWall(sticker);
  };

  // Update sticker position/size/rotation on drag, resize or rotate
  const updateSticker = async (updatedSticker) => {
    if (!userId) return;
    setStickersOnWall(prev =>
      prev.map(s => (s.id === updatedSticker.id ? updatedSticker : s))
    );
    const stickerDocRef = doc(db, 'walls', userId, 'stickers', String(updatedSticker.id));
    await setDoc(stickerDocRef, updatedSticker);
  };

  // Delete sticker from state and Firestore
  const deleteSticker = async (id) => {
    setStickersOnWall(prev => prev.filter(s => s.id !== id));
    if (!userId) return;
    const stickerDocRef = doc(db, 'walls', userId, 'stickers', String(id));
    await deleteDoc(stickerDocRef);
  };

  return (
    <div className="wall-page edit-mode">
      <img src={backgroundImage} className="wall-bg" alt="background" />

      <ChangeBgColor
        backgrounds={backgrounds}
        bgIndex={bgIndex}
        onChange={handleChangeBackground}
      />

      <header className="wall-header">
        <div className="header-left">
          <img
            src={showStickers ? stickerOn : stickerOff}
            alt="toggle stickers"
            className="header-icon"
            onClick={toggleStickers}
          />
          <img
            src={libraryMode ? libOn : lib}
            alt="toggle library"
            className="header-icon"
            onClick={toggleLibrary}
          />
        </div>
        <div className="header-center">edit your wall</div>
        <div className="header-right">
          <Link to={`/${userId}/wall`} state={{ bgIndex }}>
            <img src={backIcon} alt="back to view" className="header-icon" />
          </Link>
        </div>
      </header>

      <div className="wall-frame-container edit-area">
        <img
          src={libraryMode ? libraryFrame : frame}
          alt="wall frame edit-area"
          className="wall-frame"
        />

        {showStickers && <StickerPicker bounds=".edit-area" addSticker={handleAddSticker} />}

        {libraryMode && (
          <div className="library-images">
            {libraryImages.map((img, idx) => (
              <img
                key={idx}
                src={img.src}
                alt="library"
                className={`library-image library-image-${idx}`}
                onClick={() => moveLibraryImageToWall(img)}
              />
            ))}
          </div>
        )}

        {/* Render stickers with react-rnd and ResizableElement */}
        {stickersOnWall.map(({ id, src, x, y, width, height, rotation }) => {
          const isSelected = selectedStickerId === id;
          return (
            <Rnd
              key={id}
              size={{ width, height }}
              position={{ x, y }}
              bounds=".edit-area"
              onDragStop={(e, d) => {
                updateSticker({ id, src, x: d.x, y: d.y, width, height, rotation });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateSticker({
                  id,
                  src,
                  x: position.x,
                  y: position.y,
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  rotation,
                });
              }}
              style={{ transform: `rotate(${rotation}deg)`, position: 'absolute', cursor: 'move' }}
              enableResizing={{
                top: true, right: true, bottom: true, left: true,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
              }}
              onClick={() => setSelectedStickerId(id)}
            >
              <ResizableElement
                id={id}
                src={src}
                isSelected={isSelected}
                onSelect={(clickedId) => setSelectedStickerId(clickedId)}
                style={{ width: '100%', height: '100%' }}
                rotation={rotation}
                onResize={() => { /* handled by Rnd */ }}
                onRotate={(deg) => {
                  updateSticker({ id, src, x, y, width, height, rotation: deg });
                }}
                onDelete={() => {
                  deleteSticker(id);
                  if (selectedStickerId === id) setSelectedStickerId(null);
                }}
              />
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}
