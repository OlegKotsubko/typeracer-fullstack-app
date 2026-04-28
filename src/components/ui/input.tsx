import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 border border-[var(--line)] bg-black/40 px-3 py-1 text-sm font-mono text-[var(--fg)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--fg)] placeholder:text-[var(--muted-color)] focus-visible:border-[var(--green)] focus-visible:shadow-[0_0_0_1px_var(--green),0_0_18px_-4px_rgba(182,255,60,0.55)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--red)] aria-invalid:shadow-[0_0_0_1px_var(--red)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
