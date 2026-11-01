import type { ClothingSlot } from "@/types";
import type { ClothingItem, SelectedOutfit } from "@/lib/shop/catalog";
import { relateColors, type HarmonyRelation } from "@/lib/shop/color-theory";
import { codeItem, type ItemCode, type PieceRole } from "@/lib/shop/item-code";

export interface ClothingSuggestion {
  item: ClothingItem;
  score: number;
  reason: string;
  replacing: boolean;
}

const DRESS_SLOTS: ClothingSlot[] = ["head", "top", "bottom", "feet"];

function wornItems(outfit: Partial<SelectedOutfit>): ClothingItem[] {
  return DRESS_SLOTS.map((slot) => outfit[slot]).filter((item): item is ClothingItem => Boolean(item));
}

function sharedStyle(candidate: ItemCode, worn: ItemCode[]): string | null {
  for (const style of candidate.styles) {
    if (worn.some((piece) => piece.styles.includes(style))) return style;
  }
  return null;
}

function reasonFor(
  candidate: ItemCode,
  worn: ItemCode[],
  relation: HarmonyRelation,
  partner: ItemCode | undefined
): string {
  const otherName = partner?.name ?? "the rest";
  const style = sharedStyle(candidate, worn);
  if (candidate.color.neutral) {
    return style
      ? `Stays quiet next to ${otherName}. Both read ${style}.`
      : `Stays quiet next to ${otherName}.`;
  }
  if (relation === "analogous" || relation === "monochrome") {
    return `${candidate.color.family} sits near ${otherName}.`;
  }
  if (relation === "complementary") {
    return `${candidate.color.family} contrasts ${otherName}. It works as the only loud note.`;
  }
  if (relation === "clash") {
    return `${candidate.color.family} fights ${otherName}. A neutral would be easier.`;
  }
  if (style) return `Shares the ${style} tag with what you already have on.`;
  return `Fits the open ${candidate.slot} slot.`;
}

function scoreAgainst(candidate: ItemCode, worn: ItemCode[]): { score: number; reason: string } {
  if (worn.length === 0) {
    const score = candidate.role === "anchor" ? 0.7 : 0.45;
    return { score, reason: candidate.role === "anchor" ? "A quiet piece to start from." : "A stronger piece. The next one should stay quieter." };
  }
  const relations = worn.map((piece) => ({
    piece,
    ...relateColors(candidate.color, piece.color),
  }));
  const colorScore = relations.reduce((sum, entry) => sum + entry.score, 0) / relations.length;
  const nearest = relations.slice().sort((a, b) => a.score - b.score)[0];
  const styleBonus = Math.min(0.2, candidate.styles.filter((style) => worn.some((piece) => piece.styles.includes(style))).length * 0.1);
  const statements = worn.filter((piece) => piece.role === "statement").length;
  let roleAdjust = 0;
  if (candidate.role === "statement" && statements > 0) roleAdjust = -0.28;
  if (candidate.role === "anchor" && statements > 0) roleAdjust = 0.12;
  return {
    score: colorScore + styleBonus + roleAdjust,
    reason: reasonFor(candidate, worn, nearest.relation, nearest.piece),
  };
}

export function suggestPieces(
  outfit: Partial<SelectedOutfit>,
  inventory: ClothingItem[],
  limit = 3
): ClothingSuggestion[] {
  const worn = wornItems(outfit);
  const wornCodes = worn.map(codeItem);
  const wornIds = new Set(worn.map((item) => item.id));
  const suggestions: ClothingSuggestion[] = [];

  for (const slot of DRESS_SLOTS) {
    if (outfit[slot]) continue;
    const best = bestInSlot(slot, inventory, wornIds, wornCodes, false);
    if (best) suggestions.push(best);
  }

  if (suggestions.length === 0 && worn.length === DRESS_SLOTS.length) {
    const weakest = weakestPiece(worn);
    if (weakest) {
      const others = wornCodes.filter((code) => code.id !== weakest.id);
      const replacement = bestInSlot(weakest.slot, inventory, wornIds, others, true);
      if (replacement && replacement.score > scoreAgainst(codeItem(weakest), others).score + 0.12) {
        suggestions.push(replacement);
      }
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
}

function bestInSlot(
  slot: ClothingSlot,
  inventory: ClothingItem[],
  wornIds: Set<string>,
  wornCodes: ItemCode[],
  replacing: boolean
): ClothingSuggestion | null {
  let best: ClothingSuggestion | null = null;
  for (const item of inventory) {
    if (item.slot !== slot || wornIds.has(item.id)) continue;
    const scored = scoreAgainst(codeItem(item), wornCodes);
    if (!best || scored.score > best.score) {
      best = { item, score: scored.score, reason: scored.reason, replacing };
    }
  }
  return best;
}

function weakestPiece(worn: ClothingItem[]): ClothingItem | null {
  let weakest: ClothingItem | null = null;
  let weakestScore = Infinity;
  const codes = worn.map(codeItem);
  worn.forEach((item, index) => {
    const others = codes.filter((_, other) => other !== index);
    const score = scoreAgainst(codes[index], others).score;
    if (score < weakestScore) {
      weakest = item;
      weakestScore = score;
    }
  });
  return weakest;
}

export function describeLook(items: ClothingItem[]): string {
  if (items.length === 0) return "Nothing on yet. A neutral piece is an easy place to start.";
  const codes = items.map((item) => ({ item, code: codeItem(item) }));
  if (codes.length === 1) {
    const { item, code } = codes[0];
    const tone = code.color.neutral ? "neutral" : code.color.family;
    return `${item.name} reads as a ${code.color.value} ${tone}.`;
  }
  const statements = codes.filter((entry) => entry.code.role === "statement");
  if (statements.length >= 2) {
    return "Two loud pieces at once. A neutral between them would settle the outfit.";
  }
  if (statements.length === 1) {
    return `${statements[0].item.name} is the loud note. The other pieces stay quieter.`;
  }
  let worst: HarmonyRelation = "neutral";
  let worstScore = 1;
  for (let i = 0; i < codes.length; i += 1) {
    for (let j = i + 1; j < codes.length; j += 1) {
      const relation = relateColors(codes[i].code.color, codes[j].code.color);
      if (relation.score < worstScore) {
        worst = relation.relation;
        worstScore = relation.score;
      }
    }
  }
  if (worst === "clash") return "These colors sit apart on the wheel. A neutral would calm the pair.";
  if (worst === "complementary") return "The contrast is doing the work, with one color leading.";
  if (worst === "analogous" || worst === "monochrome") return "These colors sit near each other, so the outfit stays coherent.";
  return "Neutrals are holding the look, which leaves room for one stronger piece.";
}

export type { PieceRole };
