import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "minimal" | "underline" | "glass"
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", error = false, success = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "minimal-input",
          {
            "border-red-500 focus-visible:ring-red-500": error,
            "border-green-500 focus-visible:ring-green-500": success,
            "border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0": variant === "underline",
            "glass border-white/20": variant === "glass",
            "bg-transparent focus-visible:ring-0": variant === "minimal",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
