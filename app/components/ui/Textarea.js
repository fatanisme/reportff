import React from 'react';

function Textarea({ value, onChange, placeholder = '', className = '', style = {} }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={style}
    />
  );
}

export default Textarea;
