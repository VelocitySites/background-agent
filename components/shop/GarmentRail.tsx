"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ClothingItem } from "@/lib/shop/catalog";
import { cn } from "@/lib/utils";

interface GarmentRailProps {
  label: string;
  items: ClothingItem[];
  selected: ClothingItem | null;
  isActive: boolean;
  opacity: number;
  className?: string;
  openUp?: boolean;
  onActivate: () => void;
  onSelect: (item: ClothingItem) => void;
  onRemove: () => void;
}

export function GarmentRail({
  label,
  items,
  selected,
  isActive,
  opacity,
  className,
  openUp = false,
  onActivate,
  onSelect,
  onRemove,
}: GarmentRailProps) {
  return (
    <div
      className={cn(
        "absolute z-20 w-52 transition-opacity duration-500",
        className
      )}
      style={{ opacity }}
    >
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "w-full rounded-2xl border px-3 py-2 text-left shadow-lg backdrop-blur-md transition-colors",
          isActive
            ? "border-accent-400 bg-brand-900/95"
            : "border-brand-600/80 bg-brand-900/80 hover:border-brand-400"
        )}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-brand-400">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-7 w-7 shrink-0 rounded-lg border border-white/10"
            style={{ backgroundColor: selected?.color ?? "transparent" }}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {selected ? selected.name : "Choose one"}
            </span>
            <span className="block text-xs text-brand-400">
              {selected ? `${selected.brand} · $${selected.price}` : "Tap the figure"}
            </span>
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              "z-30 max-h-64 space-y-1.5 overflow-y-auto rounded-2xl border border-brand-700 bg-brand-950/95 p-2 shadow-2xl",
              openUp ? "absolute bottom-full mb-2 w-full" : "mt-2"
            )}
          >
            {items.map((item) => {
              const active = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors",
                    active ? "bg-accent-500/20 ring-1 ring-accent-400" : "hover:bg-brand-800"
                  )}
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-lg border border-white/10"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">{item.name}</span>
                    <span className="block text-xs text-brand-400">{item.brand}</span>
                  </span>
                  <span className="text-sm text-accent-300">${item.price}</span>
                </button>
              );
            })}
            {selected && (
              <button
                type="button"
                onClick={onRemove}
                className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs text-brand-300 hover:bg-brand-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Take it off
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
