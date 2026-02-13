import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "minimal-button relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-minimal-lg active:scale-[0.98]",
        destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-minimal-lg active:scale-[0.98]",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-subtle",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        success: "bg-green-500 text-white hover:bg-green-600 hover:shadow-minimal-lg active:scale-[0.98]",
        warning: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-minimal-lg active:scale-[0.98]",
        info: "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-minimal-lg active:scale-[0.98]",
        glass: "glass text-foreground hover:bg-white/20 dark:hover:bg-neutral-800/20 hover:shadow-elevated",
        minimal: "bg-transparent border border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
        "icon-xl": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  shimmer?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, shimmer = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
            {shimmer && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
