import React, { useState, useRef, useEffect, createRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import StickerPicker from '../components/StickerPicker';
import ResizableElement from '../components/ResizableElement';
import { Rnd } from 'react-rnd';
  


import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, limit, arrayUnion, onSnapshot, deleteDoc  } from 'firebase/firestore';


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

  const backgrounds = [blueBg, pinkBg, beigeBg, blackBg];
  const [bgIndex, setBgIndex] = useState(initialBgIndex);

  const backgroundImage = backgrounds[bgIndex];

  const pages = [page1, page2, page3, page4, page5, page6, page7, page8, page9, page10];
  const total = pages.length;

  const [linkedName, setLinkedName] = useState(null);


  const [idx, setIdx] = useState(0);

const [showShareDropdown, setShowShareDropdown] = useState(false);
const [showUserListDropdown, setShowUserListDropdown] = useState(false);
const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

const [searchUserInput, setSearchUserInput] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [sharedUsers, setSharedUsers] = useState([]); // loaded shared users for this notebook

const [notifications, setNotifications] = useState([]); // your invitation notifications

const pendingInvitationsCount = notifications.filter(n => n.status === 'pending').length;

const [actualNotebookId, setActualNotebookId] = useState(notebookId);

const [linkedNotebookId, setLinkedNotebookId] = useState(null);
const [userRoles, setUserRoles] = useState({}); // { userId: 'owner' | 'invited' }
const [existing, setExisting] = useState(null);

const [editingTextId, setEditingTextId] = useState(null);
const [editingTextValue, setEditingTextValue] = useState('');

const [notebookOwnerId, setNotebookOwnerId] = useState(null);



const pagesListeners = useRef([]); // to track active page listeners for cleanup

// New async handler for logo click
const handleLogoClick = async () => {
  await savePageData(idx + 1);
  navigate('/');
};


useEffect(() => {
  const checkLinkedNotebook = async () => {
    const currentNotebookRef = doc(db, 'notebooks', notebookId);
    const currentSnap = await getDoc(currentNotebookRef);
    const data = currentSnap.data();
    if (data.linkedNotebookId) {
      setActualNotebookId(data.linkedNotebookId);
    }
  };
  checkLinkedNotebook();
}, [notebookId]);

useEffect(() => {
  if (!userId) return;

  const notifRef = collection(db, 'users', userId, 'notifications');

  // Real-time listener
  const unsubscribe = onSnapshot(notifRef, snapshot => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotifications(notifs);
  });

  return () => unsubscribe();
}, [userId]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [eraserOn, setEraserOn] = useState(false);
  const [canDraw, setCanDraw] = useState(false);

  const [selectedStickerId, setSelectedStickerId] = useState(null);
  
const [sharedUsersData, setSharedUsersData] = useState([]); // [{id, username, role}]



  // This controls whether StickerPicker is visible in Notebook (NOT StickerPicker’s internal state)
  const [showStickers, setShowStickers] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textItems, setTextItems] = useState([]);

  // Maintain stickers placed on page here (array of {id, src, x, y})
  const [stickersOnPage, setStickersOnPage] = useState([]);
  const [brushPaths, setBrushPaths] = useState([]);

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
    for (const sticker of stickersOnPage) {
      const stickerDoc = doc(stickersCollection, String(sticker.id));
      await setDoc(stickerDoc, sticker);
    }

    // Save texts
    const textsCollection = collection(pageRef, 'texts');
    for (const text of textItems) {
      const textDoc = doc(textsCollection, String(text.id));
      await setDoc(textDoc, text);
      console.log('Saved text:', text);
    }

    // Save brush data
    const brushDataCollection = collection(pageRef, 'brushData');
    const brushDoc = doc(brushDataCollection, 'paths');
    const paths = canvasRef.current ? await canvasRef.current.exportPaths() : [];
    await setDoc(brushDoc, { paths });
  }


  // After loading notebook data (in your existing listener)
useEffect(() => {
  if (existing) {
    setNotebookOwnerId(existing.owner);
  }
}, [existing]);

