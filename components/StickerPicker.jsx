import React from 'react';
import '../css/StickerPicker.css';

const modules = import.meta.glob(
  '../assets/sticker/*.{png,jpg,svg}',
  { eager: true, import: 'default' }
);
const allStickers = Object.values(modules);

export default function StickerPicker({ bounds = '.notebook-area', addSticker }) {
  return (
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
  );
}
