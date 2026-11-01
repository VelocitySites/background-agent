"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Zap, Crown, Flame, Leaf, Shirt } from "lucide-react";
import { LOOK_PRESETS, itemById, type ClothingItem, type LookPreset } from "@/lib/shop/catalog";
import { wearPlate } from "@/lib/shop/wardrobe";

const PRESET_ICONS: Record<string, React.ElementType> = {
  "street-king": Crown,
  minimalist: Leaf,
  "fire-fit": Flame,
  athlete: Zap,
  classic: Shirt,
};

interface OutfitPresetsProps {
  inventory: ClothingItem[];
  onApplyPreset: (outfit: Record<string, ClothingItem | null>) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export function OutfitPresets({
  inventory,
  onApplyPreset,
  className = "",
  defaultExpanded = true,
}: OutfitPresetsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getItemById = (id: string | null): ClothingItem | null => {
    if (!id) return null;
    return inventory.find((item) => item.id === id) || itemById(id);
  };

  const applyPreset = (preset: LookPreset) => {
    onApplyPreset(
      wearPlate({
        id: preset.id,
        name: preset.name,
        slots: preset.items,
      })
    );
  };

  const calculatePresetTotal = (preset: LookPreset): number => {
    return Object.values(preset.items)
      .filter((id): id is string => id !== null)
      .map((id) => getItemById(id))
      .filter((item): item is ClothingItem => item !== null)
      .reduce((sum, item) => sum + item.price, 0);
  };

  const nextPreset = () => {
    setCurrentIndex((prev) => (prev + 1) % LOOK_PRESETS.length);
  };

  const prevPreset = () => {
    setCurrentIndex((prev) => (prev - 1 + LOOK_PRESETS.length) % LOOK_PRESETS.length);
  };

  const currentPreset = LOOK_PRESETS[currentIndex];
  const Icon = PRESET_ICONS[currentPreset.id] ?? Sparkles;

  return (
    <div className={className}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors mb-3"
      >
        <Sparkles className="w-4 h-4 text-accent-400" />
        <span className="text-sm font-medium">Quick Start Outfits</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-brand-500"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Carousel */}
            <div className="relative">
              {/* Navigation arrows */}
              <button
                onClick={prevPreset}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-brand-700 hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={nextPreset}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-brand-700 hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              {/* Preset Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPreset.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-gradient-to-br ${currentPreset.gradient} rounded-2xl p-4 relative overflow-hidden`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                                         radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                        backgroundSize: "30px 30px",
                      }}
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5 text-white" />
                          <h4 className="font-display text-lg text-white">{currentPreset.name}</h4>
                        </div>
                        <p className="text-white/70 text-xs">{currentPreset.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">Total</p>
                        <p className="font-display text-xl text-white">
                          ${calculatePresetTotal(currentPreset)}
                        </p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {Object.entries(currentPreset.items)
                        .filter(([_, id]) => id !== null)
                        .map(([slot, id]) => {
                          const item = getItemById(id);
                          if (!item) return null;
                          return (
                            <div
                              key={slot}
                              className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center"
                            >
                              <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">
                                {item.name}
                              </p>
                              <p className="text-white/60 text-[10px]">${item.price}</p>
                            </div>
                          );
                        })}
                    </div>

                    {/* Apply button */}
                    <motion.button
                      onClick={() => applyPreset(currentPreset)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-medium text-sm transition-colors"
                    >
                      Apply This Look
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {LOOK_PRESETS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentIndex ? "w-4 bg-accent-500" : "bg-brand-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
