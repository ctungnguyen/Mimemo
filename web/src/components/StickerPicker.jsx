import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import '../css/StickerPicker.css';

const modules = import.meta.glob(
  '../assets/sticker/*.{png,jpg,svg}',
  { eager: true, import: 'default' }
);
const allStickers = Object.values(modules);

export default function StickerPicker({ bounds = '.notebook-area' }) {
  // Change activeSticker from a single value to an array of stickers added on the notebook
  const [stickersOnPage, setStickersOnPage] = useState([]);
  const stickerRefs = useRef({});

  // Close sticker picker panel should be controlled from parent, 
  // but we can notify parent via a callback or just add logic here to close on select.

  // We'll add a local state for showing sticker picker panel (or control externally if needed)
  const [showPicker, setShowPicker] = useState(true);

  const addSticker = (src) => {
    const id = Date.now();
    stickerRefs.current[id] = React.createRef();
    setStickersOnPage([...stickersOnPage, { id, src, x: 50, y: 50 }]);
    setShowPicker(false); // close picker after selecting sticker
  };

  return (
    <>
      {showPicker && (
        <div className="sticker-picker">
          {allStickers.map((src, i) => (
            <img
              key={i}
              src={src}
              className="sticker-thumb"
              onClick={e => {
                e.stopPropagation();
                addSticker(src);
              }}
              alt="sticker thumb"
            />
          ))}
        </div>
      )}

      {/* Render all stickers placed on notebook pages */}
      {stickersOnPage.map(({ id, src, x, y }) => (
        <Draggable
          key={id}
          nodeRef={stickerRefs.current[id]}
          bounds={bounds}
          defaultPosition={{ x, y }}
        >
          <img
            ref={stickerRefs.current[id]}
            src={src}
            className="sticker-draggable"
            onDoubleClick={e => {
              e.stopPropagation();
              // Remove sticker on double click
              setStickersOnPage(stickersOnPage.filter(s => s.id !== id));
            }}
            alt="sticker"
          />
        </Draggable>
      ))}
    </>
  );
}
