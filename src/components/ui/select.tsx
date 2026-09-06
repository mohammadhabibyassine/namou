import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "border-line bg-surface text-ink focus:border-ink focus:ring-acid/70 disabled:bg-muted aria-invalid:border-danger aria-invalid:ring-danger/20 min-h-11 w-full rounded-xl border px-4 py-2 text-base transition outline-none focus:ring-2 disabled:cursor-not-allowed",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
