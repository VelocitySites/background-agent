import type { ClothingItem, GarmentKind } from "@/lib/shop/catalog";
import type { ClothingSlot } from "@/types";
import { codeColor, type ColorChroma, type ColorCode, type ColorTemperature, type ColorValue, type HueFamily } from "@/lib/shop/color-theory";

export type PieceRole = "anchor" | "statement" | "support";

/**
 * Tags a piece so a later suggestion pass can rank it without rereading the
 * product page. The tags are derived from the slot, the garment shape, the
 * merchandising styles, and the cloth color.
 */
export interface ItemCode {
  id: string;
  name: string;
  slot: ClothingSlot;
  kind: GarmentKind;
  styles: string[];
  color: ColorCode;
  accent: ColorCode;
  role: PieceRole;
  tags: string[];
}

function roleFor(color: ColorCode, accent: ColorCode, kind: GarmentKind): PieceRole {
  const loudPrint = kind === "graphic" && accent.chroma === "saturated" && !accent.neutral;
  if (loudPrint) return "statement";
  if (color.neutral) return "anchor";
  if (color.value === "dark" && (color.family === "blue" || color.family === "green" || color.family === "purple")) {
    return "anchor";
  }
  if (color.chroma === "saturated" && (color.family === "red" || color.family === "orange" || color.family === "yellow")) {
    return "statement";
  }
  if (color.chroma === "saturated" && color.value === "light") return "statement";
  return "support";
}

export function codeItem(item: ClothingItem): ItemCode {
  const color = codeColor(item.color);
  const accent = codeColor(item.accent);
  const role = roleFor(color, accent, item.kind);
  const tags = [
    `slot:${item.slot}`,
    `kind:${item.kind}`,
    `family:${color.family}`,
    `temp:${color.temperature}`,
    `value:${color.value}`,
    `chroma:${color.chroma}`,
    `role:${role}`,
    ...item.style.map((style) => `style:${style}`),
  ];
  return {
    id: item.id,
    name: item.name,
    slot: item.slot,
    kind: item.kind,
    styles: [...item.style],
    color,
    accent,
    role,
    tags,
  };
}

export function hasTag(code: ItemCode, tag: string): boolean {
  return code.tags.includes(tag);
}

export type { HueFamily, ColorTemperature, ColorValue, ColorChroma };
