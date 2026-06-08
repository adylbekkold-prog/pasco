interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`form-label ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
