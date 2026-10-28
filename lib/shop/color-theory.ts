export type HueFamily = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "neutral";
export type ColorTemperature = "warm" | "cool" | "neutral";
export type ColorValue = "light" | "mid" | "dark";
export type ColorChroma = "muted" | "saturated";
export type HarmonyRelation = "neutral" | "monochrome" | "analogous" | "complementary" | "clash";

export interface ColorCode {
  hex: string;
  family: HueFamily;
  temperature: ColorTemperature;
  value: ColorValue;
  chroma: ColorChroma;
  /** Black, white, gray, and very dull colors. These can hold a louder piece. */
  neutral: boolean;
  hue: number;
  saturation: number;
  lightness: number;
}

const NAMED_COLORS: [string, string][] = [
  ["heather gray", "#8e96a3"],
  ["heather grey", "#8e96a3"],
  ["light blue", "#c5d7ea"],
  ["navy blue", "#1e3a5f"],
  ["off-white", "#f3efe6"],
  ["off white", "#f3efe6"],
  ["charcoal", "#36404a"],
  ["burgundy", "#6e2430"],
  ["maroon", "#6e2430"],
  ["mustard", "#c6a035"],
  ["oatmeal", "#d9cbb6"],
  ["natural", "#e6d7c3"],
  ["forest", "#2f4a34"],
  ["indigo", "#1d3557"],
  ["cobalt", "#2a4e8a"],
  ["lavender", "#b7a6d6"],
  ["burgundy", "#6e2430"],
  ["cream", "#f4efe4"],
  ["ivory", "#f6f1e4"],
  ["khaki", "#c4a574"],
  ["camel", "#b08968"],
  ["beige", "#d8c3a5"],
  ["olive", "#6b7040"],
  ["sage", "#8fa387"],
  ["coral", "#e07a5f"],
  ["rust", "#b85c38"],
  ["wine", "#722f37"],
  ["gold", "#c4a35a"],
  ["sand", "#d7c4a3"],
  ["stone", "#a39890"],
  ["slate", "#5c6b73"],
  ["ecru", "#e3d7c1"],
  ["navy", "#1e3a5f"],
  ["gray", "#8b919a"],
  ["grey", "#8b919a"],
  ["blue", "#3d6f99"],
  ["black", "#161616"],
  ["white", "#f7f6f2"],
  ["brown", "#6b4f32"],
  ["green", "#3f6b4a"],
  ["orange", "#d86b2a"],
  ["yellow", "#e2c15a"],
  ["purple", "#5c4a72"],
  ["pink", "#e7a6b5"],
  ["red", "#b33a3a"],
  ["tan", "#c4a574"],
];

export function parseColor(input: string): string | null {
  const raw = input.trim().toLowerCase();
  const hexMatch = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const body = hexMatch[1];
    const full = body.length === 3 ? body.split("").map((char) => char + char).join("") : body;
    return `#${full.toLowerCase()}`;
  }
  const normalized = raw.replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
  const hit = NAMED_COLORS.find(([name]) => name === normalized);
  return hit ? hit[1] : null;
}

export function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { hue: 0, saturation: 0, lightness };
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  hue *= 60;
  if (hue < 0) hue += 360;
  return { hue, saturation, lightness };
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (sector < 1) [r, g, b] = [chroma, x, 0];
  else if (sector < 2) [r, g, b] = [x, chroma, 0];
  else if (sector < 3) [r, g, b] = [0, chroma, x];
  else if (sector < 4) [r, g, b] = [0, x, chroma];
  else if (sector < 5) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];
  const match = lightness - chroma / 2;
  const channel = (value: number) => Math.round(Math.min(255, Math.max(0, (value + match) * 255)));
  return `#${[channel(r), channel(g), channel(b)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function familyFor(hue: number): Exclude<HueFamily, "neutral"> {
  if (hue < 15 || hue >= 345) return "red";
  if (hue < 45) return "orange";
  if (hue < 70) return "yellow";
  if (hue < 170) return "green";
  if (hue < 255) return "blue";
  return "purple";
}

export function codeColor(hex: string): ColorCode {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const { hue, saturation, lightness } = rgbToHsl(r, g, b);
  const dull = saturation < 0.14 || lightness > 0.93 || lightness < 0.1;
  const family: HueFamily = dull ? "neutral" : familyFor(hue);
  const value: ColorValue = lightness > 0.72 ? "light" : lightness < 0.34 ? "dark" : "mid";
  const chroma: ColorChroma =
    saturation > 0.48 && lightness > 0.28 && lightness < 0.78 && !dull ? "saturated" : "muted";
  const temperature: ColorTemperature =
    family === "neutral" ? "neutral" : family === "red" || family === "orange" || family === "yellow" ? "warm" : "cool";
  return {
    hex: `#${full.toLowerCase()}`,
    family,
    temperature,
    value,
    chroma,
    neutral: family === "neutral",
    hue,
    saturation,
    lightness,
  };
}

export function hueDistance(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
}

/** How willingly two cloth colors can be worn together. Higher is easier. */
export function relateColors(a: ColorCode, b: ColorCode): { relation: HarmonyRelation; score: number } {
  if (a.neutral || b.neutral) return { relation: "neutral", score: 0.9 };
  const distance = hueDistance(a.hue, b.hue);
  if (distance <= 18) return { relation: "monochrome", score: 0.92 };
  if (distance <= 48) return { relation: "analogous", score: 0.82 };
  if (distance >= 150) {
    const bothLoud = a.chroma === "saturated" && b.chroma === "saturated" && a.value === b.value;
    return { relation: "complementary", score: bothLoud ? 0.46 : 0.74 };
  }
  return { relation: "clash", score: 0.34 };
}
