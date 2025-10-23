import React from 'react';

function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  style = {},
  ...props
}) {
  const baseClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={combinedClassName}
      style={style}
      {...props}
    />
  );
}

export default Input;
