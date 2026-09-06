import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        {eyebrow ? (
          <p className="technical-label text-subtle mb-2">{eyebrow}</p>
        ) : null}
        <h2 className="display-title text-4xl sm:text-6xl">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="mb-1 inline-flex items-center gap-3 font-mono text-[10px] uppercase hover:opacity-60"
        >
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}
