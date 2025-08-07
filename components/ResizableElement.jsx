import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import delete_icon from '../assets/resizable/delete.png';
import rotate_icon from '../assets/resizable/rotate.png';

import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase'; // your firebase config import


function ResizableElement({ id, src, text,isEditing, isSelected, onChangeZIndex, onSelect, style = {}, onResize, onDelete, onRotate, rotation = 0, children }) {
  const elementRef = useRef(null);
  const [size, setSize] = useState({ width: style.width || 100, height: style.height || 100 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationDisplayPos, setRotationDisplayPos] = useState({ x: 0, y: 0 });
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);


  const [editingTextId, setEditingTextId] = useState(null);
const [editingTextValue, setEditingTextValue] = useState('');
const [textItems, setTextItems] = useState([]);
const { notebookId } = useParams();  // or however you get notebookId
const [idx, setIdx] = useState(0);

  const latestRotationRef = useRef(rotation);

useEffect(() => {
  latestRotationRef.current = rotation;
}, [rotation]);



useEffect(() => {
  setSize({ width: style.width || 100, height: style.height || 100 });
}, [style.width, style.height]);

  const MIN_SIZE = 30;

  // Resize logic
  const handleMouseDown = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner.includes('right')) newWidth = Math.max(MIN_SIZE, startWidth + dx);
      if (corner.includes('left')) newWidth = Math.max(MIN_SIZE, startWidth - dx);
      if (corner.includes('bottom')) newHeight = Math.max(MIN_SIZE, startHeight + dy);
      if (corner.includes('top')) newHeight = Math.max(MIN_SIZE, startHeight - dy);

      setSize({ width: newWidth, height: newHeight });
      onResize && onResize({ width: newWidth, height: newHeight });
      
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Rotate logic with continuous update to parent
  const handleRotateMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = latestRotationRef.current;

    const onMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      let rotationDeg = initialRotation + currentAngle - startAngle;
      rotationDeg = ((rotationDeg % 360) + 360) % 360;

      onRotate && onRotate(rotationDeg);

      setRotationDisplayPos({ x: moveEvent.clientX + 10, y: moveEvent.clientY - 30 });
    };


    const onMouseUp = () => {
      setIsRotating(false);

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Delete handler
  

  // Sync rotation prop changes

  return (
    <div
      ref={elementRef}
      className={`resizable-box resizable-element ${isSelected ? 'selected' : ''}`}
      style={{
        width: size.width,
        height: size.height,
        transformOrigin: 'center center',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
        userSelect: 'none',
      }}
      onClick={() => onSelect(id)}
    >
      {src && !text && <img src={src} alt="sticker" style={{ width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none', }} />}
      {text && !src && !children && <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>{text}</div>}
      {/* If editing, render children (textarea) */}
      {children}

      {/* The delete and rotate buttons as before */}
      {isSelected && (
        <>
          {/* Delete button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(id);
            }}
            style={{
              position: 'absolute',
              top: -20,
              left: '40%',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid #e61e1e',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 1000,
            }}
            title="Delete"
          >
            <img src={delete_icon} alt="delete" style={{ width: 14, height: 14 }} />
          </div>

          {/* Rotate button */}
          <div
            onMouseDown={handleRotateMouseDown}
            style={{
              position: 'absolute',
              top: -20,
              left: '60%',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid #666',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab',
              userSelect: 'none',
              zIndex: 1000,
            }}
            title="Rotate"
          >
            <img src={rotate_icon} alt="rotate" style={{ width: 14, height: 14 }} />
          </div>

          {/* Layer button */}
          <div
            onClick={e => {
              e.stopPropagation();
              setShowLayerDropdown(prev => !prev);
            }}
            style={{
              position: 'absolute',
              top: -20,
              left: '80%',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid #666',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: 1000,
            }}
            title="Layer options"
          >
            {/* You can put a symbol or icon here, e.g. a small triangle or lines */}
            <span style={{fontWeight: 'bold'}}>≡</span>
          </div>



          {showLayerDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 30,
                left: '80%',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1100,
                userSelect: 'none',
                width: 100,
                fontSize: 14,
              }}
            >
              <div
                style={{ padding: '6px 12px', cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  onRotate && setShowLayerDropdown(false);
                  onChangeZIndex && onChangeZIndex(1);
                }}
              >
                Move Up
              </div>
              <div
                style={{ padding: '6px 12px', cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  onRotate && setShowLayerDropdown(false);
                  onChangeZIndex && onChangeZIndex(-1);
                }}
              >
                Move Down
              </div>
            </div>
          )}

          {/* Rotation degree display */}
          {isRotating && (
            <div
              style={{
                position: 'fixed',
                top: -50,    // position above rotate button
                left: '60%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1100,
              }}
            >
              {Math.round(rotation)}°
            </div>
          )}

          {isEditing && (
            <textarea
              autoFocus
              value={editingTextValue}
              onChange={e => setEditingTextValue(e.target.value)}
              onBlur={async () => {
                // Update local state immediately
                setTextItems(prev =>
                  prev.map(t => (t.id === id ? { ...t, text: editingTextValue } : t))
                );
                setEditingTextId(null);

                // Save only the changed text to Firestore
                if (notebookId) {
                  const pageNumber = idx + 1;
                  const textDocRef = doc(db, 'notebooks', notebookId, 'pages', `page${pageNumber}`, 'texts', String(id));
                  await updateDoc(textDocRef, { text: editingTextValue });
                }
              }}
              onKeyDown={async e => {
                if (e.key === 'Enter') {
                  e.preventDefault();

                  setTextItems(prev =>
                    prev.map(t => (t.id === id ? { ...t, text: editingTextValue } : t))
                  );
                  setEditingTextId(null);

                  if (notebookId) {
                    const pageNumber = idx + 1;
                    const textDocRef = doc(db, 'notebooks', notebookId, 'pages', `page${pageNumber}`, 'texts', String(id));
                    await updateDoc(textDocRef, { text: editingTextValue });
                  }
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                resize: 'none',
                fontSize: 16,
                boxSizing: 'border-box',
                userSelect: 'auto',
                color: 'black',      // keep text black
                backgroundColor: 'transparent', // remove dark background on editing
                border: 'none',      // optional: remove border for cleaner look
                outline: 'none',     // remove default focus outline
              }}
            />
          )}

          {/* Resize handles */}
          <div className="resize-handle top-left" onMouseDown={(e) => handleMouseDown(e, 'top-left')} />
          <div className="resize-handle top-right" onMouseDown={(e) => handleMouseDown(e, 'top-right')} />
          <div className="resize-handle bottom-left" onMouseDown={(e) => handleMouseDown(e, 'bottom-left')} />
          <div className="resize-handle bottom-right" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')} />
        </>
      )}
    </div>
  );
}

export default ResizableElement;
