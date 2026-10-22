"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Check, Shirt, HardHat, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

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
  sizes?: string[];
  style: string[];
}

interface EnhancedClothingSelectorProps {
  slot: ClothingSlot;
  label: string;
  items: ClothingItem[];
  selectedItem: ClothingItem | null;
  onSelect: (item: ClothingItem, color?: string, size?: string) => void;
  onRemove: () => void;
  isActive: boolean;
  onActivate: () => void;
  opacity?: number;
}

const SLOT_ICONS: Record<ClothingSlot, React.ElementType> = {
  head: HardHat,
  top: Shirt,
  bottom: Shirt,
  feet: Footprints,
  accessory: Shirt,
};

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  navy: "#1e3a5f",
  gray: "#6b7280",
  "heather gray": "#9ca3af",
  white: "#ffffff",
  khaki: "#c3b091",
  indigo: "#3730a3",
  "light blue": "#93c5fd",
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export function EnhancedClothingSelector({
  slot,
  label,
  items,
  selectedItem,
  onSelect,
  onRemove,
  isActive,
  onActivate,
  opacity = 1,
}: EnhancedClothingSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [hoveredItem, setHoveredItem] = useState<ClothingItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Icon = SLOT_ICONS[slot];

  useEffect(() => {
    if (selectedItem && selectedItem.colors.length > 0 && !selectedColor) {
      setSelectedColor(selectedItem.colors[0]);
    }
  }, [selectedItem, selectedColor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectItem = (item: ClothingItem) => {
    const color = item.colors[0] || null;
    setSelectedColor(color);
    onSelect(item, color || undefined, selectedSize);
    setShowDropdown(false);
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      style={{ 
        opacity: Math.max(0.4, opacity),
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Main Button */}
      <motion.button
        onClick={() => {
          onActivate();
          setShowDropdown(!showDropdown);
        }}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group",
          isActive
            ? "bg-gradient-to-r from-accent-500/20 to-accent-600/10 border-2 border-accent-500 shadow-lg shadow-accent-500/20"
            : "bg-gradient-to-r from-brand-800/60 to-brand-800/40 border border-brand-700 hover:border-brand-600"
        )}
      >
        {/* Background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        />

        <div className="flex items-center gap-3 relative z-10">
          {/* Icon or Thumbnail */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
            selectedItem 
              ? "bg-gradient-to-br from-brand-600 to-brand-700" 
              : "bg-brand-700/50"
          )}>
            {selectedItem ? (
              <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                {selectedItem.name.charAt(0)}
              </div>
            ) : (
              <Icon className="w-5 h-5 text-brand-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-brand-400 uppercase tracking-wider font-medium mb-0.5">
              {label}
            </p>
            {selectedItem ? (
              <>
                <p className="text-white font-semibold truncate text-sm">{selectedItem.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-accent-400 text-sm font-medium">${selectedItem.price}</span>
                  <span className="text-brand-500 text-xs">• {selectedItem.brand}</span>
                </div>
              </>
            ) : (
              <p className="text-brand-400 text-sm">Tap to select</p>
            )}
          </div>

          {/* Arrow */}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-brand-400 transition-transform duration-300",
              showDropdown && "rotate-180"
            )}
          />
        </div>

        {/* Selected color indicator */}
        {selectedItem && selectedColor && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <div 
              className="w-3 h-3 rounded-full border border-white/30"
              style={{ backgroundColor: COLOR_MAP[selectedColor] || selectedColor }}
            />
          </div>
        )}
      </motion.button>

      {/* Remove button */}
      {selectedItem && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setSelectedColor(null);
          }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-brand-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow-lg z-20"
        >
          <X className="w-4 h-4 text-white" />
        </motion.button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full mt-3 w-80 bg-gradient-to-b from-brand-800 to-brand-900 rounded-2xl shadow-2xl border border-brand-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-brand-700 bg-brand-800/50">
              <h4 className="text-sm font-medium text-white">Select {label}</h4>
              <p className="text-xs text-brand-400">{items.length} items available</p>
            </div>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto scrollbar-hide">
              {items.length > 0 ? (
                items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    className={cn(
                      "w-full p-3 text-left transition-all flex items-start gap-3 border-b border-brand-700/50 last:border-0",
                      selectedItem?.id === item.id && "bg-accent-500/10"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                      <span className="text-2xl font-bold text-white/30">{item.name.charAt(0)}</span>
                      {/* Simulated product image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Item details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium text-sm truncate">{item.name}</p>
                          <p className="text-brand-400 text-xs">{item.brand}</p>
                        </div>
                        <p className="text-accent-400 font-semibold text-sm">${item.price}</p>
                      </div>

                      {/* Color swatches */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {item.colors.slice(0, 4).map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: COLOR_MAP[color] || color }}
                            title={color}
                          />
                        ))}
                        {item.colors.length > 4 && (
                          <span className="text-[10px] text-brand-400">+{item.colors.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedItem?.id === item.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Icon className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                  <p className="text-brand-400 text-sm">No items available</p>
                </div>
              )}
            </div>

            {/* Size and color selection for selected item */}
            {selectedItem && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-brand-700 bg-brand-800/80 p-4"
              >
                {/* Color selection */}
                <div className="mb-3">
                  <p className="text-xs text-brand-400 uppercase tracking-wider mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedItem.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          onSelect(selectedItem, color, selectedSize);
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selectedColor === color 
                            ? "border-accent-500 ring-2 ring-accent-500/30 scale-110" 
                            : "border-white/20 hover:border-white/40"
                        )}
                        style={{ backgroundColor: COLOR_MAP[color] || color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Size selection */}
                <div>
                  <p className="text-xs text-brand-400 uppercase tracking-wider mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {SIZE_OPTIONS.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          onSelect(selectedItem, selectedColor || undefined, size);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          selectedSize === size
                            ? "bg-accent-500 text-white"
                            : "bg-brand-700 text-brand-300 hover:bg-brand-600"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
