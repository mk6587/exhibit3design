import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide transition-all duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-from to-primary-to text-white rounded-md shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_30px_rgba(124,58,237,0.6)] hover:-translate-y-[2px] animate-gradient-shift bg-[length:200%_100%]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-sm hover:-translate-y-[1px] rounded-md",
        outline:
          "border-2 border-accent bg-transparent text-accent rounded-md hover:bg-accent hover:text-background hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-[250ms]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-[1px] rounded-md",
        ghost: "hover:bg-primary/10 hover:scale-[1.02] rounded-md transition-all duration-[250ms]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] px-5 text-sm",
        sm: "h-[36px] px-3 text-xs",
        lg: "h-[52px] px-6 text-base",
        icon: "h-[44px] w-[44px]",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
