"use client";

import { useMemo } from "react";
import type { ClothingItem, SelectedOutfit } from "@/lib/shop/catalog";
import { suggestPieces } from "@/lib/shop/suggest";
import type { ClothingSlot } from "@/types";

interface CompleteTheLookProps {
  currentOutfit: Partial<SelectedOutfit>;
  inventory: ClothingItem[];
  onAddItem: (item: ClothingItem) => void;
  layout?: "row" | "line";
}

const SLOT_LABELS: Record<ClothingSlot, string> = {
  head: "Headwear",
  top: "Top",
  bottom: "Bottom",
  feet: "Footwear",
  accessory: "Accessory",
};

export function CompleteTheLook({ currentOutfit, inventory, onAddItem, layout = "row" }: CompleteTheLookProps) {
  const suggestions = useMemo(
    () => suggestPieces(currentOutfit, inventory),
    [currentOutfit, inventory]
  );

  if (suggestions.length === 0) return null;

  if (layout === "line") {
    const suggestion = suggestions[0];
    return (
      <button
        type="button"
        onClick={() => onAddItem(suggestion.item)}
        aria-label="Suggestions"
        className="mx-auto mt-3 flex w-full max-w-md items-center gap-2 rounded-full border border-brand-700 bg-brand-900/80 px-3 py-2 text-left"
      >
        <span
          className="h-5 w-5 shrink-0 rounded-full border border-white/10"
          style={{ backgroundColor: suggestion.item.color }}
        />
        <span className="min-w-0 truncate text-xs text-brand-100">
          <span className="uppercase tracking-wide text-accent-300">Try next · </span>
          {suggestion.item.name}
        </span>
      </button>
    );
  }

  return (
    <section className="mx-auto mt-4 max-w-3xl" aria-label="Suggestions">
      <p className="text-center text-[10px] uppercase tracking-[0.18em] text-accent-300">Try next</p>
      <div className="mt-2 flex justify-center gap-3 overflow-x-auto pb-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.item.id}
            type="button"
            onClick={() => onAddItem(suggestion.item)}
            className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-brand-700 bg-brand-900/80 px-3 py-2 text-left transition-colors hover:border-accent-400"
          >
            <span
              className="h-10 w-10 shrink-0 rounded-xl border border-white/10"
              style={{ backgroundColor: suggestion.item.color }}
            />
            <span className="min-w-0">
              <span className="text-[10px] uppercase tracking-wide text-accent-300">
                {suggestion.replacing ? "Try instead" : SLOT_LABELS[suggestion.item.slot]}
              </span>
              <span className="block truncate text-sm font-medium text-white">{suggestion.item.name}</span>
              <span className="mt-0.5 block text-xs leading-4 text-brand-300">{suggestion.reason}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
