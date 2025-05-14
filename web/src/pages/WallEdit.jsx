import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import frame       from '../assets/wall/wall.png';
import backIcon    from '../assets/wall/eye-off.svg';
import stickerOff  from '../assets/wall/sticker.svg';
import stickerOn   from '../assets/wall/sticker-on.svg';
import background from '../assets/wall/vector-4.png';

import StickerPicker from '../components/StickerPicker';
import "../css/Wall.css";

export default function WallEdit() {
  const [showStickers, setShowStickers] = useState(false);

  // Toggle Sticker Picker visibility
  function selectStickers() {
    setShowStickers(s => !s);
  }

  return (
    <div className="wall-page edit-mode">
      <img src={background} className="wall-bg" alt="background" />
      <header className="wall-header">
        <div className="header-left">
          <img
            src={showStickers ? stickerOn : stickerOff}
            alt="toggle stickers"
            className="header-icon"
            onClick={selectStickers} // Toggle stickers visibility
          />
        </div>
        <div className="header-center">edit your wall</div>
        <div className="header-right">
          <Link to="/wall">
            <img src={backIcon} alt="back to view" className="header-icon"/>
          </Link>
        </div>
      </header>

      <div className="wall-frame-container edit-area">
        <img src={frame} alt="wall frame edit-area" className="wall-frame"/>
          {/* Show the StickerPicker when stickersOn is true */}
          {showStickers && <StickerPicker bounds=".edit-area" />}
      </div>

      <footer className="wall-footer">
        drag &amp; drop stickers, then switch back to view →
      </footer>
    </div>
  );
}
