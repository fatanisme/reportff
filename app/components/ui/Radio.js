import React from 'react';

function Radio({ name, value, checked, onChange, label = '', className = '', style = {} }) {
  return (
    <label className={className} style={style}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

export default Radio;
