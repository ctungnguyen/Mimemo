import React from 'react';
import { Link } from 'react-router-dom';

import background from '../assets/photobooth/camera-mode-blue.png';
import clock from '../assets/photobooth/clock.svg';
import main_photo from '../assets/photobooth/main-photo.png';

import "../css/Photobooth.css";

function Photobooth() {

  return (
    <>
      {/* background */}
      <img src={background} alt="background" className="background" />

      

      {/* top bar: logo + clock + frame*/}
      <header className="header">
        <div className="left-side">
        <img  alt="logo" className="logo" />
        <img src={clock} alt="clock" className="clock" />
        </div>
        
        <div className="right-side">
          <p className="frame">frame</p>
        </div>
      </header>

      {/* left side prompt */}
      <p className="change-color">change background color?</p>

      {/* center content: main image + shutter button */}
      <div className="photobooth-content">
        <img
          src={main_photo}
          alt="preview"
          className="main-photo"
        />
        <Link to="/photobooth/preview_photo"><button className="take-photo-button" /></Link>
      </div>
    </>
  )
}

export default Photobooth
