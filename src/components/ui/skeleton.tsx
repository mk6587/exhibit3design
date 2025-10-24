import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      const computedStyle = window.getComputedStyle(ref.current);
      const bgColor = computedStyle.backgroundColor;
      console.log('🎨 Skeleton background color:', bgColor);
      console.log('🎨 CSS variable --muted:', getComputedStyle(document.documentElement).getPropertyValue('--muted'));
      console.log('🎨 Dark mode class present:', document.documentElement.classList.contains('dark'));
    }
  }, []);
  
  return (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
