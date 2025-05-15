import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import background from '../assets/photobooth/camera-mode-blue.png';
import clock from '../assets/photobooth/clock.svg';
import pastel_frame from '../assets/photobooth/ptb-frame-12.png';
import purple_frame from '../assets/photobooth/purple-frame-1.png';
import pink_frame from '../assets/photobooth/pink-frame-1.png';

import "../css/Photobooth.css";

function Photobooth() {
  const videoRef = useRef(null);
  const canvasRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const captureCanvasRef = useRef(null);
  const navigate = useNavigate();

  const [showFrameOptions, setShowFrameOptions] = useState(false);
  const [showSubFrameOptions, setShowSubFrameOptions] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [frameMode, setFrameMode] = useState('1');
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [currentSlot, setCurrentSlot] = useState(0);

  // Timer dropdown visibility & countdown states
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);

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

  useEffect(() => {
    let timerId;
    if (countdownActive && countdownTime > 0) {
      timerId = setTimeout(() => {
        setCountdownTime(countdownTime - 1);
      }, 1000);
    } else if (countdownActive && countdownTime === 0) {
      // Time's up - take the photo
      setCountdownActive(false);
      takePhoto();
    }
    return () => clearTimeout(timerId);
  }, [countdownActive, countdownTime]);

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

    // FIX: Clear selected frame when switching back to 1-frame mode
    if (mode === '1') {
      setSelectedFrame(null);
    }
  };

  const handleFrameSelection = (frame) => {
    setSelectedFrame(frame);
    setShowFrameOptions(false);
    setShowSubFrameOptions(false);
    setCapturedImages([null, null, null, null]);
    setCurrentSlot(0);
  };

  // Trigger countdown or capture immediately if 0
  const onTakePhotoClick = () => {
    if (countdownTime > 0) {
      setCountdownActive(true);
      setShowTimerDropdown(false);
    } else {
      takePhoto();
    }
  };

  const takePhoto = () => {
    const captureCanvas = captureCanvasRef.current;
    const ctx = captureCanvas.getContext('2d');

    if (frameMode === '1' && videoRef.current) {
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
      const slotCanvas = canvasRefs[currentSlot].current;
      if (!slotCanvas) return;

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
          <img
            src={clock}
            alt="clock"
            className="clock"
            onClick={() => setShowTimerDropdown(prev => !prev)}
            style={{ cursor: 'pointer' }}
          />
          {showTimerDropdown && (
            <div className="timer-dropdown">
              {[3, 5, 10].map(time => (
                <p
                  key={time}
                  onClick={() => {
                    setCountdownTime(time);
                    setShowTimerDropdown(false);
                  }}
                  className={countdownTime === time ? 'selected' : ''}
                >
                  {time} seconds
                </p>
              ))}
              <p
                onClick={() => {
                  setCountdownTime(0);
                  setShowTimerDropdown(false);
                }}
                className={countdownTime === 0 ? 'selected' : ''}
              >
                No Timer
              </p>
            </div>
          )}
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: frameMode === '1' ? 'block' : 'none' }}
          className="main-photo"
        />

        {/* 4-frame mode */}
        {frameMode === '4' && selectedFrame && (
          <div className="frame-overlay">
            <img src={selectedFrame} alt="frame" className="selected-frame" />

            {[0, 1, 2, 3].map(i => (
              <canvas
                key={i}
                ref={canvasRefs[i]}
                className={`video-slot video-slot-${i}`}
                width={350}
                height={320}
              />
            ))}

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

        {/* 1-frame mode */}
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

        {/* Capture button */}
        <button className="take-photo-button" onClick={onTakePhotoClick} />
        
        {/* Countdown display */}
        {countdownActive && (
          <div className="countdown-display">
            <span>{countdownTime}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default Photobooth;
