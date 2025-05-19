import React, { useState, useRef, useEffect, createRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import StickerPicker from '../components/StickerPicker';
import ResizableElement from '../components/ResizableElement';
import { Rnd } from 'react-rnd';
  


import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, limit } from 'firebase/firestore';


import "../css/Notebook.css";

import page1 from '../assets/notebook/paper-right-side.png';
import page2 from '../assets/notebook/paper-right-side.png';
import page3 from '../assets/notebook/paper-left-side.png';
import page4 from '../assets/notebook/paper-right-side.png';
import page5 from '../assets/notebook/paper-left-side.png';
import page6 from '../assets/notebook/paper-right-side.png';
import page7 from '../assets/notebook/paper-left-side.png';
import page8 from '../assets/notebook/paper-right-side.png';
import page9 from '../assets/notebook/paper-left-side.png';
import page10 from '../assets/notebook/paper-right-side.png';

import menuIcon from '../assets/notebook/menu.svg';
import printer from '../assets/notebook/printer.svg';
import eraser from '../assets/notebook/eraser.svg';
import share from '../assets/notebook/share.svg';
import bell from '../assets/notebook/icon.png';
import user from '../assets/notebook/frame-18-icon.svg';

import blueBg from '../assets/wall/vector-blue.png';
import pinkBg from '../assets/wall/vector-pink.png';
import beigeBg from '../assets/wall/vector-beige.png';
import blackBg from '../assets/wall/vector-black.png';

import logo from '../assets/logo.svg';

import ChangeBgColor from '../components/ChangeBgColor'; // Import ChangeBgColor

