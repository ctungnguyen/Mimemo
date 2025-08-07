import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ChangeBgColor from '../components/ChangeBgColor';

import blue_background from '../assets/photobooth/camera-mode-blue.png';
import pink_background from '../assets/photobooth/camera-mode-pink.png';
import beige_background from '../assets/photobooth/camera-mode-beige.png';
import black_background from '../assets/photobooth/camera-mode-black.png';

import clock from '../assets/photobooth/clock.svg';
import pastel_frame from '../assets/photobooth/ptb-frame-12.png';
import purple_frame from '../assets/photobooth/purple-frame-1.png';
import pink_frame from '../assets/photobooth/pink-frame-1.png';

import { useSound } from '../components/SoundContext';


import logo from '../assets//logo.svg';

import cameraSound from '../audio/camera-click.mp3';


import "../css/Photobooth.css";
import { useParams } from 'react-router-dom';



function Photobooth() {

  const { userId } = useParams();
  const videoRef = useRef(null);
  const canvasRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const captureCanvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isSoundOn } = useSound();

  const initialBgIndex = location.state?.bgIndex || 0;

  const [showFrameOptions, setShowFrameOptions] = useState(false);
  const [showSubFrameOptions, setShowSubFrameOptions] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [frameMode, setFrameMode] = useState('1');
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [currentSlot, setCurrentSlot] = useState(0);

  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);

    const cameraAudioRef = useRef(null);


  // Background index state
  const [bgIndex, setBgIndex] = useState(initialBgIndex);

  const backgrounds = [blue_background, pink_background, beige_background, black_background];
  
  const handleChangeBackground = () => {
    setBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
  };

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
      setCountdownActive(false);
      takePhoto();
    }
    return () => clearTimeout(timerId);
  }, [countdownActive, countdownTime]);

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

    // Play camera sound function
  const playCameraSound = () => {
    if (isSoundOn && cameraAudioRef.current) {
    const audio = new Audio(cameraSound);
    audio.play().catch(() => {});
    }
  };

  const onTakePhotoClick = () => {
    playCameraSound();

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
      ctx.scale(-1, 1); // flip horizontally
      ctx.drawImage(videoRef.current, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore(); // restore to original state

      const imageData = captureCanvas.toDataURL('image/png');
      setCapturedImages([imageData, null, null, null]);
      navigate(`/${userId}/photobooth/preview_photo`, {
        state: { capturedImages: [imageData], selectedFrame, frameMode, bgIndex }
      });
    }

        if (frameMode === '4') {
      const slotCanvas = canvasRefs[currentSlot].current;
      if (!slotCanvas) return;

      captureCanvas.width = slotCanvas.width;
      captureCanvas.height = slotCanvas.height;
      const ctx = captureCanvas.getContext('2d');
      
      ctx.clearRect(0, 0, captureCanvas.width, captureCanvas.height);

      // Flip horizontally like in 1 frame mode
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(slotCanvas, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();

      const imageData = captureCanvas.toDataURL('image/png');

      setCapturedImages(prev => {
        const newCaptured = [...prev];
        newCaptured[currentSlot] = imageData;
        return newCaptured;
      });

      const nextSlot = currentSlot + 1;
      setCurrentSlot(nextSlot);

      if (nextSlot === 4) {
        navigate(`/${userId}/photobooth/preview_photo`, {
          state: { capturedImages: [...capturedImages.slice(0, currentSlot), imageData], selectedFrame, frameMode, bgIndex }
        });
      }
    }
  };

  return (
    <>
      <audio ref={cameraAudioRef} src={cameraSound} preload="auto" />
      <img src={backgrounds[bgIndex]} alt="background" className="preview_background" />

      <ChangeBgColor
        backgrounds={backgrounds}
        bgIndex={bgIndex}
        onChange={handleChangeBackground}
      />

      <header className="header">
        <div className="left-side">
          <img
            src={logo}
            alt="MiMeMo logo"
            className="logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
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
          <p className="frame" onClick={() => setShowFrameOptions(o => !o)}>
            Frame
            {frameMode === '4' && (
              <span style={{ marginLeft: 8 }}>
                {Math.min(currentSlot + 1, 4)}/4
              </span>
            )}
          </p>
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

      <div className="photobooth-content">
        {/* Show video feed always, but hide/show main photo by frameMode */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="main-photo"
          style={{ display: 'block' }}
        />

        {/* Show frame overlay only in 1 frame mode */}
{frameMode === '1' && selectedFrame && (
  <div className="frame-overlay">
    <img src={selectedFrame} alt="frame" className="selected-frame" />
  </div>
)}

{frameMode === '4' && (
  <>
    {[0, 1, 2, 3].map(i => (
      <canvas
        key={i}
        ref={canvasRefs[i]}
        className={`video-slot video-slot-${i}`}
        width={350}
        height={320}
      />
    ))}

    {/* Do not render captured images here to hide them */}
  </>
)}

        <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

        <button className="take-photo-button" onClick={onTakePhotoClick} />

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
