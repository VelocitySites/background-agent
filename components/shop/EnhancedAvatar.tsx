"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

type ClothingSlot = "head" | "top" | "bottom" | "feet" | "accessory";

interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  colors: string[];
  slot: ClothingSlot;
}

interface EnhancedAvatarProps {
  outfit: { [key: string]: ClothingItem | null };
  activeSlot: ClothingSlot | null;
  onSlotClick: (slot: ClothingSlot) => void;
  skinTone?: string;
  className?: string;
}

const CLOTHING_VISUALS: Record<string, { gradient: string; pattern?: string }> = {
  h1: { gradient: "from-gray-800 to-gray-900" },
  h2: { gradient: "from-gray-500 to-gray-600" },
  h3: { gradient: "from-amber-700 to-amber-800" },
  t1: { gradient: "from-white to-gray-100" },
  t2: { gradient: "from-gray-400 to-gray-500" },
  t3: { gradient: "from-blue-200 to-blue-300" },
  t4: { gradient: "from-gray-900 to-black" },
  b1: { gradient: "from-amber-700 to-amber-800" },
  b2: { gradient: "from-gray-800 to-gray-900" },
  b3: { gradient: "from-indigo-900 to-indigo-950" },
  f1: { gradient: "from-white to-gray-200" },
  f2: { gradient: "from-gray-900 to-black" },
  f3: { gradient: "from-gray-500 to-gray-600" },
};

