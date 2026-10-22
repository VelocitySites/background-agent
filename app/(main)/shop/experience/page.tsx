"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Share2,
  Undo2,
  Save,
  ExternalLink,
} from "lucide-react";
import { useFadeOnIdle } from "@/hooks/useFadeOnIdle";
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
  style: string[];
}

interface SelectedOutfit {
  [key: string]: ClothingItem | null;
}

const MOCK_INVENTORY: ClothingItem[] = [
  // Headwear
  { id: "h1", name: "Classic Baseball Cap", brand: "Nike", price: 28, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["black", "navy"], style: ["streetwear", "athleisure"] },
  { id: "h2", name: "Wool Beanie", brand: "Carhartt", price: 35, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["gray", "black"], style: ["streetwear", "minimalist"] },
  { id: "h3", name: "Bucket Hat", brand: "Stussy", price: 45, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["khaki", "black"], style: ["streetwear"] },
  // Tops
  { id: "t1", name: "Essential Cotton Tee", brand: "Uniqlo", price: 15, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["white", "black", "gray"], style: ["minimalist", "classic"] },
  { id: "t2", name: "Oversized Hoodie", brand: "Champion", price: 65, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["heather gray", "navy"], style: ["streetwear", "athleisure"] },
  { id: "t3", name: "Oxford Button-Down", brand: "J.Crew", price: 89, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["light blue", "white"], style: ["classic", "preppy"] },
  { id: "t4", name: "Graphic Tee", brand: "Supreme", price: 48, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["black", "white"], style: ["streetwear"] },
  // Bottoms
  { id: "b1", name: "Slim Fit Chinos", brand: "Bonobos", price: 98, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["khaki", "navy"], style: ["classic", "preppy"] },
  { id: "b2", name: "Relaxed Joggers", brand: "Nike", price: 75, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["black", "gray"], style: ["athleisure", "streetwear"] },
  { id: "b3", name: "Straight Leg Jeans", brand: "Levi's", price: 69, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["indigo", "black"], style: ["classic", "streetwear"] },
  // Footwear
  { id: "f1", name: "White Leather Sneakers", brand: "Common Projects", price: 425, affiliateUrl: "#", imageUrl: "", slot: "feet", colors: ["white"], style: ["minimalist", "classic"] },
  { id: "f2", name: "Classic Canvas", brand: "Converse", price: 55, affiliateUrl: "#", imageUrl: "", slot: "feet", colors: ["black", "white"], style: ["streetwear", "classic"] },
  { id: "f3", name: "Running Shoes", brand: "New Balance", price: 120, affiliateUrl: "#", imageUrl: "", slot: "feet", colors: ["gray", "navy"], style: ["athleisure"] },
];

const SLOT_LABELS: Record<ClothingSlot, string> = {
  head: "Headwear",
  top: "Top",
  bottom: "Bottom",
  feet: "Footwear",
  accessory: "Accessory",
};

