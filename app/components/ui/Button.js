import React from 'react';

function Button({ children, onClick, type = 'button', style = {}, className = '' }) {
  return (
    <button type={type} onClick={onClick} style={style} className={className}>
      {children}
    </button>
  );
}

export default Button;
