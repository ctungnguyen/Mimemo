import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

import { useSound } from './SoundContext.jsx';


import redbook from '../assets/notebookList/redbook.png';
import greenbook from '../assets/notebookList/greenbook.png';
import greenbook2 from '../assets/notebookList/greenbook2.png';
import greenbook3 from '../assets/notebookList/greenbook3.png';
import greenbook4 from '../assets/notebookList/greenbook4.png';
import greenbook5 from '../assets/notebookList/greenbook5.png';
import greenbook6 from '../assets/notebookList/greenbook6.png';
import greenbook7 from '../assets/notebookList/greenbook7.png';
import greenbook8 from '../assets/notebookList/greenbook8.png';
import greenbook9 from '../assets/notebookList/greenbook9.png';
import greenbook10 from '../assets/notebookList/greenbook10.png';
import greenbook11 from '../assets/notebookList/greenbook11.png';
import greenbook12 from '../assets/notebookList/greenbook12.png';
import greenbook13 from '../assets/notebookList/greenbook13.png';
import greenbook14 from '../assets/notebookList/greenbook14.png';
import greenbook15 from '../assets/notebookList/greenbook15.png';
import greenbook16 from '../assets/notebookList/greenbook16.png';

import bookSound from '../audio/book.mp3';

import '../css/NotebookList.css';

function NotebookList({ capturedImages, selectedFrame, frameMode, bgIndex, finalImage }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [userNotebooks, setUserNotebooks] = useState([]);

  useEffect(() => {
    if (!userId) return;

    async function fetchUserNotebooks() {
      const notebooksRef = collection(db, 'notebooks');
      // Query notebooks owned by user OR notebooks shared with user
      // Since Firestore doesn't support OR easily, for now just fetch owned notebooks
      // If you have 'sharedUsers' array field, consider a separate query for shared notebooks too

      const q = query(notebooksRef, where('owner', '==', userId));
      const querySnapshot = await getDocs(q);

      // Optional: fetch shared notebooks as well here and merge them

      const notebooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserNotebooks(notebooks);
    }

    fetchUserNotebooks();
  }, [userId]);

  // Get notebook for given bookId belonging to this user
  const getNotebookForBookId = (bookId) => {
    return userNotebooks.find(nb => nb.bookId === bookId);
  };

  const openOrCreateNotebook = async (bookId) => {
    const existing = getNotebookForBookId(bookId);

    if (existing) {
      // If notebook is linked, navigate to linked notebook
      const targetNotebookId = (existing.isLinked && existing.linkedNotebookId) ? existing.linkedNotebookId : existing.id;

      navigate(`/${userId}/notebook/${targetNotebookId}`, {
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
      linkedNotebookId: null,
      isLinked: false,
    };

    const docRef = await addDoc(notebooksRef, newNotebook);
    const { isSoundOn } = useSound();


    

    setUserNotebooks(prev => [...prev, { id: docRef.id, ...newNotebook }]);

    navigate(`/${userId}/notebook/${docRef.id}`, {
      state: {
        capturedImages: finalImage ? [finalImage] : capturedImages,
        selectedFrame: null,
        frameMode,
        bgIndex
      }
    });
  };

const handleMouseEnter = () => {
  if (!isSoundOn) return; // ✅ respect global sound toggle
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }
};

  // Helper to render each greenbook div with correct click and label
  const renderGreenbook = (bookId, imgSrc, imgClass, containerClass, topLabel = true) => {
    const notebook = getNotebookForBookId(bookId);

    return (
      <div className={containerClass} onClick={() => openOrCreateNotebook(bookId)} onMouseEnter={handleMouseEnter} style={{ cursor: 'pointer' }}>
        <img src={imgSrc} alt={bookId} className={imgClass} />
        {notebook && topLabel && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '40px',
            color: 'white',
            fontSize: '12px',
            transform: 'rotate(90deg)'
          }}>
            {notebook.bookName}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <audio ref={audioRef} src={bookSound} preload="auto" />

        {renderGreenbook('redbook', redbook, 'notebook-img', 'notebook-link')}
        {renderGreenbook('greenbook1', greenbook, 'greenbook-img1', 'greenbook greenbook1')}
        {renderGreenbook('greenbook2', greenbook2, 'greenbook-img2', 'greenbook greenbook2')}
        {renderGreenbook('greenbook3', greenbook3, 'greenbook-img3', 'greenbook greenbook3')}
        {renderGreenbook('greenbook4', greenbook4, 'greenbook-img4', 'greenbook greenbook4')}
        {renderGreenbook('greenbook5', greenbook5, 'greenbook-img5', 'greenbook greenbook5')}
        {renderGreenbook('greenbook6', greenbook6, 'greenbook-img6', 'greenbook greenbook6')}
        {renderGreenbook('greenbook7', greenbook7, 'greenbook-img7', 'greenbook greenbook7')}
        {renderGreenbook('greenbook8', greenbook8, 'greenbook-img8', 'greenbook greenbook8')}
        {renderGreenbook('greenbook9', greenbook9, 'greenbook-img9', 'greenbook greenbook9')}
        {renderGreenbook('greenbook10', greenbook10, 'greenbook-img10', 'greenbook greenbook10')}
        {renderGreenbook('greenbook11', greenbook11, 'greenbook-img11', 'greenbook greenbook11')}
        {renderGreenbook('greenbook12', greenbook12, 'greenbook-img12', 'greenbook greenbook12')}
        {renderGreenbook('greenbook13', greenbook13, 'greenbook-img13', 'greenbook greenbook13')}
        {renderGreenbook('greenbook14', greenbook14, 'greenbook-img14', 'greenbook greenbook14')}
        {renderGreenbook('greenbook15', greenbook15, 'greenbook-img15', 'greenbook greenbook15')}
        {renderGreenbook('greenbook16', greenbook16, 'greenbook-img16', 'greenbook greenbook16')}
    </>
  );
}

export default NotebookList;
