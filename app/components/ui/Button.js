import React from 'react';

function Button({
  children,
  onClick,
  type = 'button',
  style = {},
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60';

  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
