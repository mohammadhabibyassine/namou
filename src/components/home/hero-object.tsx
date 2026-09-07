import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";

export function HeroObject() {
  return (
    <Link
      href="/shop"
      className="group relative flex h-full min-h-[28rem] flex-col justify-between overflow-hidden bg-[#070908] p-6 select-none sm:p-7"
      aria-label="Namou modular carry system - Adaptable Object 02"
    >
      {/* High-Resolution Studio Product Visual */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-object.jpg"
          alt="Namou Modular Tactical Sling Backpack 02"
          fill
          priority
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="object-cover object-center contrast-105 transition-transform duration-700 motion-safe:group-hover:scale-105"
        />
        {/* Subtle cinematic gradient overlays for depth and legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Subtle Tactical HUD Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] opacity-15"
        aria-hidden="true"
      />

      {/* Top HUD Bar */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[9px] tracking-widest text-white/70 uppercase">
        <div className="flex items-center gap-2">
          <span className="bg-acid size-1.5 animate-pulse rounded-full" />
          <span className="text-acid">360° System View</span>
        </div>
        <span className="border border-white/20 bg-white/5 px-2 py-0.5 backdrop-blur-sm">
          Object // 02
        </span>
      </div>

      {/* Floating Tactical Spec Tags */}
      <div className="relative z-10 my-auto flex flex-col items-start gap-2.5">
        <div className="border-acid/80 border-l bg-black/60 py-1 pl-2.5 backdrop-blur-md">
          <span className="block font-mono text-[8px] tracking-wider text-white/50 uppercase">
            Hardware Spec
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-wide text-white uppercase">
            Fidlock® V-Buckle
          </span>
        </div>
        <div className="group-hover:border-acid border-l border-white/40 bg-black/60 py-1 pl-2.5 backdrop-blur-md transition-colors">
          <span className="block font-mono text-[8px] tracking-wider text-white/50 uppercase">
            Construction
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-wide text-white uppercase">
            Cordura® 500D / Weatherproof
          </span>
        </div>
      </div>

      {/* Bottom HUD Bar & Action */}
      <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
        <div>
          <span className="text-acid block font-mono text-[9px] tracking-wider uppercase">
            Modular Apparatus
          </span>
          <span className="font-mono text-xs font-semibold tracking-wide text-white uppercase">
            Adaptable Object 02
          </span>
        </div>

        <div className="group-hover:text-acid flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/80 uppercase transition-colors">
          <span>Explore</span>
          <MoveRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
