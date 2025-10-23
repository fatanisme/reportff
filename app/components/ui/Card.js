import React from 'react';

function Card({ children, className = '', style = {}, padded = true }) {
  const baseClasses = 'rounded-xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm';
  const spacing = padded ? 'p-6' : '';
  const combinedClassName = [baseClasses, spacing, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
}

export default Card;
