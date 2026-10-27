export function adjustColor(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => char + char)
          .join("")
      : raw;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return hex;
  const clamp = (channel: number) => Math.min(255, Math.max(0, channel));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
