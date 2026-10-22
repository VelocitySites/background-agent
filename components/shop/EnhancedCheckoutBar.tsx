"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Share2, ChevronUp, ExternalLink, X, Sparkles } from "lucide-react";

type ClothingSlot = "head" | "top" | "bottom" | "feet" | "accessory";

interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  affiliateUrl: string;
  imageUrl: string;
  slot: ClothingSlot;
  colors: string[];
  style: string[];
}

interface EnhancedCheckoutBarProps {
  items: ClothingItem[];
  onRemoveItem: (slot: ClothingSlot) => void;
  onCheckout: () => void;
  onShare: () => void;
}

const SLOT_ORDER: ClothingSlot[] = ["head", "top", "bottom", "feet"];

export function EnhancedCheckoutBar({
  items,
  onRemoveItem,
  onCheckout,
  onShare,
}: EnhancedCheckoutBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const sortedItems = [...items].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-900/98 backdrop-blur-lg border-t border-brand-700 overflow-hidden"
          >
            <div className="container-wide section-padding py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display text-white">Your Outfit</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full hover:bg-brand-700 transition-colors"
                >
                  <X className="w-5 h-5 text-brand-400" />
                </button>
              </div>

              {sortedItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {sortedItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative bg-brand-800/80 rounded-xl p-3 group"
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveItem(item.slot)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-brand-600 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>

                      {/* Item thumbnail */}
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 mb-2 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white/20">{item.name.charAt(0)}</span>
                      </div>

                      {/* Item info */}
                      <p className="text-sm text-white font-medium truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-brand-400">{item.brand}</p>
                        <p className="text-sm text-accent-400 font-medium">${item.price}</p>
                      </div>

                      {/* Shop link */}
                      <a
                        href={item.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1 py-1.5 bg-brand-700 hover:bg-brand-600 rounded-lg text-xs text-brand-300 hover:text-white transition-colors"
                      >
                        Shop <ExternalLink className="w-3 h-3" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                  <p className="text-brand-400">No items selected yet</p>
                  <p className="text-brand-500 text-sm">Click on your avatar to add items</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 border-t border-brand-700 backdrop-blur-lg">
        <div className="container-wide section-padding py-3">
          <div className="flex items-center gap-4">
            {/* Item thumbnails */}
            <div className="hidden sm:flex items-center gap-2 flex-1">
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    layout
                    className="relative group"
                    style={{ zIndex: sortedItems.length - index }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center border-2 border-brand-500 shadow-lg overflow-hidden">
                      <span className="text-lg font-bold text-white/40">{item.name.charAt(0)}</span>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-brand-800 px-2 py-1 rounded-lg whitespace-nowrap border border-brand-600 shadow-xl">
                        <p className="text-xs text-white font-medium">{item.name}</p>
                        <p className="text-[10px] text-accent-400">${item.price}</p>
                      </div>
                    </div>

                    {/* Remove on hover */}
                    <button
                      onClick={() => onRemoveItem(item.slot)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedItems.length === 0 && (
                <p className="text-brand-500 text-sm">No items selected</p>
              )}
            </div>

            {/* Expand button (mobile & desktop) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden flex items-center gap-2 text-brand-400 hover:text-white transition-colors"
            >
              <span className="text-sm">{items.length} items</span>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                <ChevronUp className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Price and actions */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right">
                <p className="text-brand-400 text-xs hidden sm:block">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
                <motion.p
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-display text-xl sm:text-2xl text-white"
                >
                  ${total.toFixed(2)}
                </motion.p>
              </div>

              {/* Share button */}
              <motion.button
                onClick={onShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-brand-800 hover:bg-brand-700 rounded-full text-brand-300 hover:text-white transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>

              {/* Checkout button */}
              <motion.button
                onClick={onCheckout}
                disabled={items.length === 0}
                whileHover={{ scale: items.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: items.length > 0 ? 0.98 : 1 }}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full font-medium shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline">Get This Look</span>
                <span className="sm:hidden">Shop</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
