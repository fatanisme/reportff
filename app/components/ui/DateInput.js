// components/DateInput.jsx
export default function DateInput({ value, onChange }) {
    return (
      <input
        type="date"
        className="w-full p-2 text-sm border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  