"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ModelState } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ModelViewerProps {
  modelState: ModelState;
  className?: string;
  onSlotClick?: (slot: "head" | "top" | "bottom" | "feet") => void;
  activeSlot?: string | null;
}

export function ModelViewer({ 
  modelState, 
  className,
  onSlotClick,
  activeSlot 
}: ModelViewerProps) {
  const { selectedItems, isCustomPhoto } = modelState;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-b from-brand-800/80 to-brand-900/90 rounded-3xl overflow-hidden shadow-2xl border border-brand-700/50",
        className
      )}
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-transparent to-brand-950/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Platform/Stage */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-4">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-brand-600/30 to-transparent rounded-full blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent rounded-full" />
        </div>
      </div>

      {/* Model Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-[500px]">
          {/* Avatar SVG */}
          <svg
            viewBox="0 0 200 400"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}
          >
            <defs>
              <linearGradient id="modelSkinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CD9A6E" />
                <stop offset="100%" stopColor="#B08050" />
              </linearGradient>
              <linearGradient id="modelTopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4B5563" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
              <linearGradient id="modelBottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            {/* Body shadow */}
            <ellipse cx="100" cy="385" rx="40" ry="6" fill="rgba(0,0,0,0.2)" />

            {/* Head */}
            <ellipse cx="100" cy="45" rx="28" ry="35" fill="url(#modelSkinGradient)" />
            
            {/* Hair */}
            <ellipse cx="100" cy="22" rx="26" ry="14" fill="#1A1A1A" />
            
            {/* Neck */}
            <rect x="88" y="75" width="24" height="18" rx="2" fill="url(#modelSkinGradient)" />

            {/* Body/Top */}
            <path
              d="M58 93 C 52 100, 48 120, 46 140 L 44 215 L 156 215 L 154 140 C 152 120, 148 100, 142 93 L 100 88 Z"
              fill={selectedItems.top ? "url(#modelTopGradient)" : "url(#modelSkinGradient)"}
            />

            {/* Arms */}
            <path
              d="M46 105 C 38 125, 30 155, 26 185 L 36 190 C 42 160, 50 130, 56 110 Z"
              fill={selectedItems.top ? "#374151" : "url(#modelSkinGradient)"}
            />
            <path
              d="M154 105 C 162 125, 170 155, 174 185 L 164 190 C 158 160, 150 130, 144 110 Z"
              fill={selectedItems.top ? "#374151" : "url(#modelSkinGradient)"}
            />

            {/* Hands */}
            <ellipse cx="32" cy="198" rx="9" ry="11" fill="#CD9A6E" />
            <ellipse cx="168" cy="198" rx="9" ry="11" fill="#CD9A6E" />

            {/* Legs */}
            <path
              d="M68 215 C 66 260, 62 320, 58 360 L 80 360 C 83 320, 86 260, 88 215 Z"
              fill={selectedItems.bottom ? "url(#modelBottomGradient)" : "url(#modelSkinGradient)"}
            />
            <path
              d="M112 215 C 114 260, 118 320, 122 360 L 142 360 C 138 320, 134 260, 132 215 Z"
              fill={selectedItems.bottom ? "url(#modelBottomGradient)" : "url(#modelSkinGradient)"}
            />

            {/* Feet */}
            {selectedItems.feet ? (
              <>
                <ellipse cx="68" cy="368" rx="16" ry="6" fill="#111827" />
                <ellipse cx="132" cy="368" rx="16" ry="6" fill="#111827" />
              </>
            ) : (
              <>
                <ellipse cx="68" cy="365" rx="10" ry="4" fill="#CD9A6E" />
                <ellipse cx="132" cy="365" rx="10" ry="4" fill="#CD9A6E" />
              </>
            )}

            {/* Hat */}
            {selectedItems.head && (
              <g>
                <ellipse cx="100" cy="16" rx="34" ry="10" fill="#1F2937" />
                <path d="M66 16 C 66 5, 80 -3, 100 -3 C 120 -3, 134 5, 134 16" fill="#374151" />
              </g>
            )}
          </svg>

          {/* Clothing Labels */}
          <AnimatePresence mode="popLayout">
            {selectedItems.head && (
              <motion.div
                key="head-label"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-0 left-0"
              >
                <div className="bg-gradient-to-r from-brand-800/95 to-brand-700/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-xs text-white font-medium">{selectedItems.head.product.name}</p>
                </div>
              </motion.div>
            )}

            {selectedItems.top && (
              <motion.div
                key="top-label"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-24 right-0"
              >
                <div className="bg-gradient-to-r from-brand-700/95 to-brand-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-xs text-white font-medium">{selectedItems.top.product.name}</p>
                </div>
              </motion.div>
            )}

            {selectedItems.bottom && (
              <motion.div
                key="bottom-label"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-56 left-0"
              >
                <div className="bg-gradient-to-r from-brand-800/95 to-brand-700/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-xs text-white font-medium">{selectedItems.bottom.product.name}</p>
                </div>
              </motion.div>
            )}

            {selectedItems.feet && (
              <motion.div
                key="feet-label"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute bottom-12 right-0"
              >
                <div className="bg-gradient-to-r from-brand-700/95 to-brand-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-xs text-white font-medium">{selectedItems.feet.product.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Click zones */}
          {onSlotClick && (
            <div className="absolute inset-0">
              <button
                onClick={() => onSlotClick("head")}
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-24 h-20 rounded-full transition-all",
                  activeSlot === "head"
                    ? "bg-accent-500/30 ring-2 ring-accent-400"
                    : "hover:bg-white/10"
                )}
                aria-label="Select headwear"
              />
              <button
                onClick={() => onSlotClick("top")}
                className={cn(
                  "absolute top-20 left-1/2 -translate-x-1/2 w-32 h-28 rounded-xl transition-all",
                  activeSlot === "top"
                    ? "bg-accent-500/30 ring-2 ring-accent-400"
                    : "hover:bg-white/10"
                )}
                aria-label="Select top"
              />
              <button
                onClick={() => onSlotClick("bottom")}
                className={cn(
                  "absolute top-52 left-1/2 -translate-x-1/2 w-28 h-32 rounded-xl transition-all",
                  activeSlot === "bottom"
                    ? "bg-accent-500/30 ring-2 ring-accent-400"
                    : "hover:bg-white/10"
                )}
                aria-label="Select bottom"
              />
              <button
                onClick={() => onSlotClick("feet")}
                className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-12 rounded-xl transition-all",
                  activeSlot === "feet"
                    ? "bg-accent-500/30 ring-2 ring-accent-400"
                    : "hover:bg-white/10"
                )}
                aria-label="Select footwear"
              />
            </div>
          )}
        </div>
      </div>

      {/* Custom Photo Indicator */}
      {isCustomPhoto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-medium rounded-full shadow-lg"
        >
          Your Photo
        </motion.div>
      )}

      {/* Decorative sparkle */}
      <motion.div
        className="absolute top-4 left-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-6 h-6 text-accent-400/50" />
      </motion.div>

      {/* Interaction Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <p className="text-xs text-brand-500">
          Click on your avatar to customize
        </p>
      </motion.div>
    </div>
  );
}