// Then in your fetch users effect:
useEffect(() => {
  async function fetchUsersInfo() {
    if (!userId || !sharedUsers.length || !notebookOwnerId) {
      setSharedUsersData([]);
      return;
    }

    const userIdsSet = new Set([notebookOwnerId, ...sharedUsers]); // Ensure owner is included
    const userIds = Array.from(userIdsSet);

    const userDocs = await Promise.all(
      userIds.map(uid => getDoc(doc(db, 'users', uid)))
    );

    const usersData = userDocs
      .filter(docSnap => docSnap.exists())
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          username: data.username || 'Unknown',
          role: docSnap.id === notebookOwnerId ? 'owner' : 'invited',
        };
      });

    // Sort owner first
    usersData.sort((a, b) => (a.role === 'owner' ? -1 : 1));
    setSharedUsersData(usersData);
  }

  fetchUsersInfo();
}, [sharedUsers, notebookOwnerId]);
  

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

  // Fetch user info (username) for shared users + owner
useEffect(() => {
  async function fetchUsersInfo() {
    if (!userId || !sharedUsers.length) {
      setSharedUsersData([]);
      return;
    }

    // Include owner + sharedUsers, avoid duplicates
    const userIdsSet = new Set([userId, ...sharedUsers]);
    const userIds = Array.from(userIdsSet);

    // Fetch all user docs in parallel
    const userDocs = await Promise.all(
      userIds.map(uid => getDoc(doc(db, 'users', uid)))
    );

    const usersData = userDocs
      .filter(docSnap => docSnap.exists())
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          username: data.username || 'Unknown',
          role: docSnap.id === userId ? 'owner' : 'invited',
        };
      });

    // Sort owner first, then invited
    usersData.sort((a, b) => (a.role === 'owner' ? -1 : 1));
    setSharedUsersData(usersData);
  }

  fetchUsersInfo();
}, [sharedUsers, userId]);

  useEffect(() => {
  async function checkLinkedNotebook() {
    if (!notebookId) return;
    const notebookRef = doc(db, 'notebooks', notebookId);
    const notebookSnap = await getDoc(notebookRef);
    if (!notebookSnap.exists()) return;

    const data = notebookSnap.data();
    setLinkedNotebookId(data.linkedNotebookId || null);
    setActualNotebookId(data.linkedNotebookId || notebookId);
  }
  checkLinkedNotebook();
}, [notebookId]);



useEffect(() => {
  // Clean up previous listeners
  pagesListeners.current.forEach(unsub => unsub());
  pagesListeners.current = [];

  function listenToNotebookPages(nId) {
    if (!nId) return;

    // Stickers
    const stickersCol = collection(db, 'notebooks', nId, 'pages', 'page1', 'stickers');
    const unsubStickers = onSnapshot(stickersCol, snap => {
      const stickers = snap.docs.map(d => ({ ...d.data(), notebookId: nId }));
      setStickersOnPage(prev => {
        // Remove previous stickers from this notebook then merge new
        const others = prev.filter(s => s.notebookId !== nId);
        return [...others, ...stickers];
      });
    });
    pagesListeners.current.push(unsubStickers);

    // Texts
    const textsCol = collection(db, 'notebooks', nId, 'pages', 'page1', 'texts');
    const unsubTexts = onSnapshot(textsCol, snap => {
      const texts = snap.docs.map(d => ({ ...d.data(), notebookId: nId }));
      setTextItems(prev => {
        const others = prev.filter(t => t.notebookId !== nId);
        return [...others, ...texts];
      });
    });
    pagesListeners.current.push(unsubTexts);

    // Brush paths
    const brushDocRef = doc(db, 'notebooks', nId, 'pages', 'page1', 'brushData', 'paths');
    const unsubBrush = onSnapshot(brushDocRef, docSnap => {
      if (!docSnap.exists()) return;
      const paths = docSnap.data().paths || [];
      setBrushPaths(paths); // Simplified; overwrite with latest paths
    });
    pagesListeners.current.push(unsubBrush);
  }

  // Listen on actual notebook
  listenToNotebookPages(actualNotebookId);

  // Also listen on linked notebook if different
  if (linkedNotebookId && linkedNotebookId !== actualNotebookId) {
    listenToNotebookPages(linkedNotebookId);
  }

  return () => {
    pagesListeners.current.forEach(unsub => unsub());
    pagesListeners.current = [];
  };
}, [actualNotebookId, linkedNotebookId]);

  // On mount, load page 1 and 2
  useEffect(() => {
    loadPageData(1);
  }, []);

  useEffect(() => {
  async function fetchLinkedName() {
    if (existing && existing.isLinked && existing.linkedNotebookId) {
      const linkedRef = doc(db, 'notebooks', existing.linkedNotebookId);
      const linkedSnap = await getDoc(linkedRef);
      if (linkedSnap.exists()) {
        setLinkedName(linkedSnap.data().bookName);
      }
    } else {
      setLinkedName(null);
    }
  }
  fetchLinkedName();
}, [existing]);

