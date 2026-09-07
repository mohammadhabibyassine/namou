import Image from "next/image";

export function AuthVisual() {
  return (
    <div className="relative hidden min-h-[38rem] overflow-hidden rounded-xl border border-white/10 bg-[#0c0e0e] lg:block lg:min-h-[44rem]">
      {/* High-Resolution Campaign Imagery */}
      <Image
        src="/images/auth-editorial.jpg"
        alt="Namou Identity Campaign - Technical Outerwear"
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-center brightness-95 contrast-[1.08] transition-transform duration-700 motion-safe:hover:scale-105"
      />

      {/* Cinematic Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
      <div className="bg-radial-at-c absolute inset-0 from-transparent via-transparent to-black/50" />

      {/* Subtle Tactical HUD Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] opacity-15"
        aria-hidden="true"
      />

      {/* Top HUD Metadata */}
      <div className="relative z-10 flex items-start justify-between p-8 font-mono text-[9px] tracking-widest text-white/70 uppercase">
        <div>
          <span className="block text-white/40">Location Coordinates</span>
          <span className="font-medium text-white/80">
            37.5665° N · 126.9780° E
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-md">
          <span className="bg-acid size-1.5 animate-pulse rounded-full" />
          <span className="text-acid">Identity System</span>
        </div>
      </div>

      {/* Center Atmospheric Quote / Spec */}
      <div className="relative z-10 my-auto px-8 py-16">
        <span className="border-acid block border-l-2 pl-3 font-mono text-[10px] tracking-widest text-white/60 uppercase">
          Protocol // N-02
        </span>
        <h2 className="mt-2 font-mono text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          Your Objects.
          <br />
          Your Movement.
        </h2>
      </div>

      {/* Bottom Brand Mark & Status */}
      <div className="relative z-10 flex items-end justify-between border-t border-white/10 bg-black/30 p-8 text-white backdrop-blur-sm">
        <div>
          <p className="text-2xl font-black tracking-[.18em] text-white">
            NAMOU
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-wider text-white/50 uppercase">
            Move to begin · Encrypted session
          </p>
        </div>
        <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">
          Secured Port
        </span>
      </div>
    </div>
  );
}
