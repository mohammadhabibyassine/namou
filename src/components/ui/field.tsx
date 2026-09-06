import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

export function FieldLabel({
  className,
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={cn("text-ink text-sm font-semibold", className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-subtle text-sm", className)} {...props} />;
}

export function FieldError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn("text-danger text-sm font-medium", className)}
      {...props}
    >
      {children}
    </p>
  );
}
