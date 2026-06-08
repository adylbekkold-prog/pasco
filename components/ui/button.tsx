import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-all duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1e5ac8]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#1e5ac8] text-white shadow-[0_2px_8px_rgba(30,90,200,0.25)] hover:bg-[#1e3a8a] hover:shadow-[0_4px_12px_rgba(30,90,200,0.3)] active:scale-95',
        outline:
          'border-[#d1d5db] bg-white text-[var(--text)] shadow-[var(--shadow-sm)] hover:border-[#1e5ac8] hover:bg-[#f8f9fa] hover:text-[#1e5ac8]',
        secondary:
          'border-[var(--border)] bg-[var(--background-2)] text-[var(--text)] shadow-[var(--shadow-sm)] hover:bg-[var(--background-3)] hover:border-[#1e5ac8]',
        ghost: 'border-transparent bg-transparent text-[var(--muted)] hover:bg-[#f0f4ff] hover:text-[#1e5ac8]',
        destructive:
          'border-[#fecaca] bg-[#fee2e2] text-[#dc2626] shadow-none hover:bg-[#fecaca] hover:text-[#991b1b]',
        link: 'border-transparent bg-transparent px-0 text-[#1e5ac8] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        xs: 'h-8 rounded-md px-3 text-xs',
        sm: 'h-9 rounded-md px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'size-10',
        'icon-xs': 'size-8 rounded-md',
        'icon-sm': 'size-9 rounded-md',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-size={size}
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