function Notebook() {
  const location = useLocation();
    const navigate = useNavigate();

    const { userId, notebookId } = useParams();
    const [notebookName, setNotebookName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);


  const { capturedImages, selectedFrame, frameMode, bgIndex: initialBgIndex = 0 } = location.state || {};
  const [pageContents, setPageContents] = useState({});

  const backgrounds = [blueBg, pinkBg, beigeBg, blackBg];
  const [bgIndex, setBgIndex] = useState(initialBgIndex);

  const backgroundImage = backgrounds[bgIndex];

  const pages = [page1, page2, page3, page4, page5, page6, page7, page8, page9, page10];
  const total = pages.length;

  const [idx, setIdx] = useState(0);

const [showShareDropdown, setShowShareDropdown] = useState(false);
const [showUserListDropdown, setShowUserListDropdown] = useState(false);
const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

const [searchUserInput, setSearchUserInput] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [sharedUsers, setSharedUsers] = useState([]); // loaded shared users for this notebook

const [notifications, setNotifications] = useState([]); // your invitation notifications


  const [menuOpen, setMenuOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [eraserOn, setEraserOn] = useState(false);
  const [canDraw, setCanDraw] = useState(false);

  const [selectedStickerId, setSelectedStickerId] = useState(null);


  // This controls whether StickerPicker is visible in Notebook (NOT StickerPicker’s internal state)
  const [showStickers, setShowStickers] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textItems, setTextItems] = useState([]);

  // Maintain stickers placed on page here (array of {id, src, x, y})
  const [stickersOnPage, setStickersOnPage] = useState([]);

  const textRefs = useRef({});
  const stickerRefs = useRef({});
  const canvasRef = useRef(null);

  const palette = [
    '#2f007e','#4b0082','#800080','#9932CC','#BA55D3','#DA70D6','#EE82EE','#D8BFD8','#DDA0DD',
    '#8B0000','#B22222','#FF0000','#FF4500','#FF6347','#FF7F50','#FF8C00','#FFA500','#FFD700',
    '#556B2F','#6B8E23','#7CFC00','#32CD32','#00FF00','#00FA9A','#00FF7F','#00FFFF','#40E0D0',
    '#00008B','#0000CD','#0000FF','#4169E1','#1E90FF','#00BFFF','#87CEEB','#ADD8E6','#B0E0E6'
  ];

  useEffect(() => {
  async function fetchNotebookName() {
    if (!userId || !notebookId) return;
    const notebookRef = doc(db, 'notebooks', notebookId);
    const snapshot = await getDoc(notebookRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setNotebookName(data.bookName || 'Untitled');
    } else {
      setNotebookName('Not Found');
    }
  }

  fetchNotebookName();
}, [userId, notebookId]);

// Save current page data (stickers, text, brush) to Firestore
  async function savePageData(pageNumber) {
    if (!notebookId) return;
    const pageRef = doc(db, `notebooks/${notebookId}/pages`, `page${pageNumber}`);

    // Save stickers
    const stickersCollection = collection(pageRef, 'stickers');
    // Clear existing stickers docs logic could be added here if desired
    for (const sticker of stickersOnPage) {
      const stickerDoc = doc(stickersCollection, String(sticker.id));
      await setDoc(stickerDoc, sticker);
    }

    // Save texts
    const textsCollection = collection(pageRef, 'texts');
    for (const text of textItems) {
      const textDoc = doc(textsCollection, String(text.id));
      await setDoc(textDoc, text);
    }

    // Save brush data
    const brushDataCollection = collection(pageRef, 'brushData');
    const brushDoc = doc(brushDataCollection, 'paths');
    const paths = canvasRef.current ? await canvasRef.current.exportPaths() : [];
    await setDoc(brushDoc, { paths });
  }

  

  // Load page data from Firestore
  async function loadPageData(pageNumber) {
    if (!notebookId) return;
    const pageRef = doc(db, `notebooks/${notebookId}/pages`, `page${pageNumber}`);

    // Load stickers
    const stickersSnapshot = await getDocs(collection(pageRef, 'stickers'));
    const loadedStickers = stickersSnapshot.docs.map(doc => doc.data());
    setStickersOnPage(loadedStickers);

    // Load texts
    const textsSnapshot = await getDocs(collection(pageRef, 'texts'));
    const loadedTexts = textsSnapshot.docs.map(doc => doc.data());
    setTextItems(loadedTexts);

    // Load brush data
    const brushSnapshot = await getDocs(collection(pageRef, 'brushData'));
    const brushDoc = brushSnapshot.docs.find(doc => doc.id === 'paths');
    if (brushDoc && canvasRef.current) {
      await canvasRef.current.clearCanvas();
      await canvasRef.current.loadPaths(brushDoc.data().paths || []);
    } else if (canvasRef.current) {
      await canvasRef.current.clearCanvas();
    }
  }

  // On mount, load page 1 and 2
  useEffect(() => {
    loadPageData(1);
  }, []);

  // Handlers for prev and next with saving current page data and loading new page data
  const prev = async () => {
    await savePageData(idx + 1);
    const newIdx = Math.max(idx - 2, 0);
    setIdx(newIdx);
    await loadPageData(newIdx + 1);
  };

  const next = async () => {
    await savePageData(idx + 1);
    const newIdx = Math.min(idx + 2, total - 2);
    setIdx(newIdx);
    await loadPageData(newIdx + 1);
  };

  // Initialize refs for stickers whenever stickersOnPage changes
useEffect(() => {
  stickersOnPage.forEach(({ id }) => {
    if (!stickerRefs.current[id]) {
      stickerRefs.current[id] = React.createRef();
    }
  });
}, [stickersOnPage]);

// Initialize refs for textItems whenever textItems changes
useEffect(() => {
  textItems.forEach(({ id }) => {
    if (!textRefs.current[id]) {
      textRefs.current[id] = React.createRef();
    }
  });
}, [textItems]);

useEffect(() => {
  if (!notebookId) return;

  const notebookRef = doc(db, 'notebooks', notebookId);

  getDoc(notebookRef).then(docSnap => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      setSharedUsers(data.sharedUsers || []); // assuming sharedUsers is an array of user IDs or objects
    }
  });

  // Fetch notifications for the current user (example path)
  if (userId) {
    const notifRef = collection(db, 'users', userId, 'notifications');
    getDocs(notifRef).then(snapshot => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    });
  }
}, [notebookId, userId]);

  // New: Prepare initial stickers state from location.state on mount
