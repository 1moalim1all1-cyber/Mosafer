import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({ checked, onChange, label, disabled = false, id }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
          checked
            ? 'bg-primary border-primary'
            : 'border-gray-300 hover:border-primary'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && <Check size={16} className="text-white" />}
      </div>
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
