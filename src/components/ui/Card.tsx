import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
}

export function Card({ children, hoverable = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-border bg-card p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.08)]
        ${hoverable ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.12)] cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  )
}
