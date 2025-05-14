import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import frame   from '../assets/wall/wall.png';
import eyeIcon from '../assets/wall/eye.svg';
import background from '../assets/wall/vector-4.png';

import "../css/Wall.css";

export default function Wall() {
  return (
    <div className="wall-page">
      <img src={background} className="wall-bg" alt="background" />
      <header className="wall-header">
        <div className="header-left">
          {/* no sticker toggle in view mode */}
          logo
        </div>
        <div className="header-center">emquyttt’s wall</div>
        <div className="header-right">
          <Link to="edit">
            <img src={eyeIcon} alt="edit" className="header-icon"/>
          </Link>
        </div>
      </header>

      <div className="wall-frame-container">
        <img src={frame} alt="wall frame" className="wall-frame"/>
        <div className="pins">
          {/* view‐only: no StickerPicker here */}
        </div>
      </div>

      <footer className="wall-footer">
        decorate your wall ! ^^ decorate your wall ! ^^ decorate your wall ! ^^
      </footer>

      {/* this is where /wall/edit will render */}
      <Outlet/>
    </div>
  );
}