// When rendering:
const displayName = existing?.isLinked ? linkedName || existing.bookName : existing?.bookName || 'Untitled';

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

  const unsubscribe = onSnapshot(notebookRef, snapshot => {
    if (!snapshot.exists()) return;
    const data = snapshot.data();

    setNotebookName(data.bookName || 'Untitled');
    setSharedUsers(data.sharedUsers || []);
    setLinkedNotebookId(data.linkedNotebookId || null);

    // Set roles: owner + invited users
    const roles = {};
    roles[data.owner] = 'owner';
    (data.sharedUsers || []).forEach(uid => {
      if (uid !== data.owner) roles[uid] = 'invited';
    });
    setUserRoles(roles);

    setExisting(data);  // <-- Update existing here!
  });

  return () => unsubscribe();
}, [notebookId]);

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

  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('username', '>=', val),
    where('username', '<=', val + '\uf8ff'),
    limit(5)
  );

  const snapshot = await getDocs(q);

  console.log("Firestore search results:", snapshot.docs.map(doc => doc.data()));

  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setSearchResults(results);
};



const handleSendInvitation = async (userToInvite) => {
  if (!notebookId) return;

  try {
    // Fetch sender's username dynamically
    const senderDoc = await getDoc(doc(db, 'users', userId));
    const senderName = senderDoc.exists() ? senderDoc.data().username : 'Unknown';

    // Add an invitation doc under invited user's notifications collection
    const notifRef = collection(db, 'users', userToInvite.id, 'notifications');
    await addDoc(notifRef, {
      senderId: userId,
      senderName,  // actual sender's username
      notebookId,
      status: 'pending',
      timestamp: new Date()
    });

    alert(`Invitation sent to ${userToInvite.username}`);
  } catch (error) {
    console.error("Failed to send invitation:", error);
    alert("Failed to send invitation.");
  }
};

const handleNameBlur = async () => {
  setIsEditingName(false);
  if (!notebookId) return;

  const notebookRef = doc(db, 'notebooks', notebookId);
  await updateDoc(notebookRef, { bookName: notebookName });

  const notebookSnap = await getDoc(notebookRef);
  if (!notebookSnap.exists()) return;
  const notebookData = notebookSnap.data();

  if (notebookData.owner === userId && notebookData.linkedNotebookId) {
    const linkedRef = doc(db, 'notebooks', notebookData.linkedNotebookId);
    await updateDoc(linkedRef, { bookName: notebookName });
  }
};

const handleAcceptInvitation = async (notification) => {
  try {
    // 1. Update notification status to "accepted"
    const notifDocRef = doc(db, 'users', userId, 'notifications', notification.id);
    await updateDoc(notifDocRef, { status: 'accepted' });

    // 2. Find an empty notebook in user2's shelf (userId) where isLinked == false
    const notebooksRef = collection(db, 'notebooks');
    const q = query(
      notebooksRef,
      where('owner', '==', userId),
    );
    const emptyNotebooksSnap = await getDocs(q);

    if (emptyNotebooksSnap.empty) {
      alert('No empty notebook available to assign.');
      return;
    }

    const emptyNotebookDoc = emptyNotebooksSnap.docs[0];
    const emptyNotebookRef = doc(db, 'notebooks', emptyNotebookDoc.id);

    // 3. Assign inviter's notebookId to this empty notebook's linkedNotebookId field and set isLinked = true
    await updateDoc(emptyNotebookRef, {
      linkedNotebookId: notification.notebookId,  // Set to inviter's notebook id
      isLinked: true,
    });

    // 4. Update the original notebook's sharedUsers to include this user
      const inviterNotebookRef = doc(db, 'notebooks', notification.notebookId);
      await updateDoc(inviterNotebookRef, {
        sharedUsers: arrayUnion(userId)
      });

    // After setting isLinked: true
    const inviterSnap = await getDoc(inviterNotebookRef);
    const inviterName = inviterSnap.exists() ? inviterSnap.data().bookName : 'Linked Notebook';

    await updateDoc(emptyNotebookRef, {
      bookName: inviterName,
    });

    alert('Invitation accepted. Notebook shared.');
  } catch (error) {
    console.error('Error accepting invitation:', error);
    alert('Failed to accept invitation.');
  }
};

