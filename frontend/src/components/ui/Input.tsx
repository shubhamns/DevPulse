import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function Input({
  className,
  type,
  label,
  error,
  id,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string
  error?: string
}) {
  const inputId = id ?? props.name
  const field = (
    <input
      id={inputId}
      type={type}
      data-slot="input"
      aria-invalid={Boolean(error) || undefined}
      className={cn(
        "field-input file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )

  if (!label) {
    return field
  }

  return (
    <div className="grid w-full gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      {field}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export { Input }
