import React from 'react';

function Radio({ name, value, checked, onChange, label = '', className = '', style = {}, ...props }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-slate-700 ${className}`.trim()} style={style}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border border-slate-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      {label && <span className="select-none">{label}</span>}
    </label>
  );
}

export default Radio;
