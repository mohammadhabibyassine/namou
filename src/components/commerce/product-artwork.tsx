import { cn } from "@/lib/utils/cn";

type ArtworkKind = "jacket" | "footwear" | "carry" | "wearable" | "generic";

function artworkKind(slug: string, category?: string): ArtworkKind {
  const value = `${slug} ${category ?? ""}`.toLowerCase();
  if (value.includes("jacket") || value.includes("shell")) return "jacket";
  if (value.includes("motion") || value.includes("footwear")) return "footwear";
  if (value.includes("bag") || value.includes("carry")) return "carry";
  if (value.includes("wearable") || value.includes("object")) return "wearable";
  return "generic";
}

function TechnicalJacket() {
  return (
    <g>
      <path
        d="M112 73 160 52l48 21 35 42 41 103-37 17-27-68v137H140V167l-27 68-37-17 41-103Z"
        fill="#151719"
      />
      <path d="M135 64c2-31 48-31 50 0l-25 29Z" fill="#26292c" />
      <path d="M160 91v213" stroke="#34383b" strokeWidth="4" />
      <path d="m146 106 14 20 14-20" fill="none" stroke="#555a5e" />
      <rect x="111" y="165" width="36" height="54" rx="4" fill="#25282b" />
      <rect x="173" y="165" width="36" height="54" rx="4" fill="#25282b" />
      <path d="M119 178h20M181 178h20" stroke="#4a4e52" strokeWidth="2" />
      <path d="M91 139 73 202M229 139l18 63" stroke="#393d40" strokeWidth="3" />
    </g>
  );
}

function MotionShoe() {
  return (
    <g>
      <path
        d="M53 195c-2-42 19-72 53-63 24 6 37 35 67 48 32 14 84 13 92 43 8 32-40 42-101 40-50-1-94 3-114-18Z"
        fill="#17191b"
      />
      <path
        d="M45 235c38 21 154 24 225-3 2 19-11 34-36 38H80c-23-2-35-14-35-35Z"
        fill="#292c2f"
      />
      <path
        d="m94 143 50 57 91 24"
        fill="none"
        stroke="#3d4247"
        strokeWidth="6"
      />
      <path
        d="m112 159 44 10m-34 8 46 11m-35 7 46 10"
        stroke="#5a6065"
        strokeWidth="3"
      />
      <path
        d="M70 227c51 11 136 10 181-4"
        fill="none"
        stroke="#666b70"
        strokeWidth="2"
      />
    </g>
  );
}

function ModularBag() {
  return (
    <g>
      <path
        d="M81 132c-16 58-12 125 30 155 37 27 132 25 147-36 7-28-1-83-12-119"
        fill="none"
        stroke="#24272a"
        strokeWidth="17"
      />
      <rect x="94" y="94" width="132" height="151" rx="13" fill="#151719" />
      <rect x="87" y="84" width="146" height="39" rx="7" fill="#292c2f" />
      <path d="M109 154h102M109 170h102" stroke="#35393d" strokeWidth="3" />
      <rect x="121" y="185" width="78" height="44" rx="6" fill="#222528" />
      <circle cx="205" cy="141" r="5" fill="#62676b" />
    </g>
  );
}

function WearableObject() {
  return (
    <g>
      <ellipse cx="160" cy="184" rx="111" ry="69" fill="#292c2f" />
      <ellipse cx="160" cy="169" rx="101" ry="55" fill="#111315" />
      <rect
        x="113"
        y="141"
        width="94"
        height="79"
        rx="22"
        fill="#202326"
        stroke="#44494e"
        strokeWidth="3"
      />
      <circle
        cx="160"
        cy="180"
        r="27"
        fill="#151719"
        stroke="#3c4145"
        strokeWidth="3"
      />
      <path d="M160 161v20l12 8" fill="none" stroke="#5e6469" strokeWidth="4" />
      <path
        d="M82 154c20-43 136-43 156 0"
        fill="none"
        stroke="#363a3e"
        strokeWidth="4"
      />
    </g>
  );
}

function GenericObject() {
  return (
    <g>
      <path d="m160 59 91 53v105l-91 53-91-53V112Z" fill="#17191b" />
      <path
        d="m160 59v105l91-52M160 164 69 112"
        fill="none"
        stroke="#484d51"
        strokeWidth="3"
      />
      <circle
        cx="160"
        cy="164"
        r="29"
        fill="#25282b"
        stroke="#60666b"
        strokeWidth="3"
      />
    </g>
  );
}

export function ProductArtwork({
  slug,
  title,
  category,
  className,
  detailed = false,
}: {
  slug: string;
  title: string;
  category?: string;
  className?: string;
  detailed?: boolean;
}) {
  const kind = artworkKind(slug, category);
  return (
    <div
      className={cn(
        "technical-grid relative isolate flex overflow-hidden bg-[#e4e1da]",
        detailed
          ? "items-center justify-center"
          : "items-center justify-center",
        className,
      )}
      role="img"
      aria-label={`${title} technical product illustration`}
    >
      <div className="absolute inset-[8%] rounded-full border border-dashed border-black/10" />
      <div className="absolute top-[11%] left-[9%] font-mono text-[8px] text-black/40 uppercase">
        Object / {kind}
      </div>
      <div className="bg-acid absolute top-[11%] right-[9%] size-1.5 rounded-full ring-2 ring-black/10" />
      <svg
        viewBox="0 0 320 340"
        aria-hidden="true"
        className={cn(
          "relative h-[68%] w-[72%] drop-shadow-[0_22px_18px_rgb(0_0_0/.18)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.035]",
          detailed && "h-[76%] w-[82%]",
        )}
      >
        {kind === "jacket" ? <TechnicalJacket /> : null}
        {kind === "footwear" ? <MotionShoe /> : null}
        {kind === "carry" ? <ModularBag /> : null}
        {kind === "wearable" ? <WearableObject /> : null}
        {kind === "generic" ? <GenericObject /> : null}
      </svg>
      <div className="absolute right-[9%] bottom-[9%] left-[9%] flex items-center justify-between font-mono text-[8px] text-black/45 uppercase">
        <span>NMU // system</span>
        <span className="text-[#527400]">Ready</span>
      </div>
    </div>
  );
}

export function isDemoEditorialImage(src: string | null): boolean {
  return src === "/images/home-editorial.jpg";
}
