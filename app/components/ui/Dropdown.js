import React from 'react';

export default function Dropdown({ label, options = [], value, onChange, valueKey = "value", labelKey = "label", defaultOption = "All" }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        className="w-full p-2 text-sm border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
