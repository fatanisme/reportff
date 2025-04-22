import React from 'react';

function Modal({ isOpen, onClose, children, className = '', style = {} }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div style={{ margin: '10% auto', padding: 20, background: 'white', ...style }} className={className}>
        <button onClick={onClose} style={{ float: 'right' }}>X</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