const handleRejectInvitation = async (notification) => {
  try {
    // Just update notification status to "declined"
    const notifDocRef = doc(db, 'users', userId, 'notifications', notification.id);
    await updateDoc(notifDocRef, { status: 'declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    alert('Failed to decline invitation.');
  }
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

    // Save right after adding new text
    savePageData(idx + 1);
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


  const handleZIndexChange = (id, delta) => {
  // Update stickers zIndex
  setStickersOnPage(prev =>
    prev.map(s => {
      if (s.id === id) {
        const newZ = Math.max(0, (s.zIndex || 1) + delta); // prevent negative zIndex
        return { ...s, zIndex: newZ };
      }
      return s;
    })
  );

  // Update texts zIndex
  setTextItems(prev =>
    prev.map(t => {
      if (t.id === id) {
        const newZ = Math.max(0, (t.zIndex || 1) + delta);
        return { ...t, zIndex: newZ };
      }
      return t;
    })
  );
};

  // Delete sticker from Firestore and update state
const handleDeleteSticker = async (deletedId) => {
  if (!notebookId) return;

  try {
    const pageNumber = idx + 1;
    const stickerDocRef = doc(db, 'notebooks', notebookId, 'pages', `page${pageNumber}`, 'stickers', String(deletedId));
    await deleteDoc(stickerDocRef);

    setStickersOnPage(prev => prev.filter(s => s.id !== deletedId));

    if (selectedStickerId === deletedId) setSelectedStickerId(null);
  } catch (error) {
    console.error("Failed to delete sticker:", error);
  }
};

// Delete text from Firestore and update state
const handleDeleteText = async (deletedId) => {
  if (!notebookId) return;

  try {
    const pageNumber = idx + 1;
    const textDocRef = doc(db, 'notebooks', notebookId, 'pages', `page${pageNumber}`, 'texts', String(deletedId));
    await deleteDoc(textDocRef);

    setTextItems(prev => prev.filter(t => t.id !== deletedId));

    if (selectedStickerId === deletedId) setSelectedStickerId(null);
    if (editingTextId === deletedId) setEditingTextId(null);
  } catch (error) {
    console.error("Failed to delete text:", error);
  }
};

  function timeAgo(timestamp) {
  if (!timestamp) return 'unknown time';

  // If timestamp is Firestore Timestamp, convert to Date
  let dateObj;
  if (typeof timestamp.toDate === 'function') {
    dateObj = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    dateObj = timestamp;
  } else if (typeof timestamp === 'number') {
    dateObj = new Date(timestamp);
  } else {
    return 'unknown time';
  }

  const now = new Date();
  const diff = (now - dateObj) / 1000; // difference in seconds

  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
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
          <h2 className="notebook-name-text">{displayName}</h2>
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
        style={{ cursor: 'pointer', position: 'relative' }}
      />

      {pendingInvitationsCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'red',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {pendingInvitationsCount}
        </div>
      )}

  {showNotificationsDropdown && (
    <div className="dropdown notifications-dropdown">
      {notifications.length === 0 ? (
        <p>No new invitations</p>
      ) : (
        notifications.map(n => (
          <div key={n.id} style={{ marginBottom: '8px' }}>
    <p>
      {n.senderName} has invited you to join {n.notebookName} — {timeAgo(n.timestamp)}
    </p>
    {n.status === 'pending' && (
      <>
        <button onClick={() => handleAcceptInvitation(n)}>Accept</button>
        <button onClick={() => handleRejectInvitation(n)}>Reject</button>
      </>
    )}
  </div>
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
                {sharedUsersData.length === 0 ? (
                  <p>No users have access.</p>
                ) : (
                  sharedUsersData.map(user => (
                    <p key={user.id}>
                      {user.username} <span className="role-label">({user.role})</span>
                    </p>
                  ))
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
                  {searchResults.length === 0 ? (
                    <p>No users found</p>
                  ) : (
                    searchResults
                      .filter(user => user.id !== userId) // exclude current user by comparing IDs
                      .map(user => (
                        <div key={user.id} className="search-result-item">
                          <span>{user.username}</span>
                          <button
                            onClick={() => handleSendInvitation(user)}
                            style={{ marginLeft: '8px' }}
                            aria-label={`Invite ${user.username}`}
                          >
                            +
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
      </div>

      <div
        className="logo-bottom-left"
          onClick={handleLogoClick}
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
          {stickersOnPage.map((item) => {
            const { id, src, x, y, width = 100, height = 100, rotation = 0, zIndex = 1 } = item;
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
                  zIndex: zIndex + (isSelected ? 1000 : 0),
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
                  onChangeZIndex={(delta) => handleZIndexChange(id, delta)}
                  style={{ width: '100%', height: '100%' }}
                  rotation={rotation}
                  onResize={() => { /* handled by Rnd */ }}
                  onRotate={(deg) => {
                    setStickersOnPage(prev =>
                      prev.map(s => s.id === id ? { ...s, rotation: deg } : s)
                    );
                  }}
                  onDelete={handleDeleteSticker}
                />
              </Rnd>
            );
          })}

          {/* Render draggable text */}
          {textItems.map((item) => {
            const { id, text, x, y, width = 150, height = 50, rotation = 0, zIndex = 1 } = item;
            const isSelected = selectedStickerId === id;
            const isEditing = editingTextId === id;

            return (
              <Rnd
                key={`${id}-${rotation}-${isEditing ? 'editing' : 'view'}`}
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
                  zIndex: zIndex + (isSelected ? 1000 : 0),
                  cursor: 'move',
                  background: 'transparent',
                  color: 'black',
                  userSelect: isEditing ? 'text' : 'none',
                }}
                onClick={() => setSelectedStickerId(id)}
                onDoubleClick={() => {
                  setEditingTextId(id);
                  setEditingTextValue(text || '');
                }}
                enableResizing={{
                  top: true, right: true, bottom: true, left: true,
                  topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                }}
              >
                <ResizableElement
                  id={id}
                  text={isEditing ? null : text}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  onSelect={(clickedId) => setSelectedStickerId(clickedId)}
                  style={{ width: '100%', height: '100%', padding: 4, overflow: 'auto', cursor: isSelected ? 'text' : 'default', color: 'black' }}
                  onChangeZIndex={(delta) => handleZIndexChange(id, delta)}
                  rotation={rotation}
                  onResize={() => { /* handled by Rnd */ }}
                  onRotate={(deg) => {
                    setTextItems(prev =>
                      prev.map(t => t.id === id ? { ...t, rotation: deg } : t)
                    );
                  }}
                  onDelete={handleDeleteText}
                />
                {isEditing && (
                  <textarea
                    autoFocus
                    value={editingTextValue}
                    onChange={e => setEditingTextValue(e.target.value)}
                    onBlur={async () => {
                      setTextItems(prev =>
                        prev.map(t => t.id === id ? { ...t, text: editingTextValue } : t)
                      );
                      setEditingTextId(null);
                      setEditingTextValue(''); // <--- Reset here
                      await savePageData(idx + 1);
                    }}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setTextItems(prev =>
                          prev.map(t => t.id === id ? { ...t, text: editingTextValue } : t)
                        );
                        setEditingTextId(null);
                        setEditingTextValue(''); // <--- Reset here
                        await savePageData(idx + 1);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      resize: 'none',
                      fontSize: 16,
                      boxSizing: 'border-box',
                      userSelect: 'auto',
                      color: 'black',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1000,
                    }}
                  />
                )}
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
