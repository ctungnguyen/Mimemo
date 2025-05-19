import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import blue_background from '../assets/photobooth/blue-mac-book-pro-143.png';
import pink_background from '../assets/photobooth/pink-mac-book-pro-143.png';
import beige_background from '../assets/photobooth/beige-mac-book-pro-143.png';
import black_background from '../assets/photobooth/black-mac-book-pro-143.png';
import "../css/Photobooth.css";

import NotebookList from '../components/NotebookList';
import Wall from '../pages/Wall.jsx';
import ChangeBgColor from '../components/ChangeBgColor';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path if needed

function PreviewPhoto() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const backgrounds = [blue_background, pink_background, beige_background, black_background];

  const { capturedImages, selectedFrame, frameMode, bgIndex: initialBgIndex  = 0 } = location.state || {};
  
  const [bgIndex, setBgIndex] = useState(initialBgIndex);
  const [combinedImg, setCombinedImg] = useState(null);

  const handleChangeBackground = () => {
    setBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
  };

  const retakePhoto = () => {
    navigate(`/${userId}/photobooth`, { state: { reset: true, bgIndex } });
  };

  useEffect(() => {
    document.body.classList.add('preview-lock-scroll');
    return () => {
      document.body.classList.remove('preview-lock-scroll');
      document.body.classList.remove('preview-scroll-enabled');
    };
  }, []);

  const savePhoto = async () => {
    if (!userId) {
      alert('User ID missing!');
      return;
    }

    const imageToSave = combinedImg || (capturedImages && capturedImages[0]);

    if (!imageToSave) {
      alert('No image to save!');
      return;
    }

    try {
      const libraryRef = collection(db, 'walls', userId, 'library');
      await addDoc(libraryRef, {
        src: imageToSave,
      });

      document.body.classList.remove('preview-lock-scroll');
      document.body.classList.add('preview-scroll-enabled');
      window.scrollTo({ top: document.body.scrollHeight / 2.3, behavior: 'smooth' });

      alert('Image saved to library! You can now add it to your notebook.');

      // Optionally, you can refresh or navigate after saving here
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image.');
    }
  };

  useEffect(() => {
    if (frameMode === '4' && selectedFrame && capturedImages.length === 4) {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');

      const frameImg = new Image();
      frameImg.src = selectedFrame;

      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        const positions = [
          { x: 182, y: 55,  w: 285, h: 104 },
          { x: 182, y: 192, w: 285, h: 104 },
          { x: 182, y: 331, w: 285, h: 104 },
          { x: 182, y: 468, w: 285, h: 104 },
        ];

        let loaded = 0;
        capturedImages.forEach((src, i) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            ctx.drawImage(img, positions[i].x, positions[i].y, positions[i].w, positions[i].h);
            loaded++;
            if (loaded === 4) {
              const result = canvas.toDataURL('image/png');
              setCombinedImg(result);
            }
          };
        });
      };
    }
  }, [capturedImages, selectedFrame, frameMode]);

  return (
    <>
      <img src={backgrounds[bgIndex]} alt="background" className="preview_background" />

      <ChangeBgColor
        backgrounds={backgrounds}
        bgIndex={bgIndex}
        onChange={handleChangeBackground}
      />

      <div className="preview-photo-wrapper">
        {frameMode === '4' && combinedImg ? (
          <img src={combinedImg} alt="Combined Preview" className="preview-photo" />
        ) : selectedFrame && frameMode === '4' ? (
          <div className="frame-overlay preview-frame-overlay">
            <img src={selectedFrame} alt="Selected Frame" className="selected-frame" />
            {[0, 1, 2, 3].map(i =>
              capturedImages[i] ? (
                <img
                  key={i}
                  src={capturedImages[i]}
                  alt={`Captured ${i + 1}`}
                  className={`captured-image captured-image-${i}`}
                />
              ) : null
            )}
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
              <img src={capturedImages[0]} alt="Captured" className="preview-photo" />
            ) : (
              <p>No images available</p>
            )}
          </>
        )}
      </div>

      <div className="confirm-box">
        <p>Do you want to save it?</p>
        <div className="confirm-buttons">
          <button onClick={savePhoto} className="confirm-yes">Yes, save it</button>
          <button onClick={retakePhoto} className="confirm-retake">Retake photo</button>
        </div>
      </div>

      <div className="notebook-list-container">
        <NotebookList
          capturedImages={capturedImages}
          selectedFrame={selectedFrame}
          frameMode={frameMode}
          bgIndex={bgIndex}
          finalImage={combinedImg} // pass combined image to NotebookList
        />
      </div>

      <Wall hideBgColorUI={true} bgIndex={bgIndex} />
    </>
  );
}

export default PreviewPhoto;
