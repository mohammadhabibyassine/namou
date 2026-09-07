export function formatCount(value: number): string {
  return value === 0 ? "0" : String(value).padStart(2, "0");
}
