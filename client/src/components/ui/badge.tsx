import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500 text-primary-foreground hover:bg-primary-500/80",
        secondary:
          "border-transparent bg-secondary-500 text-secondary-foreground hover:bg-secondary-500/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success/20 text-success hover:bg-success/30",
        warning: "border-transparent bg-warning/20 text-warning hover:bg-warning/30",
        info: "border-transparent bg-info/20 text-info hover:bg-info/30",
        error: "border-transparent bg-destructive/20 text-destructive hover:bg-destructive/30",
        tutorial: "border-transparent bg-primary-500/20 text-primary-400 hover:bg-primary-500/30",
        review: "border-transparent bg-secondary-500/20 text-secondary-400 hover:bg-secondary-500/30",
        news: "border-transparent bg-info/20 text-info hover:bg-info/30",
        analysis: "border-transparent bg-accent-400/20 text-accent-400 hover:bg-accent-400/30",
        promo: "border-transparent bg-warning/20 text-warning hover:bg-warning/30",
        other: "border-transparent bg-light-300/20 text-light-300 hover:bg-light-300/30",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-0.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