export function EnhancedAvatar({
  outfit,
  activeSlot,
  onSlotClick,
  skinTone = "#CD9A6E",
  className = "",
}: EnhancedAvatarProps) {
  const getItemVisual = (item: ClothingItem | null) => {
    if (!item) return null;
    return CLOTHING_VISUALS[item.id] || { gradient: "from-gray-600 to-gray-700" };
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        layout
        className="w-80 h-[520px] bg-gradient-to-b from-brand-800/80 to-brand-900/90 rounded-3xl relative overflow-hidden shadow-2xl border border-brand-700/50"
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

        {/* Avatar Body */}
        <svg
          viewBox="0 0 200 420"
          className="absolute inset-0 w-full h-full p-6"
          style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}
        >
          <defs>
            {/* Skin gradient */}
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={skinTone} />
              <stop offset="100%" stopColor={adjustColor(skinTone, -20)} />
            </linearGradient>
            
            {/* Shadow gradients */}
            <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
            </linearGradient>

            {/* Clothing gradients */}
            {outfit.top && (
              <linearGradient id="topGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4B5563" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
            )}
            {outfit.bottom && (
              <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            )}

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body shadow */}
          <ellipse cx="100" cy="395" rx="45" ry="8" fill="rgba(0,0,0,0.2)" />

          {/* Legs */}
          <g>
            {/* Left leg */}
            <path
              d="M70 235 
                 C 68 280, 65 330, 62 375
                 L 82 375
                 C 85 330, 88 280, 90 235
                 Z"
              fill={outfit.bottom ? "url(#bottomGradient)" : "url(#skinGradient)"}
            />
            {/* Right leg */}
            <path
              d="M110 235
                 C 112 280, 115 330, 118 375
                 L 138 375
                 C 135 330, 132 280, 130 235
                 Z"
              fill={outfit.bottom ? "url(#bottomGradient)" : "url(#skinGradient)"}
            />
            
            {/* Pants details */}
            {outfit.bottom && (
              <>
                <line x1="72" y1="260" x2="85" y2="260" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <line x1="115" y1="260" x2="128" y2="260" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <line x1="68" y1="300" x2="82" y2="300" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                <line x1="118" y1="300" x2="132" y2="300" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
              </>
            )}
          </g>

          {/* Feet/Shoes */}
          <AnimatePresence>
            {outfit.feet ? (
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Left shoe */}
                <path
                  d="M52 375 
                     C 48 375, 45 378, 45 382
                     C 45 390, 55 394, 75 394
                     C 88 394, 90 388, 90 382
                     L 82 375
                     Z"
                  fill="#111827"
                />
                <ellipse cx="68" cy="385" rx="18" ry="5" fill="#1F2937" />
                <path d="M50 382 C 55 380, 75 380, 85 382" stroke="#374151" strokeWidth="2" fill="none" />
                
                {/* Right shoe */}
                <path
                  d="M110 375 
                     C 110 388, 112 394, 125 394
                     C 145 394, 155 390, 155 382
                     C 155 378, 152 375, 148 375
                     L 118 375
                     Z"
                  fill="#111827"
                />
                <ellipse cx="132" cy="385" rx="18" ry="5" fill="#1F2937" />
                <path d="M115 382 C 120 380, 140 380, 150 382" stroke="#374151" strokeWidth="2" fill="none" />
              </motion.g>
            ) : (
              <g>
                <ellipse cx="70" cy="380" rx="12" ry="5" fill={skinTone} />
                <ellipse cx="130" cy="380" rx="12" ry="5" fill={skinTone} />
              </g>
            )}
          </AnimatePresence>

          {/* Torso */}
          <g>
            {/* Base torso shape */}
            <path
              d="M60 100
                 C 55 105, 50 120, 48 140
                 L 45 230
                 L 155 230
                 L 152 140
                 C 150 120, 145 105, 140 100
                 L 100 95
                 Z"
              fill={outfit.top ? "url(#topGradient)" : "url(#skinGradient)"}
            />
            
            {/* Shirt details */}
            {outfit.top && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Collar */}
                <path
                  d="M80 100 L100 115 L120 100"
                  fill="none"
                  stroke="#1F2937"
                  strokeWidth="2"
                />
                {/* Center seam */}
                <line x1="100" y1="115" x2="100" y2="230" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                {/* Pocket suggestion */}
                <rect x="115" y="140" width="20" height="22" rx="2" fill="rgba(0,0,0,0.1)" />
              </motion.g>
            )}
          </g>

          {/* Arms */}
          <g>
            {/* Left arm */}
            <path
              d="M48 110
                 C 40 130, 32 160, 28 190
                 C 26 205, 28 215, 32 220
                 L 42 218
                 C 46 200, 52 160, 58 125
                 Z"
              fill={outfit.top ? "#374151" : "url(#skinGradient)"}
            />
            {/* Left hand */}
            <ellipse cx="35" cy="225" rx="10" ry="12" fill={skinTone} />
            
            {/* Right arm */}
            <path
              d="M152 110
                 C 160 130, 168 160, 172 190
                 C 174 205, 172 215, 168 220
                 L 158 218
                 C 154 200, 148 160, 142 125
                 Z"
              fill={outfit.top ? "#374151" : "url(#skinGradient)"}
            />
            {/* Right hand */}
            <ellipse cx="165" cy="225" rx="10" ry="12" fill={skinTone} />
          </g>

          {/* Neck */}
          <rect x="85" y="75" width="30" height="25" rx="3" fill={skinTone} />

          {/* Head */}
          <g>
            {/* Head shape */}
            <ellipse cx="100" cy="48" rx="32" ry="38" fill="url(#skinGradient)" />
            
            {/* Face features */}
            <g opacity="0.3">
              {/* Eyes */}
              <ellipse cx="88" cy="45" rx="4" ry="2.5" fill="#1F2937" />
              <ellipse cx="112" cy="45" rx="4" ry="2.5" fill="#1F2937" />
              {/* Eyebrows */}
              <path d="M82 38 Q88 36, 94 38" stroke="#4B5563" strokeWidth="1.5" fill="none" />
              <path d="M106 38 Q112 36, 118 38" stroke="#4B5563" strokeWidth="1.5" fill="none" />
              {/* Nose */}
              <path d="M100 48 L100 58 L96 62" stroke="#8B7355" strokeWidth="1" fill="none" />
              {/* Mouth */}
              <path d="M92 70 Q100 75, 108 70" stroke="#A0522D" strokeWidth="1.5" fill="none" />
            </g>
            
            {/* Hair base */}
            <ellipse cx="100" cy="22" rx="30" ry="15" fill="#1A1A1A" />
            <path
              d="M70 30 
                 C 68 20, 75 8, 100 8
                 C 125 8, 132 20, 130 30
                 C 128 22, 115 15, 100 15
                 C 85 15, 72 22, 70 30
                 Z"
              fill="#1A1A1A"
            />
          </g>

          {/* Hat/Headwear */}
          <AnimatePresence>
            {outfit.head && (
              <motion.g
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Cap base */}
                <ellipse cx="100" cy="18" rx="38" ry="12" fill="#1F2937" />
                <path
                  d="M62 18
                     C 62 5, 80 -5, 100 -5
                     C 120 -5, 138 5, 138 18
                     C 138 12, 120 5, 100 5
                     C 80 5, 62 12, 62 18
                     Z"
                  fill="#374151"
                />
                {/* Cap brim */}
                <path
                  d="M60 20 
                     C 55 20, 50 22, 55 28
                     L 90 25
                     L 60 20
                     Z"
                  fill="#1F2937"
                />
                {/* Cap detail */}
                <circle cx="100" cy="8" r="3" fill="#4B5563" />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Clothing Labels - Interactive */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {outfit.head && (
              <motion.div
                key={`label-${outfit.head.id}`}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-6 left-2"
              >
                <div className="bg-gradient-to-r from-brand-800/95 to-brand-700/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">{outfit.head.brand}</p>
                  <p className="text-xs text-white font-medium">{outfit.head.name}</p>
                </div>
              </motion.div>
            )}
            {outfit.top && (
              <motion.div
                key={`label-${outfit.top.id}`}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
                className="absolute top-32 right-2"
              >
                <div className="bg-gradient-to-r from-brand-700/95 to-brand-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">{outfit.top.brand}</p>
                  <p className="text-xs text-white font-medium">{outfit.top.name}</p>
                </div>
              </motion.div>
            )}
            {outfit.bottom && (
              <motion.div
                key={`label-${outfit.bottom.id}`}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="absolute top-64 left-2"
              >
                <div className="bg-gradient-to-r from-brand-800/95 to-brand-700/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">{outfit.bottom.brand}</p>
                  <p className="text-xs text-white font-medium">{outfit.bottom.name}</p>
                </div>
              </motion.div>
            )}
            {outfit.feet && (
              <motion.div
                key={`label-${outfit.feet.id}`}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
                className="absolute bottom-16 right-2"
              >
                <div className="bg-gradient-to-r from-brand-700/95 to-brand-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-600/50 shadow-lg">
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">{outfit.feet.brand}</p>
                  <p className="text-xs text-white font-medium">{outfit.feet.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Click Zones */}
        <div className="absolute inset-0">
          {/* Head zone */}
          <button
            onClick={() => onSlotClick("head")}
            className={`absolute top-2 left-1/2 -translate-x-1/2 w-28 h-20 rounded-full transition-all duration-300
              ${activeSlot === "head" 
                ? "bg-accent-500/30 ring-2 ring-accent-400" 
                : "hover:bg-white/10"
              }`}
            aria-label="Select headwear"
          />
          {/* Top zone */}
          <button
            onClick={() => onSlotClick("top")}
            className={`absolute top-24 left-1/2 -translate-x-1/2 w-36 h-32 rounded-xl transition-all duration-300
              ${activeSlot === "top" 
                ? "bg-accent-500/30 ring-2 ring-accent-400" 
                : "hover:bg-white/10"
              }`}
            aria-label="Select top"
          />
          {/* Bottom zone */}
          <button
            onClick={() => onSlotClick("bottom")}
            className={`absolute top-60 left-1/2 -translate-x-1/2 w-32 h-36 rounded-xl transition-all duration-300
              ${activeSlot === "bottom" 
                ? "bg-accent-500/30 ring-2 ring-accent-400" 
                : "hover:bg-white/10"
              }`}
            aria-label="Select bottom"
          />
          {/* Feet zone */}
          <button
            onClick={() => onSlotClick("feet")}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-36 h-14 rounded-xl transition-all duration-300
              ${activeSlot === "feet" 
                ? "bg-accent-500/30 ring-2 ring-accent-400" 
                : "hover:bg-white/10"
              }`}
            aria-label="Select footwear"
          />
        </div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-4 -right-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-accent-400" />
      </motion.div>
      <motion.div
        className="absolute -bottom-2 -left-2"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-4 h-4 bg-accent-500 rounded-full blur-sm" />
      </motion.div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
