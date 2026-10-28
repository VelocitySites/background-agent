"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import type { ClothingItem, SelectedOutfit } from "@/lib/shop/catalog";
import { describeLook, suggestPieces } from "@/lib/shop/suggest";
import type { ClothingSlot } from "@/types";

interface CompleteTheLookProps {
  currentOutfit: Partial<SelectedOutfit>;
  inventory: ClothingItem[];
  onAddItem: (item: ClothingItem) => void;
}

const SLOT_LABELS: Record<ClothingSlot, string> = {
  head: "Headwear",
  top: "Top",
  bottom: "Bottom",
  feet: "Footwear",
  accessory: "Accessory",
};

export function CompleteTheLook({ currentOutfit, inventory, onAddItem }: CompleteTheLookProps) {
  const worn = (["head", "top", "bottom", "feet"] as ClothingSlot[])
    .map((slot) => currentOutfit[slot])
    .filter((item): item is ClothingItem => Boolean(item));
  const harmony = describeLook(worn);
  const suggestions = useMemo(
    () => suggestPieces(currentOutfit, inventory),
    [currentOutfit, inventory]
  );

  const filledSlotsCount = Object.values(currentOutfit).filter((item) => item !== null).length;
  const totalSlots = 4;
  const completionPercentage = Math.round((filledSlotsCount / totalSlots) * 100);

  if (suggestions.length === 0 && worn.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-800/80 to-brand-900/80 rounded-2xl border border-brand-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-brand-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-white">Complete Your Look</h4>
              <p className="text-xs text-brand-400">From the colors and tags</p>
            </div>
          </div>

          {/* Completion indicator */}
          <div className="text-right">
            <p className="text-2xl font-display text-white">{completionPercentage}%</p>
            <p className="text-[10px] text-brand-400 uppercase tracking-wider">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-brand-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-accent-500 to-yellow-500 rounded-full"
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-brand-200">{harmony}</p>
      </div>

      {/* Suggestions */}
      <div className="p-3">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onAddItem(suggestion.item)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-brand-700/50 transition-colors group"
            >
              <span
                className="h-12 w-12 shrink-0 rounded-lg border border-white/10"
                style={{ backgroundColor: suggestion.item.color }}
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-600 text-brand-300 uppercase tracking-wider">
                    {suggestion.replacing ? "Swap" : SLOT_LABELS[suggestion.item.slot]}
                  </span>
                </div>
                <p className="text-sm text-white font-medium truncate mt-0.5">{suggestion.item.name}</p>
                <p className="text-xs leading-4 text-brand-300">{suggestion.reason}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-brand-500 text-center">
            Click to wear the suggestion
          </p>
        </div>
      )}
    </motion.div>
  );
}
