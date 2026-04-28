import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full border border-[var(--line)] bg-black/40 px-3 py-2 text-sm font-mono text-[var(--fg)] transition-colors outline-none placeholder:text-[var(--muted-color)] focus-visible:border-[var(--green)] focus-visible:shadow-[0_0_0_1px_var(--green),0_0_18px_-4px_rgba(182,255,60,0.55)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--red)] aria-invalid:shadow-[0_0_0_1px_var(--red)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
