import React from 'react';
import "../css/ChangeBgColor.css";

function ChangeBgColor({ backgrounds, bgIndex, onChange }) {

  return (
    <>
      <p
        className="change-color"
        onClick={onChange}  // <-- make sure this triggers the passed function
        style={{ cursor: 'pointer' }}
      >
        Change background color?
      </p>
    </>
  );
}

export default ChangeBgColor;
