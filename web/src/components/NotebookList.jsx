    import React, { useState, useRef, useEffect } from 'react';
    import { Link, useNavigate  } from 'react-router-dom';

    import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
    
    
    import redbook from '../assets/notebookList/redbook.png'
    import greenbook from '../assets/notebookList/greenbook.png'
    import greenbook2 from '../assets/notebookList/greenbook2.png'
    import greenbook3 from '../assets/notebookList/greenbook3.png'
    import greenbook4 from '../assets/notebookList/greenbook4.png' 
    import greenbook5 from '../assets/notebookList/greenbook5.png'
    import greenbook6 from '../assets/notebookList/greenbook6.png'
    import greenbook7 from '../assets/notebookList/greenbook7.png'
    import greenbook8 from '../assets/notebookList/greenbook8.png'
    import greenbook9 from '../assets/notebookList/greenbook9.png'
    import greenbook10 from '../assets/notebookList/greenbook10.png'
    import greenbook11 from '../assets/notebookList/greenbook11.png'
    import greenbook12 from '../assets/notebookList/greenbook12.png'
    import greenbook13 from '../assets/notebookList/greenbook13.png'
    import greenbook14 from '../assets/notebookList/greenbook14.png'
    import greenbook15 from '../assets/notebookList/greenbook15.png'
    import greenbook16 from '../assets/notebookList/greenbook16.png'

    import bookSound from '../audio/book.mp3'

    import '../css/NotebookList.css'
    import { useParams } from 'react-router-dom';
    

    function NotebookList({ capturedImages, selectedFrame, frameMode, bgIndex, finalImage }) {
        const { userId } = useParams();

        const navigate = useNavigate();

        const audioRef = useRef(null);


        // Load existing notebooks of the user once
        const [userNotebooks, setUserNotebooks] = useState([]);

        
        useEffect(() => {
            if (!userId) return;

            async function fetchUserNotebooks() {
                const notebooksRef = collection(db, 'notebooks');
                const q = query(notebooksRef, where('owner', '==', userId));
                const querySnapshot = await getDocs(q);

                const notebooks = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
                }));
                setUserNotebooks(notebooks);
            }

            fetchUserNotebooks();
            }, [userId]);

        // Helper to find existing notebook by a 'type' or 'bookName' field, or create if not exists
        // Here assuming notebooks have a 'bookName' field which matches the greenbook name
        const openOrCreateNotebook = async (bookId) => {
            // Check if user already has this notebook
        const existing = userNotebooks.find(nb => nb.bookId === bookId);
            if (existing) {
            navigate(`/${userId}/notebook/${existing.id}`, {
                state: {
                capturedImages: finalImage ? [finalImage] : capturedImages,
                selectedFrame: null,
                frameMode,
                bgIndex
                }
            });
            return;
            }

            // Create new notebook doc
            const notebooksRef = collection(db, 'notebooks');
            const newNotebook = {
            owner: userId,
            bookId,
            bookName: bookId,
            // add other default fields if needed
            };

            const docRef = await addDoc(notebooksRef, newNotebook);

            // Update local state to include new notebook for future clicks
            setUserNotebooks(prev => [...prev, { id: docRef.id, ...newNotebook }]);

            // Navigate to new notebook
            navigate(`/${userId}/notebook/${docRef.id}`, {
            state: {
                capturedImages: finalImage ? [finalImage] : capturedImages,
                selectedFrame: null,
                frameMode,
                bgIndex
            }
            });
        };



        // Handlers for hover sound play/stop
        const handleMouseEnter = () => {
            if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                // Ignore play errors (e.g., autoplay blocked)
            });
            }
        };



        return (
            <>
                <audio ref={audioRef} src={bookSound} preload="auto" />

                <div
                        className="notebook-link"
                        onClick={() => openOrCreateNotebook('redbook')}
                        onMouseEnter={handleMouseEnter}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={redbook} alt="red notebook" className="notebook-img" />
                    </div>

                {/* Greenbooks without inline position */}
                <div className="greenbook greenbook1" onClick={() => openOrCreateNotebook('greenbook1')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook} alt="green notebook 1" className="greenbook-img1" />
                </div>

                <div className="greenbook greenbook2" onClick={() => openOrCreateNotebook('greenbook2')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook2} alt="green notebook 2" className="greenbook-img2" />
                </div>

                <div className="greenbook greenbook3" onClick={() => openOrCreateNotebook('greenbook3')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook3} alt="green notebook 3" className="greenbook-img3" />
                </div>

                <div className="greenbook greenbook4" onClick={() => openOrCreateNotebook('greenbook4')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook4} alt="green notebook 4" className="greenbook-img4" />
                </div>

                <div className="greenbook greenbook5" onClick={() => openOrCreateNotebook('greenbook5')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook5} alt="green notebook 5" className="greenbook-img5" />
                </div>

                <div className="greenbook greenbook6" onClick={() => openOrCreateNotebook('greenbook6')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook6} alt="green notebook 6" className="greenbook-img6" />
                </div>

                <div className="greenbook greenbook7" onClick={() => openOrCreateNotebook('greenbook7')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook7} alt="green notebook 7" className="greenbook-img7" />
                </div>

                <div className="greenbook greenbook8" onClick={() => openOrCreateNotebook('greenbook8')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook8} alt="green notebook 8" className="greenbook-img8" />
                </div>

                <div className="greenbook greenbook9" onClick={() => openOrCreateNotebook('greenbook9')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook9} alt="green notebook 9" className="greenbook-img9" />
                </div>

                <div className="greenbook greenbook10" onClick={() => openOrCreateNotebook('greenbook10')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook10} alt="green notebook 10" className="greenbook-img10" />
                </div>

                <div className="greenbook greenbook11" onClick={() => openOrCreateNotebook('greenbook11')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook11} alt="green notebook 11" className="greenbook-img11" />
                </div>

                <div className="greenbook greenbook12" onClick={() => openOrCreateNotebook('greenbook12')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook12} alt="green notebook 12" className="greenbook-img12" />
                </div>

                <div className="greenbook greenbook13" onClick={() => openOrCreateNotebook('greenbook13')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook13} alt="green notebook 13" className="greenbook-img13" />
                </div>

                <div className="greenbook greenbook14" onClick={() => openOrCreateNotebook('greenbook14')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook14} alt="green notebook 14" className="greenbook-img14" />
                </div>

                <div className="greenbook greenbook15" onClick={() => openOrCreateNotebook('greenbook15')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook15} alt="green notebook 15" className="greenbook-img15" />
                </div>

                <div className="greenbook greenbook16" onClick={() => openOrCreateNotebook('greenbook16')} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
                <img src={greenbook16} alt="green notebook 16" className="greenbook-img16" />
                </div>
        </>
    )
    }

    export default NotebookList
