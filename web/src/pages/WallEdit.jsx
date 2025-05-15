import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import frame       from '../assets/wall/wall.png';
import backIcon    from '../assets/wall/eye-off.svg';
import stickerOff  from '../assets/wall/sticker.svg';
import stickerOn   from '../assets/wall/sticker-on.svg';
import background from '../assets/wall/vector-4.png';

import StickerPicker from '../components/StickerPicker';
import Draggable from 'react-draggable';

import "../css/Wall.css";

export default function WallEdit() {
  const [showStickers, setShowStickers] = useState(false);
  const [stickersOnWall, setStickersOnWall] = useState([]);

  // Maintain refs for stickers (for Draggable)
  const stickerRefs = useRef({});

  // Toggle Sticker Picker visibility
  function selectStickers() {
    setShowStickers(s => !s);
  }

  // Callback for StickerPicker to add a new sticker
  function handleAddSticker(src) {
    const id = Date.now();
    stickerRefs.current[id] = React.createRef();
    setStickersOnWall(prev => [...prev, { id, src, x: 50, y: 50 }]);
    setShowStickers(false); // Optionally close picker after adding
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
            onClick={selectStickers}
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

        {/* Show StickerPicker when toggled, pass callback */}
        {showStickers && <StickerPicker bounds=".edit-area" addSticker={handleAddSticker} />}

        {/* Render draggable stickers */}
        {stickersOnWall.map(({ id, src, x, y }) => (
          <Draggable
            key={id}
            nodeRef={stickerRefs.current[id]}
            bounds=".edit-area"
            defaultPosition={{ x, y }}
          >
            <img
              ref={stickerRefs.current[id]}
              src={src}
              className="sticker-draggable"
              alt="sticker"
              onDoubleClick={e => {
                e.stopPropagation();
                setStickersOnWall(stickersOnWall.filter(s => s.id !== id));
              }}
              style={{ position: 'absolute', cursor: 'move', userSelect: 'none' }}
            />
          </Draggable>
        ))}
      </div>

      <footer className="wall-footer">
        drag &amp; drop stickers, then switch back to view →
      </footer>
    </div>
  );
}
