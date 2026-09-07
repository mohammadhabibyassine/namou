import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

const spinnerSizes = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
} as const;

export interface LoadingSpinnerProps extends Omit<
  ComponentProps<typeof LoaderCircle>,
  "size"
> {
  /** Controls the visual size without coupling callers to icon dimensions. */
  size?: keyof typeof spinnerSizes;
  /** Announces the loading state to assistive technology. */
  label?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading",
  ...props
}: LoadingSpinnerProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      role="status"
      aria-label={label}
    >
      <LoaderCircle
        aria-hidden="true"
        className={cn("animate-spin", spinnerSizes[size], className)}
        {...props}
      />
    </span>
  );
}
