import React from 'react';

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  valueKey = "value",
  labelKey = "label",
  defaultOption = "All",
  disabled = false,
  className = '',
}) {
  const baseClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500';

  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        className={combinedClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="All">{defaultOption}</option>
        {options.map((option) => (
          <option key={option.ID || option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
