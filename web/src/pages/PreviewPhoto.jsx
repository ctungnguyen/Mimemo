import React from 'react';
import { Link } from 'react-router-dom';


import background from '../assets/photobooth/after-photo.png';
import "../css/Photobooth.css";

function PreviewPhoto() {
  

    return (
      <>
        <img src={background} className="tp-bg" alt="background" />
      </>
    )
  }
  
  export default PreviewPhoto
  