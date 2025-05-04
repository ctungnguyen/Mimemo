import React, { useState } from 'react';
import { Link }     from 'react-router-dom';

import frame        from '../assets/wall/wall.png';
import backIcon     from '../assets/wall/eye-off.svg';    // swap icon
import stickerIcon  from '../assets/wall/sticker.svg';
import stickerIconOn from '../assets/wall/sticker-on.svg';

import StickerPicker from '../components/StickerPicker';
import "../css/Wall.css";

function WallEdit() {
    const [stickersOn, setStickersOn] = useState(false);

    return (
      <>
          <header className="wall-header">
        {/* back to view mode */}
        <Link to="/wall" className="header-icon left">
          <img src={backIcon} alt="back to view" />
        </Link>

        <div className="header-center">edit your wall</div>

        {/* toggle stickers */}
        <img
          src={stickersOn ? stickerIconOn : stickerIcon}
          alt="stickers"
          className="header-icon right"
          onClick={() => setStickersOn(on => !on)}
        />
      </header>

      <div className="wall-frame-container">
        <img src={frame} alt="wall frame" className="wall-frame" />

        <div className="pins">
          {stickersOn && <StickerPicker bounds=".pins" />}
          {/* here you can also render <TextTool /> or <BrushTool /> etc */}
        </div>
      </div>

      <footer className="wall-footer">
        drag & drop stickers, then switch back to view →  
      </footer>
      </>
    )
  }
  
  export default WallEdit
  