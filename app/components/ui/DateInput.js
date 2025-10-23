// components/DateInput.jsx
export default function DateInput({ value, onChange, disabled = false, className = '', ...props }) {
  const baseClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500';

  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <input
      type="date"
      className={combinedClassName}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      {...props}
    />
  );
}
