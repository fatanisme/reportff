import React from 'react';

function Card({ children, className = '', style = {} }) {
  return (
    <div className={className} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', ...style }}>
      {children}
    </div>
  );
}

export default Card;
