import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function BrandMark({
  admin = false,
  className,
}: {
  admin?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={admin ? "/admin" : "/"}
      className={cn(
        "inline-flex items-baseline gap-2 font-black tracking-[0.13em] uppercase",
        className,
      )}
      aria-label={admin ? "Namou Admin home" : "Namou home"}
    >
      <span>NAMOU</span>
      {admin ? (
        <span className="font-mono text-[9px] font-medium tracking-normal">
          Admin
        </span>
      ) : null}
    </Link>
  );
}
