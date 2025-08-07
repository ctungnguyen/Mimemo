
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import white_sun from '../assets/homepage/white-sun.svg'
import white_moon from '../assets/homepage/white-moon.svg'
import yellow_sun from '../assets/homepage/yellow-sun.svg'
import yellow_moon from '../assets/homepage/yellow-moon.svg'
import day from '../assets/homepage/day.gif'
import night from '../assets/homepage/night.gif'
import flower from '../assets/homepage/bong.png'
import window_frame from '../assets/homepage/khung-cua-so.png'
import background from '../assets/homepage/day-mode.png'
import night_background from '../assets/homepage/night-mode.png'
import camera from '../assets/homepage/camera.png'

import logo from '../assets/logo.svg'

import birdSound from '../audio/birds.mp3'
import rainSound from '../audio/rain.mp3'
import slidingSound from '../audio/sliding.wav'
import cameraSound from '../audio/camera-click.mp3'

import AudioPlayer from '../components/AudioPlayer';
import NotebookList from '../components/NotebookList';
import '../css/HomePage.css'

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import {useSound } from '../components/SoundContext.jsx';
import soundOnIcon from '../assets/homepage/sound-on.png';
import soundOffIcon from '../assets/homepage/sound-off.png';

function HomePage() {
    const navigate = useNavigate();
    const [isNight, setIsNight] = useState(false);
      const bgImg = isNight ? night_background : background;
    const skyGif = isNight ? night : day;

    const [firstVisible, setFirstVisible] = useState(false);
    const [secondVisible, setSecondVisible] = useState(false);
    const [thirdVisible, setThirdVisible] = useState(false);
    const [fourthVisible, setFourthVisible] = useState(false);
    const [photoboothVisible, setPhotoboothVisible] = useState(false);
    const { isSoundOn, toggleSound } = useSound();


    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const thirdRef = useRef(null);
    const fourthRef = useRef(null);
    const photoboothRef = useRef(null);
    const slidingAudioRef = useRef(null);
      const cameraAudioRef = useRef(null);


    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // Play sliding sound once on scroll event
    useEffect(() => {
        let scrollTimeout = null;

        function handleScroll() {
            const audio = slidingAudioRef.current;
            if (!audio) return;

            if (!isSoundOn) return; // ✅ respect global sound state

            audio.volume = 0.5;

            if (audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
            }

            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
            if (!audio) return;
            const onEnded = () => {
                audio.pause();
                audio.removeEventListener('ended', onEnded);
            };
            if (!audio.paused) {
                audio.addEventListener('ended', onEnded);
            }
            }, 200);
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
        }, [isSoundOn]); // ✅ Add isSoundOn as dependency


