import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide transition-all duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white neumorphic hover:glow-purple hover:-translate-y-[1px] transition-all duration-[250ms]",
        destructive:
          "bg-destructive text-destructive-foreground neumorphic-flat hover:glow-accent hover:-translate-y-[1px]",
        outline:
          "border-2 border-primary/30 bg-transparent text-white neumorphic-inset hover:border-primary hover:text-primary transition-all duration-[250ms]",
        secondary:
          "bg-secondary text-secondary-foreground neumorphic-flat hover:-translate-y-[1px]",
        ghost: "hover:bg-primary/10 hover:scale-[1.02] transition-all duration-[250ms]",
        link: "text-purple underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] px-5 text-sm rounded-2xl",
        sm: "h-[36px] px-3 text-xs rounded-xl",
        lg: "h-[52px] px-6 text-base rounded-3xl",
        icon: "h-[44px] w-[44px] rounded-2xl",
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
