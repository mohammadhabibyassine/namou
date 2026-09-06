export function AuthVisual() {
  return (
    <div className="relative hidden min-h-[42rem] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_40%_38%,#3b403d,#0b0d0d_68%)] lg:block">
      <div className="absolute top-[44%] left-1/2 h-[64%] w-[55%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] rounded-[22%] border border-white/10 bg-gradient-to-br from-[#444945] via-[#141716] to-[#292d2a] shadow-[0_35px_80px_rgb(0_0_0/.65)] before:absolute before:top-[18%] before:-left-[35%] before:h-[14%] before:w-[165%] before:rounded-full before:border-[14px] before:border-[#171a19] after:absolute after:inset-[12%] after:rounded-[18%] after:border after:border-white/20" />
      <div className="absolute inset-x-7 top-7 flex justify-between font-mono text-[9px] text-white/55 uppercase">
        <span>
          37.5665° N<br />
          126.9780° E
        </span>
        <span className="text-right">
          Identity layer
          <br />
          Secure access
        </span>
      </div>
      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between text-white">
        <div>
          <p className="text-4xl font-black tracking-[.14em]">NAMOU</p>
          <p className="mt-2 font-mono text-[9px] text-white/50 uppercase">
            Move to begin.
          </p>
        </div>
        <span className="bg-acid size-2 rounded-full" />
      </div>
    </div>
  );
}
