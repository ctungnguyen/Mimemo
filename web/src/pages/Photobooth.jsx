import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import background from '../assets/photobooth/camera-mode-blue.png';
import clock from '../assets/photobooth/clock.svg';
import pastel_frame from '../assets/photobooth/ptb-frame-12.png'; // your uploaded frame image
import purple_frame from '../assets/photobooth/purple-frame-1.png';
import pink_frame from '../assets/photobooth/pink-frame-1.png';

import "../css/Photobooth.css";

function Photobooth() {
  const videoRef = useRef(null);   // Hidden webcam video
  const canvasRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]; // One canvas per slot
  const captureCanvasRef = useRef(null);  // Canvas used for capturing photos
  const navigate = useNavigate();

  const [showFrameOptions, setShowFrameOptions] = useState(false);
  const [showSubFrameOptions, setShowSubFrameOptions] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [frameMode, setFrameMode] = useState('1'); // '1' or '4'
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [currentSlot, setCurrentSlot] = useState(0);

  // Start webcam stream once
  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }
    enableCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Draw webcam feed to all 4 canvases continuously (only for 4-frame mode)
  useEffect(() => {
    let animationFrameId;

    const drawVideoToCanvases = () => {
      if (frameMode === '4' && videoRef.current) {
        canvasRefs.forEach(ref => {
          const canvas = ref.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          }
        });
      }
      animationFrameId = requestAnimationFrame(drawVideoToCanvases);
    };

    if (frameMode === '4') {
      drawVideoToCanvases();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [frameMode]);

  const handleFrameModeSelection = (mode) => {
    setFrameMode(mode);
    setShowFrameOptions(true);
    setShowSubFrameOptions(mode === '4');
    setCapturedImages([null, null, null, null]);
    setCurrentSlot(0);
  };

  const handleFrameSelection = (frame) => {
    setSelectedFrame(frame);
    setShowFrameOptions(false);
    setShowSubFrameOptions(false);
    setCapturedImages([null, null, null, null]);
    setCurrentSlot(0);
  };

  const takePhoto = () => {
    const captureCanvas = captureCanvasRef.current;
    const ctx = captureCanvas.getContext('2d');

    if (frameMode === '1' && videoRef.current) {
      // Capture full camera for 1-frame mode
      captureCanvas.width = videoRef.current.videoWidth;
      captureCanvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
      const imageData = captureCanvas.toDataURL('image/png');
      setCapturedImages([imageData, null, null, null]);
      navigate('/photobooth/preview_photo', {
        state: { capturedImages: [imageData], selectedFrame, frameMode }
      });
    }

    if (frameMode === '4') {
      // Capture from the current slot's canvas
      const slotCanvas = canvasRefs[currentSlot].current;
      if (!slotCanvas) return;

      // Copy the current slot canvas to captureCanvas for image extraction
      captureCanvas.width = slotCanvas.width;
      captureCanvas.height = slotCanvas.height;
      ctx.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
      ctx.drawImage(slotCanvas, 0, 0);

      const imageData = captureCanvas.toDataURL('image/png');

      setCapturedImages(prev => {
        const newCaptured = [...prev];
        newCaptured[currentSlot] = imageData;
        return newCaptured;
      });

      const nextSlot = currentSlot + 1;
      setCurrentSlot(nextSlot);

      if (nextSlot === 4) {
        // All 4 captured, navigate to preview with all images
        navigate('/photobooth/preview_photo', {
          state: { capturedImages: [...capturedImages.slice(0, currentSlot), imageData], selectedFrame, frameMode }
        });
      }
    }
  };

  return (
    <>
      <img src={background} alt="background" className="background" />

      <header className="header">
        <div className="left-side">
          <img alt="logo" className="logo" />
          <img src={clock} alt="clock" className="clock" />
        </div>
        <div className="right-side">
          <p className="frame" onClick={() => setShowFrameOptions(o => !o)}>Frame</p>
          {showFrameOptions && (
            <div className="frame-dropdown">
              <p onClick={() => handleFrameModeSelection('1')}>1 Frame</p>
              <p onClick={() => handleFrameModeSelection('4')}>4 Frame</p>
            </div>
          )}
          {showSubFrameOptions && (
            <div className="frame-dropdown">
              <p onClick={() => handleFrameSelection(pastel_frame)}>Pastel Frame</p>
              <p onClick={() => handleFrameSelection(purple_frame)}>Purple Frame</p>
              <p onClick={() => handleFrameSelection(pink_frame)}>Pink Frame</p>
            </div>
          )}
        </div>
      </header>

      <p className="change-color">Change background color?</p>

      <div className="photobooth-content">
        {/* Hidden video element for webcam stream */}
        <video ref={videoRef} autoPlay playsInline muted style={{ display: frameMode === '1' ? 'block' : 'none' }} className="main-photo" />

        {frameMode === '4' && selectedFrame && (
          <div className="frame-overlay">
            <img src={selectedFrame} alt="frame" className="selected-frame" />

            {/* Four canvas elements for live webcam preview inside white squares */}
            {[0, 1, 2, 3].map(i => (
              <canvas
                key={i}
                ref={canvasRefs[i]}
                className={`video-slot video-slot-${i}`}
                width={350}  // Adjust according to your frame
                height={220} // Adjust according to your frame
              />
            ))}

            {/* Show captured images instead of live preview */}
            {[0, 1, 2, 3].map(i => (
              capturedImages[i] && (
                <img
                  key={`captured-${i}`}
                  src={capturedImages[i]}
                  alt={`Captured ${i + 1}`}
                  className={`captured-image captured-image-${i}`}
                />
              )
            ))}
          </div>
        )}

        {frameMode === '1' && selectedFrame && (
          <div className="frame-overlay">
            <img src={selectedFrame} alt="frame" className="selected-frame" />
            {capturedImages[0] && (
              <img src={capturedImages[0]} alt="Captured" className="captured-image-single" />
            )}
          </div>
        )}

        {/* Hidden canvas for capturing photos */}
        <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

        <button className="take-photo-button" onClick={takePhoto} />
      </div>
    </>
  );
}

export default Photobooth;
