import React from 'react';

function Checkbox({ checked, onChange, label = '', className = '', style = {} }) {
  return (
    <label className={className} style={style}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export default Checkbox;
