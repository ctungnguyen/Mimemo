import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/photobooth/blue-mac-book-pro-143.png';
import "../css/Photobooth.css";

import NotebookList from '../components/NotebookList';
import Wall from '../pages/Wall.jsx'

function PreviewPhoto() {
  const location = useLocation();
  const navigate = useNavigate();

  const { capturedImages, selectedFrame, frameMode } = location.state || {};

  // Reset and go back to photobooth with empty images
  const retakePhoto = () => {
    navigate('/photobooth', { state: { reset: true } });
  };

  // Scroll to bottom
  const savePhoto = () => {
    window.scrollTo({ top: document.body.scrollHeight/2.8, behavior: 'smooth' });
  };

  return (
    <>
      {/* Background Image */}
      <img src={background} alt="background" className="preview_background" />

      <div className="preview-photo-wrapper">
        {selectedFrame && frameMode === '4' ? (
          <div className="frame-overlay preview-frame-overlay">
            <img src={selectedFrame} alt="Selected Frame" className="selected-frame" />
            {[0, 1, 2, 3].map(i => (
              capturedImages[i] ? (
                <img
                  key={i}
                  src={capturedImages[i]}
                  alt={`Captured ${i + 1}`}
                  className={`captured-image captured-image-${i}`}
                />
              ) : null
            ))}
          </div>
        ) : selectedFrame && frameMode === '1' ? (
          <div className="frame-overlay preview-frame-overlay">
            <img src={selectedFrame} alt="Selected Frame" className="selected-frame" />
            {capturedImages[0] && (
              <img src={capturedImages[0]} alt="Captured" className="captured-image-single" />
            )}
          </div>
        ) : (
          <>
            {capturedImages && capturedImages.length > 0 ? (
              frameMode === '4' ? (
                <div className="captured-images-container">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="captured-image">
                      <img src={image} alt={`Captured ${index + 1}`} className="preview-photo" />
                    </div>
                  ))}
                </div>
              ) : (
                <img src={capturedImages[0]} alt="Captured" className="preview-photo" />
              )
            ) : (
              <p>No images available</p>
            )}
          </>
        )}
      </div>

      {/* Red confirmation box */}
      <div className="confirm-box">
        <p>Do you want to save it?</p>
        <div className="confirm-buttons">
          <button onClick={savePhoto} className="confirm-yes">Yes, save it</button>
          <button onClick={retakePhoto} className="confirm-retake">Retake photo</button>
        </div>
      </div>

      <div className="notebook-list-container">
        <NotebookList />
      </div>

      <Wall />
    </>

  
  );
}

export default PreviewPhoto;
