"use client";

import { motion } from "framer-motion";
import { ScanSearch, Shuffle, X } from "lucide-react";
import type { ClothingItem } from "@/lib/shop/catalog";

interface PieceQuickMenuProps {
  item: ClothingItem;
  onLookCloser: () => void;
  onSwap: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function PieceQuickMenu({
  item,
  onLookCloser,
  onSwap,
  onRemove,
  onClose,
}: PieceQuickMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[65] bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        className="absolute left-1/2 top-1/2 w-[min(100%-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand-600 bg-brand-950 p-3 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="menu"
      >
        <div className="mb-2 flex items-center gap-3 px-1">
          <span
            className="h-10 w-10 rounded-xl border border-white/10"
            style={{ backgroundColor: item.color }}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{item.name}</span>
            <span className="block text-xs text-brand-400">{item.brand}</span>
          </span>
        </div>
        <MenuButton icon={ScanSearch} label="Scroll into this piece" detail="Material, origin, chain, source" onClick={onLookCloser} />
        <MenuButton icon={Shuffle} label="Swap it" detail="Open the other options" onClick={onSwap} />
        <MenuButton icon={X} label="Take it off" detail="Clear this slot" onClick={onRemove} />
      </motion.div>
    </motion.div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  icon: typeof ScanSearch;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-brand-800"
    >
      <Icon className="h-4 w-4 text-accent-300" />
      <span>
        <span className="block text-sm text-white">{label}</span>
        <span className="block text-xs text-brand-400">{detail}</span>
      </span>
    </button>
  );
}
