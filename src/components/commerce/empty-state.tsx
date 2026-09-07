import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  code,
  title,
  message,
  actionLabel = "Enter system",
  actionHref = "/shop",
}: {
  icon?: ReactNode;
  code?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="hairline-panel technical-grid mx-auto grid min-h-[34rem] max-w-2xl place-items-center overflow-hidden p-8 text-center">
      <div>
        <div className="border-line bg-background text-subtle mx-auto grid size-36 place-items-center rounded-full border shadow-[inset_0_0_0_24px_rgb(0_0_0/0.02)] sm:size-40">
          {icon ? (
            icon
          ) : code ? (
            <span className="display-title text-ink text-6xl">{code}</span>
          ) : (
            <PackageOpen
              className="size-14 stroke-[1.25] sm:size-16"
              aria-hidden="true"
            />
          )}
        </div>
        <h1 className="display-title mt-8 text-5xl sm:text-7xl">{title}</h1>
        <p className="text-subtle mx-auto mt-4 max-w-md text-sm leading-6">
          {message}
        </p>
        <Link
          href={actionHref}
          className="bg-acid text-ink mt-7 inline-flex min-h-11 items-center gap-8 rounded-lg px-5 font-mono text-xs uppercase transition-transform motion-safe:hover:scale-105"
        >
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
