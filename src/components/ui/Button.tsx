import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'success'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-md shadow-primary/20 disabled:bg-disabled disabled:text-text-secondary disabled:shadow-none',
  secondary:
    'bg-card text-primary border-2 border-primary hover:bg-primary-light active:scale-[0.98] disabled:border-disabled disabled:text-disabled',
  danger:
    'bg-danger text-white hover:bg-red-600 active:scale-[0.98] shadow-md shadow-danger/20 disabled:bg-disabled disabled:text-text-secondary',
  success:
    'bg-success text-white hover:bg-green-600 active:scale-[0.98] shadow-md shadow-success/20 disabled:bg-disabled disabled:text-text-secondary',
}

/**
 * زرار موحّد لكل التطبيق - بيغطي كل الحالات المطلوبة (Default, Hover,
 * Active, Focus, Disabled, Loading) من مكان واحد، عشان أي تغيير يطبّق
 * على كل زرار في المشروع تلقائيًا.
 */
export function Button({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5
        text-base font-semibold transition-all duration-200
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
        disabled:cursor-not-allowed disabled:transform-none
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant]}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
