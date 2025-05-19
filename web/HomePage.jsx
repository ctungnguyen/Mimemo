import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import white_sun from '../assets/homepage/white-sun.svg'
import white_moon from '../assets/homepage/white-moon.svg'
yellow_sun from '../assets/homepage/yellow-sun.svg'
import yellow_moon from '../assets/homepage/yellow-moon.svg'
import day from '../assets/homepage/day.gif'
import night from '../assets/homepage/night.gif'
import flower from '../assets/homepage/bong.png'
import window_frame from '../assets/homepage/khung-cua-so.png'
import background from '../assets/homepage/day-mode.png'
import camera from '../assets/homepage/camera.png'

import NotebookList from '../components/NotebookList';
import '../css/HomePage.css'

import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

function HomePage() {
    const navigate = useNavigate();
    const [isNight, setIsNight] = useState(false);
    const skyGif = isNight ? night : day;

    const [firstVisible, setFirstVisible] = useState(false);
    const [secondVisible, setSecondVisible] = useState(false);
    const [thirdVisible, setThirdVisible] = useState(false);
    const [fourthVisible, setFourthVisible] = useState(false);
    const [photoboothVisible, setPhotoboothVisible] = useState(false);

    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const thirdRef = useRef(null);
    const fourthRef = useRef(null);
    const photoboothRef = useRef(null);

    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const handleSignUp = async () => {
        const email = `${username}@mimemo.app`;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert(`Sign up failed: ${error.message}`);
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
    }, [navigate]);

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
            <div className="light-effect" />
            <div className="top-shelf">
                <img src={skyGif} alt="sky background" className="sky-gif" />
                <img src={flower} alt="flower vase" className="flower" />
                {!isNight && <img src={window_frame} alt="window frame" className="window-frame" />}

                <div className="mode-toggle">
                    <img src={isNight ? white_sun : yellow_sun} alt="day mode" className="mode-icon" onClick={() => setIsNight(false)} />
                    <img src={isNight ? yellow_moon : white_moon} alt="night mode" className="mode-icon" onClick={() => setIsNight(true)} />
                </div>

                {!currentUser && (
                    <div className="auth-toggle">
                        <span className="auth-link" onClick={() => { setShowLogin(false); setShowSignUp(!showSignUp); }}>SIGN UP</span>
                        <span className="auth-link" onClick={() => { setShowSignUp(false); setShowLogin(!showLogin); }}>LOG IN</span>
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

            <div className="shelf-container">
                <img src={background} alt="shelf" className="shelf" />
                <p ref={firstRef} className={`first-shelf ${firstVisible ? 'fade-in' : 'fade-out'}`}>
                    MiMeMo is a web and mobile application...
                </p>
                <p ref={secondRef} className={`second-shelf ${secondVisible ? 'fade-in' : 'fade-out'}`}>
                    This is your little photobooth corner!
                </p>

                <Link to="/photobooth" className="photobooth-link">
                    <img src={camera} alt="photobooth camera" className="photobooth-img" />
                    <span ref={photoboothRef} className={`photobooth-tooltip ${photoboothVisible ? 'fade-in' : 'fade-out'}`}>photobooth?</span>
                </Link>

                <Link to="/wall" className="wall-link">click here to go to your wall !</Link>

                <p ref={thirdRef} className={`third-shelf ${thirdVisible ? 'fade-in' : 'fade-out'}`}>
                    Shall we rewind some good times...
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
