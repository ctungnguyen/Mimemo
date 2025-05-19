import React, { useRef, useState, useEffect } from 'react';
import delete_icon from '../assets/resizable/delete.png';
import rotate_icon from '../assets/resizable/rotate.png';

function ResizableElement({ id, src, text, isSelected, onSelect, style = {}, onResize, onDelete, onRotate, rotation = 0 }) {
  const elementRef = useRef(null);
  const [size, setSize] = useState({ width: style.width || 100, height: style.height || 100 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationDisplayPos, setRotationDisplayPos] = useState({ x: 0, y: 0 });

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
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);  // This invokes the delete function passed from the parent
  };

  // Sync rotation prop changes

  return (
    <div
      ref={elementRef}
      className={`resizable-box resizable-element ${isSelected ? 'selected' : ''}`} // ADD `resizable-box`
      style={{
        width: size.width,
        height: size.height,
        transformOrigin: 'center center',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
      }}
      onClick={() => onSelect(id)}
    >
      {src && <img src={src} alt="sticker" style={{ width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none' }} />}
      {text && <div style={{ padding: 4 }}>{text}</div>}

      {isSelected && (
        <>
          {/* Delete button (circle) */}
          <div
            onClick={handleDeleteClick}
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

          {/* Rotate button (circle) */}
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

          {/* Rotation degree display */}
          {isRotating && (
            <div
              style={{
                position: 'fixed',
                top: rotationDisplayPos.y,
                left: rotationDisplayPos.x,
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
