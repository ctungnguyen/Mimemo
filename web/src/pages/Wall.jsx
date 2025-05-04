import React from 'react';

// import background from '../assets/wall/background-blue.png';
import frame      from '../assets/wall/wall.png';
import eyeIcon    from '../assets/wall/eye.svg';


import "../css/Wall.css";
import { Link, Outlet } from 'react-router-dom';

function Wall() {

  return (
    <>
      {/* background */}
      {/* <img src={background} alt="background" className="wall-bg" /> */}

      {/* header */}
      <header className="wall-header">
        <div className="header-left">logo</div>
        <div className="header-center">emquyttt’s wall</div>
        <Link to="/wall/edit" className="header-icon right"><img src={eyeIcon} alt="view" className="header-eye" /> </Link>
      </header>

      {/* framed cork board */}
      <div className="wall-frame-container">
        <img src={frame} alt="wall frame" className="wall-frame" />
        {/* pins/stickers will go here */}
        <div className="pins">
          {/* example:
            <img src={someSticker} className="pin" style={{ top: 50, left: 100 }} />
          */}
        </div>
      </div>

      {/* footer ticker */}
      <footer className="wall-footer">
        decorate your wall ! ^^ decorate your wall ! ^^ decorate your wall ! ^^ 
      </footer>

      <Outlet />
    </>
  )
}

export default Wall