useEffect(() => {
  if (capturedImages && capturedImages.length > 0) {
    const imageStickers = capturedImages.map((src, idx) => ({
      id: `img-${idx}`,
      src,
      x: 70 + idx * 80,
      y: 70,
    }));

    let allStickers = imageStickers;

    if (selectedFrame) {
      const frameSticker = { id: 'frame', src: selectedFrame, x: 50, y: 50 };
      allStickers = [frameSticker, ...imageStickers];
    }

    // Create refs for each sticker
    allStickers.forEach(({ id }) => {
      if (!stickerRefs.current[id]) {
        stickerRefs.current[id] = React.createRef();
      }
    });

    setStickersOnPage(allStickers);
  }
}, [capturedImages, selectedFrame]);



  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.eraseMode(eraserOn);
    }
  }, [eraserOn]);

  // Deselect sticker when clicking outside
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.resizable-box') && !e.target.closest('.sticker-draggable')) {
      setSelectedStickerId(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const handleNameDoubleClick = () => {
  if (notebookName !== 'Not Found') setIsEditingName(true);
};


const handleNameChange = (e) => {
  setNotebookName(e.target.value);
};

// Change handleSearchChange to only update input (no search)
const handleSearchChange = (e) => {
  setSearchUserInput(e.target.value);
};

// New function to execute search on button click
const handleSearchClick = async () => {
  const val = searchUserInput.trim();
  if (val === '') {
    setSearchResults([]);
    return;
  }

  const emailToSearch = `${val}@mimemo.app`;

  const usersRef = collection(db, 'users');

  // For debugging: try exact match first
  const q = query(usersRef, where('email', '==', emailToSearch));

  const snapshot = await getDocs(collection(db, 'users'));
const filtered = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(user => user.email && user.email.startsWith(emailToSearch));
console.log("Filtered users:", filtered);
setSearchResults(filtered);

console.log("Searching for email:", emailToSearch);
};

const handleAddSharedUser = async (userToAdd) => {
  if (!notebookId) return;

  const notebookRef = doc(db, 'notebooks', notebookId);

  // Update Firestore
  await updateDoc(notebookRef, {
    sharedUsers: [...sharedUsers, userToAdd.id]
  });

  // Update local state
  setSharedUsers(prev => [...prev, userToAdd.id]);
  setSearchUserInput('');
  setSearchResults([]);
};

const handleNameBlur = async () => {
  setIsEditingName(false);
  const notebookRef = doc(db, 'notebooks', notebookId);
  await updateDoc(notebookRef, { bookName: notebookName });
};

useEffect(() => {
  if (!notebookId || !capturedImages || capturedImages.length === 0) return;

  async function saveCapturedImagesOnce() {
    const pageRef = doc(db, `notebooks/${notebookId}/pages`, `page${idx + 1}`);
    const stickersCollection = collection(pageRef, 'stickers');

    // Load existing stickers once to check for duplicates
    const existingStickersSnapshot = await getDocs(stickersCollection);
    const existingStickers = existingStickersSnapshot.docs.map(doc => doc.data());

    // Filter capturedImages to only those not already saved (based on src)
    const newImagesToSave = capturedImages.filter(imgSrc => 
      !existingStickers.some(sticker => sticker.src === imgSrc)
    );

    // Save only new images
    for (let i = 0; i < newImagesToSave.length; i++) {
      const id = `captured-${Date.now()}-${i}`;
      const sticker = {
        id,
        src: newImagesToSave[i],
        x: 50 + i * 80,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
      };
      const stickerDoc = doc(stickersCollection, id);
      await setDoc(stickerDoc, sticker);
    }

    // Reload page stickers so state updates with newly saved images
    await loadPageData(idx + 1);
  }

  saveCapturedImagesOnce();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [capturedImages, notebookId, idx]);

  function selectBrush() {
    setShowColors(o => !o);
    setMenuOpen(false);
  }
  function pickColor(c) {
    setBrushColor(c);
    setEraserOn(false);
    setCanDraw(true);
    setShowColors(false);
    setMenuOpen(false);
  }
  function toggleEraser() {
    setEraserOn(on => !on);
    setCanDraw(true);
    setShowColors(false);
    setMenuOpen(false);
  }

  // Open sticker picker (do NOT close text mode)
  function selectStickers() {
    setShowStickers(s => !s);
    setShowColors(false);
    setMenuOpen(false);
    setCanDraw(false);
  }

  // Toggle text mode (do NOT close sticker picker)
  function selectText() {
    setTextMode(t => !t);
    setMenuOpen(false);
    setShowColors(false);
    setCanDraw(false);
  }

  // When text mode active, add text on page click
  function handleAddTextClick(e) {
    if (!textMode) return;
    const area = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - area.left;
    const y = e.clientY - area.top;
    const content = window.prompt('Enter text');
    if (!content) {
      setTextMode(false);
      return;
    }
    const id = Date.now();
    textRefs.current[id] = createRef();
    setTextItems(ts => [...ts, { id, x, y, text: content }]);
    setTextMode(false);
  }

  // Callback to add sticker from StickerPicker
  function handleAddSticker(src) {
    const id = Date.now();
    stickerRefs.current[id] = createRef();
    const newSticker = { id, src, x: 50, y: 50 }; // Default position
    setStickersOnPage([...stickersOnPage, newSticker]);
    setShowStickers(false); // close sticker picker after selecting a sticker
  }

  function handlePrint() {
    window.print();
  }

  // New: Handle background change and optionally update URL state for navigation sharing
  const handleChangeBackground = () => {
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
    // Optionally update URL with new bgIndex (if you want to keep state across navigation)
    // navigate(location.pathname, { replace: true, state: { ...location.state, bgIndex: (bgIndex + 1) % backgrounds.length } });
  };

  console.log('Notebook received:', { capturedImages, selectedFrame, frameMode });

  return (
    <>
      <img src={backgroundImage} className="wall-bg" alt="background" />

      {/* Change background button */}
      <ChangeBgColor backgrounds={backgrounds} bgIndex={bgIndex} onChange={handleChangeBackground} />
    
      <div className="top-nav">
        <img
          src={menuIcon}
          alt="menu"
          className="menu-icon"
          onClick={() => setMenuOpen(o => !o)}
        />

        <div className="notebook-name" onDoubleClick={handleNameDoubleClick}>
        {isEditingName ? (
          <input
            type="text"
            value={notebookName}
            autoFocus
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur();
            }}
            className="notebook-name-input"
          />
        ) : (
          <h2 className="notebook-name-text">{notebookName}</h2>
        )}
      </div>

        <div style={{ position: 'relative' }}>
  <img
    src={bell}
    alt="notifications"
    className="bell-icon"
    onClick={() => {
      setShowNotificationsDropdown(!showNotificationsDropdown);
      setShowUserListDropdown(false);
      setShowShareDropdown(false);
    }}
    style={{ cursor: 'pointer' }}
  />

  {showNotificationsDropdown && (
    <div className="dropdown notifications-dropdown">
      {notifications.length === 0 ? (
        <p>No new invitations</p>
      ) : (
        notifications.map(n => (
          <p key={n.id}>{n.senderName} has invited you to join {n.notebookName}</p>
        ))
      )}
    </div>
  )}
</div>
       
        
        {menuOpen && (
          <div className="menu-dropdown">
            <div className="dropdown-item" onClick={selectBrush}>brush</div>
            <div className="dropdown-item" onClick={selectStickers}>stickers</div>
            <div className="dropdown-item" onClick={selectText}>add text</div>
          </div>
        )}
      </div>

      {/* Bottom right corner icons */}
      <div className="bottom-right-icons">
        <img src={printer} alt="print" onClick={handlePrint} />
        <div style={{ position: 'relative' }}>
            <img 
              src={user} 
              alt="user" 
              onClick={() => {
                setShowUserListDropdown(!showUserListDropdown);
                setShowShareDropdown(false);
                setShowNotificationsDropdown(false);
              }} 
              style={{ cursor: 'pointer' }}
            />
            
            {showUserListDropdown && (
              <div className="dropdown user-list-dropdown">
                {sharedUsers.length === 0 ? (
                  <p>No users have access.</p>
                ) : (
                  sharedUsers.map(uid => <p key={uid}>{uid /* replace with username if you fetch more info */}</p>)
                )}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src={share}
              alt="share"
              onClick={() => {
                setShowShareDropdown(!showShareDropdown);
                setShowUserListDropdown(false);
                setShowNotificationsDropdown(false);
              }}
              style={{ cursor: 'pointer' }}
            />
            
            {showShareDropdown && (
              <div className="dropdown share-dropdown">
                <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchUserInput}
                  onChange={handleSearchChange}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchClick();
                    }
                  }}
                  style={{ flexGrow: 1 }}
                />
                <button onClick={handleSearchClick}>Search</button>
              </div>

                <div className="search-results">
                  {searchResults.length === 0 ? <p>No users found</p> :
                    searchResults.map(user => {
                      const displayName = user.email.split('@')[0]; // username part
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleAddSharedUser(user)}
                          className="search-result-item"
                        >
                          {displayName}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
      </div>

      <div
        className="logo-bottom-left"
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        <img src={logo} alt="MiMeMo logo" style={{ height: '40px' }} />
      </div>

      {showColors && (
        <div className="color-panel">
          {palette.map(c => (
            <div
              key={c}
              className="color-swatch"
              style={{ background: c }}
              onClick={() => pickColor(c)}
              
            />
          ))}
          <div className="eraser-button" onClick={toggleEraser}>
            <img src={eraser} alt="eraser" />
          </div>
        </div>
      )}

      <div className="nb-viewer">
        <button className="nb-nav prev" onClick={prev} disabled={idx === 0}>‹</button>

        <div className="nb-pages notebook-area" onClick={handleAddTextClick}>
          <img src={pages[idx]} className="nb-page" alt="" />
          <img src={pages[idx + 1]} className="nb-page" alt="" />

          <div
            className={`canvas-wrapper ${canDraw || eraserOn ? 'draw-enabled' : ''}`}
          >
            <ReactSketchCanvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              strokeWidth={4}
              strokeColor={brushColor}
              eraserWidth={16}
              canvasColor="transparent"
            />
          </div>

          {/* Sticker picker: pass the callback */}
          {showStickers && <StickerPicker bounds=".notebook-area" addSticker={handleAddSticker} />}

          {/* Render draggable stickers */}
          {stickersOnPage.map(({ id, src, x, y, width = 100, height = 100, rotation = 0 }) => {
            const isSelected = selectedStickerId === id;

            return (
              <Rnd
                key={id}
                size={{ width, height }}
                position={{ x, y }}
                bounds=".notebook-area"
                onDragStop={(e, d) => {
                  setStickersOnPage(prev =>
                    prev.map(s => s.id === id ? { ...s, x: d.x, y: d.y } : s)
                  );
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  const newWidth = parseInt(ref.style.width, 10);
                  const newHeight = parseInt(ref.style.height, 10);
                  setStickersOnPage(prev =>
                    prev.map(s => s.id === id ? { ...s, width: newWidth, height: newHeight, x: position.x, y: position.y } : s)
                  );
                }}
                style={{ 
                  transform: `rotate(${rotation}deg)`, 
                  position: 'absolute', 
                  zIndex: isSelected ? 10 : 1, 
                  cursor: 'move' 
                }}
                enableResizing={{
                  top: true, right: true, bottom: true, left: true,
                  topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                }}
                onClick={() => setSelectedStickerId(id)}
              >
                <ResizableElement
                  key={`${id}-${rotation}`}  // force remount on rotation change
                  id={id}
                  src={src}
                  isSelected={isSelected}
                  onSelect={(clickedId) => setSelectedStickerId(clickedId)}
                  style={{ width: '100%', height: '100%' }}
                  rotation={rotation}
                  onResize={() => { /* handled by Rnd */ }}
                  onRotate={(deg) => {
                    setStickersOnPage(prev =>
                      prev.map(s => s.id === id ? { ...s, rotation: deg } : s)
                    );
                  }}
                  onDelete={(deletedId) => {
                    setStickersOnPage(prev => prev.filter(s => s.id !== deletedId));
                    if (selectedStickerId === deletedId) setSelectedStickerId(null);
                  }}
                />
              </Rnd>
            );
          })}

          {/* Render draggable text */}
          {textItems.map(({ id, text, x, y, width = 150, height = 50, rotation = 0 }) => {
          const isSelected = selectedStickerId === id; // You can rename this state or manage separately if needed

          return (
            <Rnd
              key={id}
              size={{ width, height }}
              position={{ x, y }}
              bounds=".notebook-area"
              onDragStop={(e, d) => {
                setTextItems(prev =>
                  prev.map(t => t.id === id ? { ...t, x: d.x, y: d.y } : t)
                );
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newWidth = parseInt(ref.style.width, 10);
                const newHeight = parseInt(ref.style.height, 10);
                setTextItems(prev =>
                  prev.map(t => t.id === id ? { ...t, width: newWidth, height: newHeight, x: position.x, y: position.y } : t)
                );
              }}
              style={{
                transform: `rotate(${rotation}deg)`,
                position: 'absolute',
                zIndex: isSelected ? 10 : 1,
                cursor: 'move',
                background: 'transparent'
              }}
              enableResizing={{
                top: true, right: true, bottom: true, left: true,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
              }}
              onClick={() => setSelectedStickerId(id)} // you can rename or create separate selection state for text
            >
              <ResizableElement
                id={id}
                isSelected={isSelected}
                onSelect={(clickedId) => setSelectedStickerId(clickedId)}
                rotation={rotation}
                style={{ width: '100%', height: '100%', padding: 10, boxSizing: 'border-box' }}
                onResize={() => { /* handled by Rnd */ }}
                onRotate={(deg) => {
                  setTextItems(prev =>
                    prev.map(t => t.id === id ? { ...t, rotation: deg } : t)
                  );
                }}
                onDelete={() => {
                  setTextItems(prev => prev.filter(t => t.id !== id));
                  if (selectedStickerId === id) setSelectedStickerId(null);
                }}
              >
                <div
                  style={{
                      width: '100%',
                      height: '100%',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontSize: 16,
                      userSelect: 'text',
                      cursor: isSelected ? 'text' : 'default',
                      color: 'black',
                      backgroundColor: 'rgba(255,255,255,0.8)', // add a light semi-transparent background
                      padding: '4px',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                  }}
                >
                  {text}
                </div>
              </ResizableElement>
            </Rnd>
          );
        })}
        </div>

        <button className="nb-nav next" onClick={next} disabled={idx >= total - 2}>›</button>
      </div>

      <div className="page-counter">
        {idx + 1}–{idx + 2} / {total}
      </div>
    </>
  );
}

export default Notebook;
