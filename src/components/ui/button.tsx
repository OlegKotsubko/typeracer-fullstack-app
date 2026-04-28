import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-mono uppercase tracking-[0.12em] text-[12px] font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--green)]/60 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "chamfer bg-[var(--green)] text-[var(--green-ink)] hover:brightness-110 shadow-[0_0_0_1px_rgba(0,0,0,0.4)_inset,0_8px_24px_-8px_rgba(182,255,60,0.55)]",
        secondary:
          "bg-[var(--pink)] text-[var(--pink-ink)] hover:brightness-110 shadow-[0_0_0_1px_rgba(0,0,0,0.4)_inset,0_8px_24px_-8px_rgba(255,45,157,0.55)]",
        ghost:
          "bg-transparent text-[var(--fg)] shadow-[inset_0_0_0_1px_var(--line)] hover:text-[var(--green)] hover:shadow-[inset_0_0_0_1px_var(--green)]",
        outline:
          "bg-transparent text-[var(--fg)] shadow-[inset_0_0_0_1px_var(--line-hi)] hover:bg-[var(--surface-2)]",
        destructive:
          "bg-[var(--red)]/15 text-[var(--red)] shadow-[inset_0_0_0_1px_var(--red)]/40 hover:bg-[var(--red)]/25",
        link: "text-[var(--green)] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 gap-2",
        sm: "h-8 px-3 text-[11px] gap-1.5 chamfer-sm",
        lg: "h-[52px] px-7 text-[13px] gap-2",
        xs: "h-6 px-2 text-[10px] gap-1 chamfer-sm",
        icon: "size-10",
        "icon-xs": "size-6 chamfer-sm",
        "icon-sm": "size-8 chamfer-sm",
        "icon-lg": "size-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