const handleSignUp = async () => {
  const email = `${username}@mimemo.app`; // still needed for auth
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store ONLY username in Firestore users collection, keyed by uid
    await setDoc(doc(db, 'users', user.uid), {
      username: username,
      createdAt: new Date(),
    });

    alert('Sign up successful!');
  } catch (error) {
    alert(`Sign up failed: ${error.message}`);
  }
};

    const playCameraSound = () => {
        if (isSoundOn && cameraAudioRef.current) {
        cameraAudioRef.current.currentTime = 0;
        cameraAudioRef.current.play().catch(() => {});
        }
    };

    const handleLogin = async () => {
        const email = `${username}@mimemo.app`;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert(`Login failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
    try {
        await signOut(auth);
        navigate("//"); // Redirect to homepage after logout

    } catch (error) {
        alert(`Logout failed: ${error.message}`);
    }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                navigate(`/${user.uid}`);
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target === firstRef.current) setFirstVisible(entry.isIntersecting);
                    else if (entry.target === secondRef.current) setSecondVisible(entry.isIntersecting);
                    else if (entry.target === thirdRef.current) setThirdVisible(entry.isIntersecting);
                    else if (entry.target === fourthRef.current) setFourthVisible(entry.isIntersecting);
                    else if (entry.target === photoboothRef.current) setPhotoboothVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.1 }
        );

        [firstRef, secondRef, thirdRef, fourthRef, photoboothRef].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <audio ref={cameraAudioRef} src={cameraSound} preload="auto" />

            <div className="light-effect" />

            
            <div className="top-shelf">
                <img
                src={logo}
                alt="MiMeMo logo"
                className="logo-top-left"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
                <img src={skyGif} alt="sky background" className="sky-gif" />
                <img src={flower} alt="flower vase" className="flower" />
                {!isNight && <img src={window_frame} alt="window frame" className="window-frame" />}

                <div className="mode-toggle">
                    <img src={isNight ? white_sun : yellow_sun} alt="day mode" className="mode-icon" onClick={() => setIsNight(false)} />
                    <img src={isNight ? yellow_moon : white_moon} alt="night mode" className="mode-icon" onClick={() => setIsNight(true)} />
                    <img src={isSoundOn ? soundOnIcon : soundOffIcon} alt="sound toggle" className="mode-icon" onClick={toggleSound}/>
                </div>

                {!currentUser && (
                    <div className="auth-toggle">
                        <span className={`auth-link ${isNight ? 'dark-mode' : 'light-mode'}`} onClick={() => { setShowLogin(false); setShowSignUp(!showSignUp); }}>SIGN UP</span>
                        <span className={`auth-link ${isNight ? 'dark-mode' : 'light-mode'}`} onClick={() => { setShowSignUp(false); setShowLogin(!showLogin); }}>LOG IN</span>
                    </div>
                )}

                {currentUser && (
                    <div className="auth-toggle">
                    <span className={`auth-link ${isNight ? 'dark-mode' : 'light-mode'}`} onClick={handleLogout}>LOG OUT</span>
                    </div>
                )}

                {!currentUser && showSignUp && (
                    <div className="signup-form">
                        <label>Username:
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
                        </label>
                        <label>Password:
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                        </label>
                        <button onClick={handleSignUp}>Submit</button>
                    </div>
                )}

                {!currentUser && showLogin && (
                    <div className="login-form">
                        <label>Username:
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
                        </label>
                        <label>Password:
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                        </label>
                        <button onClick={handleLogin}>Login</button>
                    </div>
                )}
            </div>

            {/* Audio players */}

            {/* Bird or rain sound: autoplay & loop */}
            <AudioPlayer
                src={isNight ? rainSound : birdSound}
                volume={0.3}
                  muted={!isSoundOn}
                // you can add muted={false} or control inside AudioPlayer if needed
            />

            {/* Sliding sound: plays once on scroll */}
            <audio ref={slidingAudioRef} src={slidingSound} preload="auto" />

            <div className="shelf-container">
                <img src={bgImg} alt="shelf" className="shelf" />
                <p ref={firstRef} className={`first-shelf ${firstVisible ? 'fade-in' : 'fade-out'}`}>
                    MiMeMo is a web and mobile application that combines an online photobooth with a collaborative digital diary, allowing users to take photos, decorate them with stickers and frames, and save them into personalized memory books. Each book can be shared with others, so friends and family can contribute photos and journal entries together. Users can also draw, add handwritten notes, or export their books as a PDF to print and keep.
                </p>
                <p ref={secondRef} className={`second-shelf ${secondVisible ? 'fade-in' : 'fade-out'}`}>
                    This is your little photobooth corner! Just click the camera to snap a pic and let the decorating fun begin !
                </p>

                <Link to={`/${currentUser?.uid}/photobooth`} className="photobooth-link" onMouseEnter={playCameraSound}>
                    <img src={camera} alt="photobooth camera" className="photobooth-img" />
                    <span ref={photoboothRef} className={`photobooth-tooltip ${photoboothVisible ? 'fade-in' : 'fade-out'}`}>photobooth?</span>
                </Link>

                <Link to={`/${currentUser?.uid}/wall`} className="wall-link">Click here to go to your wall !</Link>

                <p ref={thirdRef} className={`third-shelf ${thirdVisible ? 'fade-in' : 'fade-out'}`}>
                    Shall we rewind some good times...Choose your notebook!
                </p>

                <NotebookList />

                <p ref={fourthRef} className={`fourth-shelf ${fourthVisible ? 'fade-in' : 'fade-out'}`}>
                    Contact us here!<br />IG: @mimemo.memo<br />FB: MiMeMo Memo
                </p>
            </div>
        </>
    );
}

export default HomePage;
