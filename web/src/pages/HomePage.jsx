    import React, { useState, useRef, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    
    import white_sun from '../assets/homepage/white-sun.svg'
    import white_moon from '../assets/homepage/white-moon.svg'
    import yellow_sun from '../assets/homepage/yellow-sun.svg'
    import yellow_moon from '../assets/homepage/yellow-moon.svg'
    import day from '../assets/homepage/day.gif'
    import night from '../assets/homepage/night.gif'
    import flower from '../assets/homepage/bong.png'
    import window_frame from '../assets/homepage/khung-cua-so.png'
    import background from '../assets/homepage/day-mode.png'
    import camera from '../assets/homepage/camera.png'
    import red_book from '../assets/homepage/red-book.png'
    import green_book from '../assets/homepage/green-book.png'

    import '../css/HomePage.css'


    function HomePage() {
        const [isNight, setIsNight] = useState(false);
        const skyGif = isNight ? night : day;

        // Intersection Observer for the text
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

        useEffect(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.target === firstRef.current) {
                            setFirstVisible(entry.isIntersecting);
                        } else if (entry.target === secondRef.current) {
                            setSecondVisible(entry.isIntersecting);
                        }   else if (entry.target === thirdRef.current) {
                            setThirdVisible(entry.isIntersecting);
                        } else if (entry.target === fourthRef.current) {
                            setFourthVisible(entry.isIntersecting);
                        }   else if (entry.target === photoboothRef.current) {
                            setPhotoboothVisible(entry.isIntersecting);
                        }
                    });
                },
                { threshold: 0.1 }
            );
        
            if (firstRef.current) observer.observe(firstRef.current);
            if (secondRef.current) observer.observe(secondRef.current);
            if (thirdRef.current) observer.observe(thirdRef.current);
            if (fourthRef.current) observer.observe(fourthRef.current);
            if (photoboothRef.current) observer.observe(photoboothRef.current);
            return () => observer.disconnect();
        }, []);

        return (
        <>
            {/* Light‐effect overlay */}
            <div className="light-effect" />

            
            <div className="top-shelf"> 
                <img src={skyGif} alt="sky background" className="sky-gif" />
                <img src={flower} alt="flower vase" className="flower" />
                {!isNight && (
                    <img
                        src={window_frame}
                        alt="window frame"
                        className="window-frame"
                    />
                )}

                {/* Mode toggle icons */}
                <div className="mode-toggle">
                    <img
                        src={isNight ? white_sun : yellow_sun}
                        alt="day mode"
                        className="mode-icon"
                        onClick={() => setIsNight(false)}
                    />
                    <img
                        src={isNight ? yellow_moon : white_moon}
                        alt="night mode"
                        className="mode-icon"
                        onClick={() => setIsNight(true)}
                    />
                </div>
                
                {/* Authentication links */}
                <div className="auth-toggle">
                    <span
                        className="auth-link"
                        onClick={() => { setShowLogin(false); setShowSignUp(!showSignUp); }}
                    >
                    SIGN UP
                    </span>
                    <span
                        className="auth-link"
                        onClick={() => { setShowSignUp(false); setShowLogin(!showLogin); }}
                    >
                    LOG IN
                    </span>
                </div>

                {/* Sign Up form */}
                {showSignUp && (
                <div className="signup-form">
                    <label>
                        Username:
                        <input type="text" placeholder="Enter username" />
                    </label>
                    <label>
                        Password:
                        <input type="password" placeholder="Enter password" />
                    </label>
                    <button>Submit</button>
                </div>
            )}

            {/* Login form */}
            {showLogin && (
                <div className="login-form">
                    <label>
                        Username:
                        <input type="text" placeholder="Enter username" />
                    </label>
                    <label>
                        Password:
                        <input type="password" placeholder="Enter password" />
                    </label>
                    <button>Login</button>
                </div>
            )}
            </div>


            <div classname="shelf-container">
                <img src={background} alt="shelf" className="shelf" />
                
                <p
                    ref={firstRef}
                    className={`first-shelf ${firstVisible ? 'fade-in' : 'fade-out'}`}
                >
                    MiMeMo is a web and mobile application that combines an online photobooth with a collaborative digital diary, allowing users to take photos, decorate them with stickers and frames, and save them into personalized memory books. Each book can be shared with others, so friends and family can contribute photos and journal entries together. Users can also draw, add handwritten notes, or export their books as a PDF to print and keep.
                </p>

                <p
                    ref={secondRef}
                    className={`second-shelf ${secondVisible ? 'fade-in' : 'fade-out'}`}
                >
                    This is your little photobooth corner! Just click the camera to snap a pic and let the decorating fun begin !
                </p>

                {/* ==== CLICKABLE CAMERA LINK ==== */}
                <Link to="/photobooth" className="photobooth-link">
                    <img src={camera} alt="photobooth camera" className="photobooth-img" />
                    <span ref={photoboothRef} className={`photobooth-tooltip ${photoboothVisible ? 'fade-in' : 'fade-out'}`}>photobooth?</span>
                </Link>

                {/* ==== WALL LINK ==== */}
                <Link to="/wall" className="wall-link">click here to go to your wall !</Link>
                
                <p
                    ref={thirdRef}
                    className={`third-shelf ${thirdVisible ? 'fade-in' : 'fade-out'}`}
                >
                    Shall we rewind some good times... Choose your notebook!
                </p>


                <Link to="/notebook" className="notebook-link">
                    <img src={red_book} alt="red notebook" className="notebook-img" />
                </Link>
                <p className='greenbook'><img src={green_book} alt="green notebook" className="greenbook-img" /></p>

                <p
                    ref={fourthRef}
                    className={`fourth-shelf ${fourthVisible ? 'fade-in' : 'fade-out'}`}
                >
                    Contact us here!<br />
                    <br />
                    IG: @mimemo.memo<br />
                    FB: MiMeMo Memo           
                </p>
            </div>
            
        </>
    )
    }

    export default HomePage
