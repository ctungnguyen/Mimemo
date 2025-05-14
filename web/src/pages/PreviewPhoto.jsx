import React from 'react';
import { useLocation } from 'react-router-dom';
import "../css/Photobooth.css";

function PreviewPhoto() {
  const location = useLocation();
  const { capturedImages, selectedFrame, frameMode } = location.state || {};

  // Debugging: Log to check what is received
  console.log("Captured Images: ", capturedImages);
  console.log("Selected Frame: ", selectedFrame);
  console.log("Frame Mode: ", frameMode);

  return (
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
          {/* If no frame selected or fallback */}
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

      <p>Frame Mode: {frameMode}</p>
    </div>
  );
}

export default PreviewPhoto;
