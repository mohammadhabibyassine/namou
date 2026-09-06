import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "border-line bg-surface text-ink focus:border-ink focus:ring-acid/70 disabled:bg-muted aria-invalid:border-danger aria-invalid:ring-danger/20 min-h-28 w-full resize-y rounded-xl border px-4 py-3 text-base transition outline-none focus:ring-2 disabled:cursor-not-allowed",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
