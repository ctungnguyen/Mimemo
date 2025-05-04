import React, { useState, useRef, useEffect, createRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Draggable from 'react-draggable';
import StickerPicker from '../components/StickerPicker';

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


function Notebook() {
  
  const pages = [page1, page2, page3, page4, page5, page6, page7, page8, page9, page10];
  const total = pages.length;

  // we show two pages at a time: so max start index is total-2
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => Math.max(i - 2, 0));
  const next = () => setIdx(i => Math.min(i + 2, total - 2));

  const [menuOpen, setMenuOpen]   = useState(false);
  const [showColors, setShowColors]= useState(false);
  const [brushColor, setBrushColor]= useState('#000000');
  const [eraserOn, setEraserOn]   = useState(false);
  const [canDraw,    setCanDraw]    = useState(false);

  const [showStickers, setShowStickers] = useState(false);

  const [textMode,      setTextMode]      = useState(false);
  const [textItems,     setTextItems]     = useState([]);

  // a ref map for text
  const textRefs = useRef({});

  const canvasRef = useRef(null);

  // palette of hexes (you can tweak)
  const palette = [
    '#2f007e','#4b0082','#800080','#9932CC','#BA55D3','#DA70D6','#EE82EE','#D8BFD8','#DDA0DD',
    '#8B0000','#B22222','#FF0000','#FF4500','#FF6347','#FF7F50','#FF8C00','#FFA500','#FFD700',
    '#556B2F','#6B8E23','#7CFC00','#32CD32','#00FF00','#00FA9A','#00FF7F','#00FFFF','#40E0D0',
    '#00008B','#0000CD','#0000FF','#4169E1','#1E90FF','#00BFFF','#87CEEB','#ADD8E6','#B0E0E6'
  ];

    // whenever eraserOn flips, toggle eraseMode on the canvas
    useEffect(() => {
      if (canvasRef.current) {
        canvasRef.current.eraseMode(eraserOn);
      }
    }, [eraserOn]);

  function selectBrush() {
    setShowColors(o=>!o);
    setMenuOpen(false);
  }
  function pickColor(c) {
    setBrushColor(c);
    setEraserOn(false);    // fire the effect above
    setCanDraw(true);
    setShowColors(false);
    setMenuOpen(false);
  }
  function toggleEraser() {
    setEraserOn(on => !on);  // fire the effect above
    setCanDraw(true);
    setShowColors(false);
    setMenuOpen(false);
  }

  function selectStickers() {
    setShowStickers(s => !s);
    setShowColors(false);
    setMenuOpen(false);
  }

  function selectText() {
    setTextMode(t => !t);
    setMenuOpen(false);
    setShowColors(false);
    setShowStickers(false);
  }

  // when in “add text” mode, click on pages to place
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
    // create a ref for this item
    textRefs.current[id] = createRef();
    setTextItems(ts => [
      ...ts,
      { id, x, y, text: content }
    ]);
    setTextMode(false);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* top bar including page function (drawing,texting,stickers) */}
      <div className="top-nav">
      <img
          src={menuIcon}
          alt="menu"
          className="menu-icon"
          onClick={() => setMenuOpen(o => !o)}
        />
        {menuOpen && (
          <div className="menu-dropdown">
            <div className="dropdown-item" onClick={selectBrush}>
              brush
            </div>
            <div className="dropdown-item" onClick={selectStickers}>
              stickers
            </div>
            <div className="dropdown-item">layers</div>
            <div className="dropdown-item">frame</div>
            <div className="dropdown-item" onClick={selectText}>add text</div>
          </div>
        )}
      </div>

      {/* right nav(print, share, icon) */}
      <div className="right-nav">
      <img
          src={printer}
          alt="print"
          className="print-icon"
          onClick={handlePrint}
        />
      </div>

      {/* color‐picker panel */}
      {showColors && (
        <div className="color-panel">
          {palette.map(c => (
            <div
              key={c}
              className="color-swatch"
              style={{ background: c }}
              onClick={()=>pickColor(c)}
            />
          ))}
          <div className="eraser-button" onClick={toggleEraser}>
            <img src={eraser} alt="eraser" />
          </div>
        </div>
      )}

      {/* pages + nav */}
      <div className="nb-viewer">
        <button className="nb-nav prev" onClick={prev} disabled={idx===0}>‹</button>

        <div className="nb-pages notebook-area" onClick={handleAddTextClick}>
          <img src={pages[idx]}     className="nb-page" alt="" />
          <img src={pages[idx+1]} className="nb-page" alt="" />

          <div
            className="canvas-wrapper"
            style={{ pointerEvents: (canDraw || eraserOn) ? 'auto' : 'none' }}
          >
          <ReactSketchCanvas
            ref={canvasRef}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
            strokeWidth={4}
            strokeColor={brushColor}
            eraserWidth={16}
            canvasColor="transparent"
          />
          </div>

          {/* sticker picker */}
          {showStickers && <StickerPicker bounds=".notebook-area" />}

          {/* draggable text items */}
          {textItems.map(item => (
            <Draggable
              key={item.id}
              nodeRef={textRefs.current[item.id]}
              bounds=".notebook-area"
              defaultPosition={{ x: item.x, y: item.y }}
            >
              <div ref={textRefs.current[item.id]} className="text-item">
                {item.text}
              </div>
            </Draggable>
          ))}
          
        </div>

        <button
          className="nb-nav next"
          onClick={next}
          disabled={idx >= total - 2}
        >
          ›
        </button>
      </div>

      {/* page counter */}
      <div className="page-counter">
        {idx + 1}–{idx + 2} / {total}
      </div>
    </>
  )
}

export default Notebook
