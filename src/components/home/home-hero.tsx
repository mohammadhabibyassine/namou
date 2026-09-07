import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HeroObject } from "@/components/home/hero-object";

export function HomeHero() {
  return (
    <section className="namou-container border-line bg-surface mt-3 overflow-hidden rounded-xl border">
      <div className="grid min-h-[38rem] lg:grid-cols-[1.05fr_.75fr_.75fr]">
        <div className="border-line relative flex min-h-[31rem] flex-col justify-between overflow-hidden border-b p-6 sm:p-9 lg:border-r lg:border-b-0">
          <span className="technical-label text-subtle">
            Drop index{" "}
            <strong className="text-foreground ml-7 font-medium">
              DROP 02
            </strong>
          </span>
          <div className="relative z-10 py-12">
            <h1 className="display-title text-[clamp(5.8rem,12vw,11rem)]">
              Move
              <br />
              Different.
            </h1>
            <Link
              href="/shop?sort=newest"
              className="bg-acid mt-9 inline-flex min-h-12 items-center gap-12 rounded-lg px-6 font-mono text-xs uppercase transition-transform motion-safe:hover:scale-105 motion-safe:hover:shadow-lg"
            >
              Shop drop 02 <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="flex items-end justify-between">
            <div className="technical-label">
              Built for motion
              <br />
              Defined by utility
            </div>
            <div className="text-subtle hidden font-mono text-[10px] leading-6 sm:block">
              01
              <br />
              <span className="text-acid">02 →</span>
              <br />
              03
              <br />
              04
            </div>
          </div>
        </div>
        <div className="group border-line relative min-h-[28rem] overflow-hidden border-b bg-[#111215] lg:border-r lg:border-b-0">
          <Image
            src="/images/hero-editorial.jpg"
            alt="Namou technical outerwear in motion"
            fill
            priority
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover object-center contrast-105 transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/40" />

          {/* Top Editorial Label */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
            <span className="bg-acid size-1.5 animate-pulse rounded-full" />
            <span className="font-mono text-[9px] tracking-widest text-white/70 uppercase">
              Lookbook // N-02
            </span>
          </div>

          {/* Bottom Spec & Classification */}
          <div className="absolute inset-x-6 bottom-6 z-10 flex items-end justify-between border-t border-white/10 pt-3">
            <div>
              <span className="text-acid block font-mono text-[9px] tracking-wider uppercase">
                Technical Outerwear
              </span>
              <span className="font-mono text-xs font-semibold tracking-wide text-white uppercase">
                Field Shell / 02
              </span>
            </div>
            <span className="font-mono text-[9px] text-white/50 uppercase">
              Stormproof Spec
            </span>
          </div>
        </div>
        <HeroObject />
      </div>
    </section>
  );
}
