export function clampQuantity(value: number, max: number): number {
  const safeMax = Math.max(1, max);
  return Math.min(Math.max(1, value), safeMax);
}
