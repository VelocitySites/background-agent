"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Plus, ChevronRight } from "lucide-react";
import type { ClothingItem } from "@/lib/shop/catalog";
import type { ClothingSlot } from "@/types";

interface CompleteTheLookProps {
  currentOutfit: Record<string, ClothingItem | null>;
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
  const suggestions = useMemo(() => {
    const suggestions: ClothingItem[] = [];
    const currentStyles = new Set<string>();

    Object.values(currentOutfit)
      .filter((item): item is ClothingItem => item !== null)
      .forEach((item) => {
        item.style.forEach((s) => currentStyles.add(s));
      });

    const emptySlots = (["head", "top", "bottom", "feet"] as ClothingSlot[]).filter(
      (slot) => !currentOutfit[slot]
    );

    emptySlots.forEach((slot) => {
      const slotItems = inventory.filter((item) => item.slot === slot);

      const matchingItems = slotItems
        .map((item) => ({
          item,
          matchScore: item.style.filter((s) => currentStyles.has(s)).length,
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      if (matchingItems.length > 0) {
        suggestions.push(matchingItems[0].item);
      }
    });

    return suggestions.slice(0, 3);
  }, [currentOutfit, inventory]);

  const filledSlotsCount = Object.values(currentOutfit).filter((item) => item !== null).length;
  const totalSlots = 4;
  const completionPercentage = Math.round((filledSlotsCount / totalSlots) * 100);

  if (suggestions.length === 0) {
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
            <div>
              <h4 className="text-sm font-medium text-white">Complete Your Look</h4>
              <p className="text-xs text-brand-400">Suggestions based on your style</p>
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
      </div>

      {/* Suggestions */}
      <div className="p-3">
        <AnimatePresence>
          {suggestions.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onAddItem(item)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-brand-700/50 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                <span className="text-lg font-bold text-white/30">{item.name.charAt(0)}</span>
                <div className="absolute inset-0 bg-accent-500/0 group-hover:bg-accent-500/20 transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-600 text-brand-300 uppercase tracking-wider">
                    {SLOT_LABELS[item.slot]}
                  </span>
                </div>
                <p className="text-sm text-white font-medium truncate mt-0.5">{item.name}</p>
                <p className="text-xs text-brand-400">{item.brand} • ${item.price}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-brand-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-brand-500 text-center">
          Click to add suggested items to your outfit
        </p>
      </div>
    </motion.div>
  );
}