export default function ShopExperiencePage() {
  const [outfit, setOutfit] = useState<SelectedOutfit>({
    head: null,
    top: MOCK_INVENTORY.find(i => i.id === "t1") || null,
    bottom: MOCK_INVENTORY.find(i => i.id === "b3") || null,
    feet: MOCK_INVENTORY.find(i => i.id === "f2") || null,
  });
  const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SelectedOutfit[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const { opacity: menuOpacity, handlers: menuHandlers } = useFadeOnIdle({
    timeout: 3000,
    initiallyVisible: true,
  });

  const getItemsForSlot = (slot: ClothingSlot) => {
    return MOCK_INVENTORY.filter((item) => item.slot === slot);
  };

  const selectItem = (item: ClothingItem) => {
    setOutfit((prev) => ({ ...prev, [item.slot]: item }));
  };

  const clearSlot = (slot: ClothingSlot) => {
    setOutfit((prev) => ({ ...prev, [slot]: null }));
  };

  const randomizeOutfit = () => {
    const slots: ClothingSlot[] = ["head", "top", "bottom", "feet"];
    const newOutfit: SelectedOutfit = {};
    slots.forEach((slot) => {
      const items = getItemsForSlot(slot);
      const useItem = Math.random() > 0.3;
      newOutfit[slot] = useItem ? items[Math.floor(Math.random() * items.length)] : null;
    });
    setOutfit(newOutfit);
  };

  const getTotalPrice = () => {
    return Object.values(outfit)
      .filter((item): item is ClothingItem => item !== null)
      .reduce((sum, item) => sum + item.price, 0);
  };

  const getOutfitItems = () => {
    return Object.values(outfit).filter((item): item is ClothingItem => item !== null);
  };

  const saveOutfit = () => {
    setSavedOutfits((prev) => [...prev, { ...outfit }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-white pt-20 overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-brand-950/80 backdrop-blur-sm border-b border-brand-800">
        <div className="container-wide section-padding py-3 flex items-center justify-between">
          <Link
            href="/shop/create-avatar"
            className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors text-sm"
          >
            <Camera className="w-4 h-4" />
            Edit Avatar
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={randomizeOutfit}
              className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors text-sm"
            >
              <Shuffle className="w-4 h-4" />
              Randomize
            </button>
            <button
              onClick={saveOutfit}
              className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors text-sm"
            >
              <Heart className="w-4 h-4" />
              Save Look
            </button>
          </div>
        </div>
      </div>

      <div className="pt-12 pb-32">
        <div className="container-wide section-padding">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Slot Selectors */}
            <motion.div
              {...menuHandlers}
              style={{ opacity: Math.max(0.2, menuOpacity) }}
              className="hidden lg:flex flex-col gap-3 w-48 transition-opacity duration-300"
            >
              {(["head", "top", "bottom", "feet"] as ClothingSlot[]).map((slot) => (
                <SlotButton
                  key={slot}
                  slot={slot}
                  label={SLOT_LABELS[slot]}
                  item={outfit[slot]}
                  isActive={activeSlot === slot}
                  onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
                />
              ))}
            </motion.div>

            {/* Center: Avatar */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Avatar Display */}
                <motion.div
                  layout
                  className="w-80 h-[500px] bg-gradient-to-b from-brand-800 to-brand-900 rounded-3xl relative overflow-hidden shadow-2xl"
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-accent-500/10 to-transparent" />

                  {/* Avatar body outline */}
                  <svg
                    viewBox="0 0 200 400"
                    className="absolute inset-0 w-full h-full p-8"
                  >
                    {/* Head */}
                    <circle cx="100" cy="50" r="30" fill="#CD9A6E" />
                    {/* Neck */}
                    <rect x="90" y="75" width="20" height="15" fill="#CD9A6E" />
                    {/* Body */}
                    <path
                      d="M60 90 L140 90 L150 220 L50 220 Z"
                      fill={outfit.top ? "#4B5563" : "#374151"}
                    />
                    {/* Arms */}
                    <path
                      d="M60 90 L40 180 L50 185 L70 100 Z"
                      fill={outfit.top ? "#4B5563" : "#CD9A6E"}
                    />
                    <path
                      d="M140 90 L160 180 L150 185 L130 100 Z"
                      fill={outfit.top ? "#4B5563" : "#CD9A6E"}
                    />
                    {/* Legs */}
                    <path
                      d="M65 220 L55 370 L85 370 L90 220 Z"
                      fill={outfit.bottom ? "#1F2937" : "#CD9A6E"}
                    />
                    <path
                      d="M110 220 L115 370 L145 370 L135 220 Z"
                      fill={outfit.bottom ? "#1F2937" : "#CD9A6E"}
                    />
                    {/* Feet */}
                    {outfit.feet && (
                      <>
                        <ellipse cx="70" cy="375" rx="20" ry="8" fill="#111827" />
                        <ellipse cx="130" cy="375" rx="20" ry="8" fill="#111827" />
                      </>
                    )}
                    {/* Hat */}
                    {outfit.head && (
                      <ellipse cx="100" cy="25" rx="35" ry="12" fill="#374151" />
                    )}
                  </svg>

                  {/* Clothing Labels */}
                  <div className="absolute inset-0 pointer-events-none">
                    {outfit.head && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-8 left-4 text-xs bg-brand-700/80 px-2 py-1 rounded"
                      >
                        {outfit.head.name}
                      </motion.div>
                    )}
                    {outfit.top && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-32 right-4 text-xs bg-brand-700/80 px-2 py-1 rounded"
                      >
                        {outfit.top.name}
                      </motion.div>
                    )}
                    {outfit.bottom && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-64 left-4 text-xs bg-brand-700/80 px-2 py-1 rounded"
                      >
                        {outfit.bottom.name}
                      </motion.div>
                    )}
                    {outfit.feet && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute bottom-12 right-4 text-xs bg-brand-700/80 px-2 py-1 rounded"
                      >
                        {outfit.feet.name}
                      </motion.div>
                    )}
                  </div>

                  {/* Click zones */}
                  <div className="absolute inset-0">
                    <button
                      onClick={() => setActiveSlot(activeSlot === "head" ? null : "head")}
                      className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-16 rounded-full hover:bg-white/10 transition-colors"
                    />
                    <button
                      onClick={() => setActiveSlot(activeSlot === "top" ? null : "top")}
                      className="absolute top-24 left-1/2 -translate-x-1/2 w-32 h-28 rounded-lg hover:bg-white/10 transition-colors"
                    />
                    <button
                      onClick={() => setActiveSlot(activeSlot === "bottom" ? null : "bottom")}
                      className="absolute top-56 left-1/2 -translate-x-1/2 w-28 h-32 rounded-lg hover:bg-white/10 transition-colors"
                    />
                    <button
                      onClick={() => setActiveSlot(activeSlot === "feet" ? null : "feet")}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-12 rounded-lg hover:bg-white/10 transition-colors"
                    />
                  </div>
                </motion.div>

                {/* Sparkle effects */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 text-accent-400"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
              </div>
            </div>

            {/* Right: Active Slot Items */}
            <motion.div
              {...menuHandlers}
              style={{ opacity: Math.max(0.2, menuOpacity) }}
              className="hidden lg:block w-64 transition-opacity duration-300"
            >
              <AnimatePresence mode="wait">
                {activeSlot && (
                  <motion.div
                    key={activeSlot}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-brand-800/50 rounded-2xl p-4 border border-brand-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">{SLOT_LABELS[activeSlot]}</h3>
                      {outfit[activeSlot] && (
                        <button
                          onClick={() => clearSlot(activeSlot)}
                          className="text-xs text-brand-400 hover:text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {getItemsForSlot(activeSlot).map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          isSelected={outfit[activeSlot]?.id === item.id}
                          onClick={() => selectItem(item)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!activeSlot && (
                <div className="text-center text-brand-500 py-8">
                  <p className="text-sm">
                    Click on your avatar or use the buttons to select clothing
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Mobile Slot Selector */}
          <div className="lg:hidden mt-8">
            <div className="flex gap-2 overflow-x-auto pb-4">
              {(["head", "top", "bottom", "feet"] as ClothingSlot[]).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
                  className={cn(
                    "px-4 py-2 rounded-full whitespace-nowrap text-sm transition-colors",
                    activeSlot === slot
                      ? "bg-accent-500 text-white"
                      : "bg-brand-800 text-brand-300"
                  )}
                >
                  {SLOT_LABELS[slot]}
                  {outfit[slot] && " ✓"}
                </button>
              ))}
            </div>

            {activeSlot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 overflow-x-auto py-4"
              >
                {getItemsForSlot(activeSlot).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isSelected={outfit[activeSlot]?.id === item.id}
                    onClick={() => selectItem(item)}
                    compact
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Checkout Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-brand-950/95 backdrop-blur-md border-t border-brand-800"
      >
        <div className="container-wide section-padding py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-400 text-sm">
                {getOutfitItems().length} items selected
              </p>
              <p className="font-display text-2xl text-white">
                ${getTotalPrice().toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-brand-800 rounded-full text-brand-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={getOutfitItems().length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Get This Look
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl text-white mb-2">
                Your Look
              </h2>
              <p className="text-brand-400 text-sm mb-6">
                These items are from our affiliate partners. Click to purchase
                from their sites.
              </p>

              <div className="space-y-3 mb-6">
                {getOutfitItems().map((item) => (
                  <a
                    key={item.id}
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-brand-800/50 rounded-xl hover:bg-brand-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-700 rounded-lg" />
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-brand-400 text-sm">{item.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white">${item.price}</span>
                      <ExternalLink className="w-4 h-4 text-brand-500 group-hover:text-accent-400" />
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-700">
                <div>
                  <p className="text-brand-400 text-sm">Total</p>
                  <p className="text-2xl font-display text-white">
                    ${getTotalPrice().toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-3 bg-brand-800 text-brand-300 rounded-full hover:bg-brand-700 transition-colors"
                >
                  Keep Shopping
                </button>
              </div>

              <p className="text-xs text-brand-500 text-center mt-4">
                Purchases support Revolution through affiliate commissions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlotButton({
  slot,
  label,
  item,
  isActive,
  onClick,
}: {
  slot: ClothingSlot;
  label: string;
  item: ClothingItem | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={cn(
        "w-full p-3 rounded-xl text-left transition-all",
        isActive
          ? "bg-accent-500/20 border border-accent-500"
          : "bg-brand-800/50 border border-brand-700 hover:border-brand-600"
      )}
    >
      <p className="text-xs text-brand-400 uppercase tracking-wide">{label}</p>
      {item ? (
        <>
          <p className="text-white font-medium truncate">{item.name}</p>
          <p className="text-accent-400 text-sm">${item.price}</p>
        </>
      ) : (
        <p className="text-brand-500">None selected</p>
      )}
    </motion.button>
  );
}

function ItemCard({
  item,
  isSelected,
  onClick,
  compact = false,
}: {
  item: ClothingItem;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex-shrink-0 w-32 p-3 rounded-xl transition-all",
          isSelected
            ? "bg-accent-500/20 border border-accent-500"
            : "bg-brand-800 border border-brand-700"
        )}
      >
        <div className="w-full h-20 bg-brand-700 rounded-lg mb-2" />
        <p className="text-white text-sm font-medium truncate">{item.name}</p>
        <p className="text-accent-400 text-xs">${item.price}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-xl transition-all flex items-center gap-3",
        isSelected
          ? "bg-accent-500/20 border border-accent-500"
          : "bg-brand-700/50 hover:bg-brand-700 border border-transparent"
      )}
    >
      <div className="w-12 h-12 bg-brand-600 rounded-lg flex-shrink-0" />
      <div className="flex-1 text-left min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.name}</p>
        <p className="text-brand-400 text-xs">{item.brand}</p>
      </div>
      <p className="text-accent-400 text-sm">${item.price}</p>
    </button>
  );
}
