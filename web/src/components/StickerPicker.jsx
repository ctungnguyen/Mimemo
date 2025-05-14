import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import '../css/StickerPicker.css';

const modules = import.meta.glob(
  '../assets/sticker/*.{png,jpg,svg}',
  { eager: true, import: 'default' }
);
const allStickers = Object.values(modules);

export default function StickerPicker({ bounds = '.notebook-area' }) {
  const [activeSticker, setActiveSticker] = useState(null);
  const stickerRef = useRef(null);

  return (
    <>
      <div className="sticker-picker">
        {allStickers.map((src, i) => (
          <img
            key={i}
            src={src}
            className="sticker-thumb"
            onClick={e => {
              e.stopPropagation();
              setActiveSticker(src); // Select sticker to be draggable
            }}
            alt="sticker thumb"
          />
        ))}
      </div>

      {activeSticker && (
        <Draggable bounds={bounds} nodeRef={stickerRef}>
          <img
            ref={stickerRef}
            src={activeSticker}
            className="sticker-draggable"
            onDoubleClick={e => {
              e.stopPropagation();
              setActiveSticker(null); // Remove sticker when double clicked
            }}
            alt="sticker"
          />
        </Draggable>
      )}
    </>
  );
}
