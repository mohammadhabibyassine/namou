import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-ink bg-ink text-white",
        accent: "border-signal-border bg-signal text-signal-foreground shadow-[0_1px_0_rgb(255_255_255/.12)_inset,0_5px_0_rgb(23_63_52/.12)] hover:border-signal-hover hover:bg-signal-hover hover:shadow-[0_1px_0_rgb(255_255_255/.14)_inset,0_8px_18px_rgb(23_63_52/.2)] hover:-translate-y-0.5",
        secondary: "border-line bg-surface text-ink",
        ghost: "border-transparent bg-transparent text-ink shadow-none",
        danger: "border-danger bg-danger text-white",
      },
      size: {
        sm: "min-h-9 rounded-lg px-3 text-xs",
        md: "min-h-11 px-5",
        lg: "min-h-13 rounded-2xl px-7 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  pending?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, children, disabled, pending = false, variant, size, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={props.type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
