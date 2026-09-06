import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "border-line bg-surface text-ink focus:border-ink focus:ring-acid/70 disabled:bg-muted disabled:text-subtle aria-invalid:border-danger aria-invalid:ring-danger/20 min-h-11 w-full rounded-xl border px-4 py-2 text-base transition outline-none focus:ring-2 disabled:cursor-not-allowed",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = "Input";
