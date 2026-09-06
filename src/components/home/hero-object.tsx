import { MoveRight } from "lucide-react";

export function HeroObject() {
  return (
    <div
      className="relative h-full min-h-[25rem] overflow-hidden bg-[radial-gradient(circle_at_56%_45%,#303431_0,#151817_35%,#080a0a_72%)] sm:min-h-[36rem]"
      aria-label="Namou modular carry system illustration"
      role="img"
    >
      <div className="absolute inset-0 [background-image:linear-gradient(120deg,transparent_40%,rgb(255_255_255/.08)_41%,transparent_42%)] [background-size:38px_38px] opacity-25" />
      <div className="absolute top-1/2 left-1/2 h-[65%] w-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[26%_30%_32%_30%] border border-white/10 bg-gradient-to-br from-[#353a37] via-[#111514] to-[#272a28] shadow-[0_35px_90px_rgb(0_0_0/.6)] before:absolute before:top-[13%] before:-left-[23%] before:h-[14%] before:w-[142%] before:rotate-12 before:rounded-full before:border-[12px] before:border-[#1d211f] after:absolute after:inset-[13%] after:rounded-[18%] after:border after:border-white/15" />
      <div className="absolute top-[43%] left-[45%] h-[31%] w-[29%] -rotate-12 rounded-[18%] border border-white/15 bg-[#161918] shadow-xl">
        <div className="absolute inset-x-[12%] top-[14%] h-px bg-white/20" />
        <div className="absolute right-[12%] bottom-[12%] size-8 rounded-full border border-white/15" />
      </div>
      <div className="absolute inset-[9%] rounded-full border border-dashed border-white/20" />
      <div className="text-acid absolute bottom-7 left-7 font-mono text-[10px] uppercase">
        360° system view
      </div>
      <div className="absolute right-7 bottom-7 flex items-center gap-2 font-mono text-[9px] text-white/60 uppercase">
        Adaptable object <MoveRight size={14} />
      </div>
    </div>
  );
}
