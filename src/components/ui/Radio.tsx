import React from 'react';

interface RadioProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function Radio({ value, checked, onChange, label, disabled = false, name, id }: RadioProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 border-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
          checked
            ? 'bg-primary border-primary'
            : 'border-gray-300 hover:border-primary'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && onChange(value)}
      >
        {checked && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
