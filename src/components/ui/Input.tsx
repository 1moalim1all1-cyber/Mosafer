import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        <input
          ref={ref}
          className={`
            w-full rounded-xl border-2 bg-card px-4 py-3 text-base text-text-primary
            placeholder:text-disabled transition-colors duration-150
            focus:outline-none focus:ring-4 focus:ring-primary/20
            ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}
            ${className}
          `}
          {...rest}
        />
        {error && <span className="text-sm text-danger">{error}</span>}
        {!error && hint && <span className="text-sm text-text-secondary">{hint}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
