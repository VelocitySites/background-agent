"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Shuffle,
  Camera,
  Share2,
  Undo2,
  Save,
  ExternalLink,
  Volume2,
  VolumeX,
  Keyboard,
  Loader2,
} from "lucide-react";
import { useFadeOnIdle } from "@/hooks/useFadeOnIdle";
import { cn } from "@/lib/utils";
import { ParticleBackground } from "@/components/shop/ParticleBackground";
import { EnhancedAvatar } from "@/components/shop/EnhancedAvatar";
import { EnhancedClothingSelector } from "@/components/shop/EnhancedClothingSelector";
import { OnboardingTutorial } from "@/components/shop/OnboardingTutorial";
import { OutfitPresets } from "@/components/shop/OutfitPresets";
import { CompleteTheLook } from "@/components/shop/CompleteTheLook";
import { EnhancedCheckoutBar } from "@/components/shop/EnhancedCheckoutBar";

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

interface SelectedOutfit {
  [key: string]: ClothingItem | null;
}

const MOCK_INVENTORY: ClothingItem[] = [
  { id: "h1", name: "Classic Baseball Cap", brand: "Nike", price: 28, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["black", "navy"], style: ["streetwear", "athleisure"] },
  { id: "h2", name: "Wool Beanie", brand: "Carhartt", price: 35, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["gray", "black"], style: ["streetwear", "minimalist"] },
  { id: "h3", name: "Bucket Hat", brand: "Stussy", price: 45, affiliateUrl: "#", imageUrl: "", slot: "head", colors: ["khaki", "black"], style: ["streetwear"] },
  { id: "t1", name: "Essential Cotton Tee", brand: "Uniqlo", price: 15, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["white", "black", "gray"], style: ["minimalist", "classic"] },
  { id: "t2", name: "Oversized Hoodie", brand: "Champion", price: 65, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["heather gray", "navy"], style: ["streetwear", "athleisure"] },
  { id: "t3", name: "Oxford Button-Down", brand: "J.Crew", price: 89, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["light blue", "white"], style: ["classic", "preppy"] },
  { id: "t4", name: "Graphic Tee", brand: "Supreme", price: 48, affiliateUrl: "#", imageUrl: "", slot: "top", colors: ["black", "white"], style: ["streetwear"] },
  { id: "b1", name: "Slim Fit Chinos", brand: "Bonobos", price: 98, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["khaki", "navy"], style: ["classic", "preppy"] },
  { id: "b2", name: "Relaxed Joggers", brand: "Nike", price: 75, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["black", "gray"], style: ["athleisure", "streetwear"] },
  { id: "b3", name: "Straight Leg Jeans", brand: "Levi's", price: 69, affiliateUrl: "#", imageUrl: "", slot: "bottom", colors: ["indigo", "black"], style: ["classic", "streetwear"] },
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

const TUTORIAL_STORAGE_KEY = "revolution_tutorial_completed";
const SOUND_STORAGE_KEY = "revolution_sound_enabled";

export default function ShopExperiencePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [outfit, setOutfit] = useState<SelectedOutfit>({
    head: null,
    top: MOCK_INVENTORY.find(i => i.id === "t1") || null,
    bottom: MOCK_INVENTORY.find(i => i.id === "b3") || null,
    feet: MOCK_INVENTORY.find(i => i.id === "f2") || null,
  });
  const [outfitHistory, setOutfitHistory] = useState<SelectedOutfit[]>([]);
  const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SelectedOutfit[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);

  const { opacity: menuOpacity, handlers: menuHandlers } = useFadeOnIdle({
    timeout: 4000,
    initiallyVisible: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialCompleted) {
      setTimeout(() => setShowTutorial(true), 1200);
    }
    
    const soundPref = localStorage.getItem(SOUND_STORAGE_KEY);
    if (soundPref) {
      setSoundEnabled(soundPref === "true");
    }
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const slots: ClothingSlot[] = ["head", "top", "bottom", "feet"];
      const keyMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
      
      if (e.key in keyMap) {
        setActiveSlot(slots[keyMap[e.key]]);
      } else if (e.key === "Escape") {
        setActiveSlot(null);
        setShowCheckout(false);
      } else if (e.key === "r" || e.key === "R") {
        randomizeOutfit();
      } else if (e.key === "u" || e.key === "U") {
        undoOutfit();
      } else if (e.key === "?" || e.key === "/") {
        setShowKeyboardHints(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const playSound = useCallback((type: "select" | "remove" | "shuffle") => {
    if (!soundEnabled) return;
  }, [soundEnabled]);

  const getItemsForSlot = (slot: ClothingSlot) => {
    return MOCK_INVENTORY.filter((item) => item.slot === slot);
  };

  const selectItem = (item: ClothingItem) => {
    setOutfitHistory(prev => [...prev.slice(-9), { ...outfit }]);
    setOutfit((prev) => ({ ...prev, [item.slot]: item }));
    playSound("select");
  };

  const clearSlot = (slot: ClothingSlot) => {
    setOutfitHistory(prev => [...prev.slice(-9), { ...outfit }]);
    setOutfit((prev) => ({ ...prev, [slot]: null }));
    playSound("remove");
  };

  const randomizeOutfit = () => {
    setOutfitHistory(prev => [...prev.slice(-9), { ...outfit }]);
    const slots: ClothingSlot[] = ["head", "top", "bottom", "feet"];
    const newOutfit: SelectedOutfit = {};
    slots.forEach((slot) => {
      const items = getItemsForSlot(slot);
      const useItem = Math.random() > 0.2;
      newOutfit[slot] = useItem ? items[Math.floor(Math.random() * items.length)] : null;
    });
    setOutfit(newOutfit);
    playSound("shuffle");
  };

  const undoOutfit = () => {
    if (outfitHistory.length > 0) {
      const previousOutfit = outfitHistory[outfitHistory.length - 1];
      setOutfitHistory(prev => prev.slice(0, -1));
      setOutfit(previousOutfit);
    }
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

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setShowTutorial(false);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem(SOUND_STORAGE_KEY, String(newValue));
  };

  const handleSlotClick = (slot: ClothingSlot) => {
    setActiveSlot(activeSlot === slot ? null : slot);
  };

  const handleApplyPreset = (presetOutfit: Record<string, ClothingItem | null>) => {
    setOutfitHistory(prev => [...prev.slice(-9), { ...outfit }]);
    setOutfit(presetOutfit);
    playSound("shuffle");
  };

  const handleAddSuggestedItem = (item: ClothingItem) => {
    selectItem(item);
    setActiveSlot(item.slot);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Loader2 className="w-12 h-12 text-accent-500" />
          </motion.div>
          <p className="text-brand-400">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-white pt-20 overflow-hidden">
      <ParticleBackground />

      {showTutorial && (
        <OnboardingTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}

      {/* Top Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-brand-950/80 backdrop-blur-md border-b border-brand-800/50">
        <div className="container-wide section-padding py-3 flex items-center justify-between">
          <Link
            href="/shop/create-avatar"
            className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors text-sm group"
          >
            <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Edit Avatar</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={undoOutfit}
              disabled={outfitHistory.length === 0}
              className="flex items-center gap-1.5 text-brand-400 hover:text-white transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (U)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              onClick={randomizeOutfit}
              className="flex items-center gap-1.5 text-brand-400 hover:text-white transition-colors text-sm group"
              title="Randomize (R)"
            >
              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">Randomize</span>
            </button>
            <button
              onClick={saveOutfit}
              className="flex items-center gap-1.5 text-brand-400 hover:text-white transition-colors text-sm group"
            >
              <Heart className="w-4 h-4 group-hover:scale-110 group-hover:text-red-400 transition-all" />
              <span className="hidden sm:inline">Save Look</span>
            </button>
            <div className="w-px h-4 bg-brand-700 hidden sm:block" />
            <button
              onClick={toggleSound}
              className="p-2 text-brand-400 hover:text-white transition-colors"
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowKeyboardHints(prev => !prev)}
              className="p-2 text-brand-400 hover:text-white transition-colors hidden sm:block"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <AnimatePresence>
        {showKeyboardHints && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-brand-800/95 backdrop-blur-sm rounded-xl border border-brand-700 p-4 shadow-2xl"
          >
            <h4 className="text-sm font-medium text-white mb-3">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-brand-700 rounded text-xs">1-4</kbd>
                <span className="text-brand-300">Select slot</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-brand-700 rounded text-xs">R</kbd>
                <span className="text-brand-300">Randomize</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-brand-700 rounded text-xs">U</kbd>
                <span className="text-brand-300">Undo</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-brand-700 rounded text-xs">Esc</kbd>
                <span className="text-brand-300">Close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-12 pb-32 relative z-10">
        <div className="container-wide section-padding">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Slot Selectors */}
            <motion.div
              {...menuHandlers}
              className="hidden lg:flex flex-col gap-3 w-56 transition-opacity duration-500"
              style={{ opacity: Math.max(0.3, menuOpacity) }}
            >
              <OutfitPresets
                inventory={MOCK_INVENTORY}
                onApplyPreset={handleApplyPreset}
                className="mb-4"
              />

              {(["head", "top", "bottom", "feet"] as ClothingSlot[]).map((slot, index) => (
                <EnhancedClothingSelector
                  key={slot}
                  slot={slot}
                  label={SLOT_LABELS[slot]}
                  items={getItemsForSlot(slot)}
                  selectedItem={outfit[slot]}
                  onSelect={(item) => selectItem(item)}
                  onRemove={() => clearSlot(slot)}
                  isActive={activeSlot === slot}
                  onActivate={() => setActiveSlot(activeSlot === slot ? null : slot)}
                  opacity={menuOpacity}
                />
              ))}
            </motion.div>

            {/* Center: Avatar */}
            <div className="flex-1 flex justify-center">
              <EnhancedAvatar
                outfit={outfit}
                activeSlot={activeSlot}
                onSlotClick={handleSlotClick}
              />
            </div>

            {/* Right: Suggestions */}
            <motion.div
              {...menuHandlers}
              className="hidden lg:block w-64 transition-opacity duration-500"
              style={{ opacity: Math.max(0.3, menuOpacity) }}
            >
              <CompleteTheLook
                currentOutfit={outfit}
                inventory={MOCK_INVENTORY}
                onAddItem={handleAddSuggestedItem}
              />

              {/* Quick tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-brand-800/30 rounded-xl border border-brand-700/50"
              >
                <p className="text-xs text-brand-400 leading-relaxed">
                  <span className="text-accent-400 font-medium">Pro tip:</span> Click directly on your avatar to quickly select clothing slots, or use the menus on the left.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Slot Selector */}
          <div className="lg:hidden mt-8">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {(["head", "top", "bottom", "feet"] as ClothingSlot[]).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
                  className={cn(
                    "px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all",
                    activeSlot === slot
                      ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25"
                      : "bg-brand-800 text-brand-300 border border-brand-700"
                  )}
                >
                  {SLOT_LABELS[slot]}
                  {outfit[slot] && (
                    <span className="ml-1.5 inline-block w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeSlot && (
                <motion.div
                  key={activeSlot}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
                    {getItemsForSlot(activeSlot).map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => selectItem(item)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex-shrink-0 w-36 p-3 rounded-xl transition-all",
                          outfit[activeSlot]?.id === item.id
                            ? "bg-gradient-to-br from-accent-500/20 to-accent-600/10 border-2 border-accent-500"
                            : "bg-brand-800 border border-brand-700"
                        )}
                      >
                        <div className="w-full h-24 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white/30">{item.name.charAt(0)}</span>
                        </div>
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-brand-400 text-xs">{item.brand}</p>
                          <p className="text-accent-400 text-sm font-medium">${item.price}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Checkout Bar */}
      <EnhancedCheckoutBar
        items={getOutfitItems()}
        onRemoveItem={clearSlot}
        onCheckout={() => setShowCheckout(true)}
        onShare={() => {}}
      />

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-brand-800 to-brand-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-brand-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl text-white">Your Look</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 rounded-full hover:bg-brand-700 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <p className="text-brand-400 text-sm mb-6">
                These items are from our affiliate partners. Click to purchase from their sites.
              </p>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
                {getOutfitItems().map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-brand-800/50 rounded-xl hover:bg-brand-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-white/30">{item.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-brand-400 text-sm">{item.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent-400 font-medium">${item.price}</span>
                      <ExternalLink className="w-4 h-4 text-brand-500 group-hover:text-accent-400 transition-colors" />
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-700">
                <div>
                  <p className="text-brand-400 text-sm">Total</p>
                  <p className="text-3xl font-display text-white">
                    ${getTotalPrice().toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-3 bg-brand-700 text-brand-300 rounded-full hover:bg-brand-600 hover:text-white transition-colors"
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
