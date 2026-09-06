import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  disabled = false,
  max = 999,
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  max?: number;
  label?: string;
}) {
  return (
    <div className="border-line bg-surface inline-flex items-center rounded-lg border">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        className="grid size-9 place-items-center disabled:opacity-30"
        aria-label={`Decrease ${label}`}
      >
        <Minus size={13} />
      </button>
      <output
        className="w-8 text-center font-mono text-[10px] tabular-nums"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="grid size-9 place-items-center disabled:opacity-30"
        aria-label={`Increase ${label}`}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
