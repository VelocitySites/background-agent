"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Shuffle,
  Camera,
  Undo2,
  ExternalLink,
  Volume2,
  VolumeX,
  Keyboard,
  Loader2,
  Check,
} from "lucide-react";
import { useFadeOnIdle } from "@/hooks/useFadeOnIdle";
import { cn } from "@/lib/utils";
import { ParticleBackground } from "@/components/shop/ParticleBackground";
import { DressedFigure } from "@/components/shop/DressedFigure";
import { GarmentRail } from "@/components/shop/GarmentRail";
import { OnboardingTutorial } from "@/components/shop/OnboardingTutorial";
import { OutfitPresets } from "@/components/shop/OutfitPresets";
import { CompleteTheLook } from "@/components/shop/CompleteTheLook";
import { EnhancedCheckoutBar } from "@/components/shop/EnhancedCheckoutBar";
import { DeepDive } from "@/components/shop/DeepDive";
import { PieceQuickMenu } from "@/components/shop/PieceQuickMenu";
import {
  INVENTORY,
  SLOT_LABELS,
  STYLE_TO_LOOK,
  defaultOutfit,
  emptyOutfit,
  outfitFromPreset,
  outfitItemIds,
  outfitTotal,
  randomOutfit,
  type ClothingItem,
  type SelectedOutfit,
} from "@/lib/shop/catalog";
import { loadAvatar, type AvatarConfig } from "@/lib/shop/avatar";
import { addLook } from "@/lib/shop/looks";
import { findShopItem, loadPartnerItems, mergeShopInventory, PARTNER_EVENT } from "@/lib/shop/partner-catalog";
import { describeLook } from "@/lib/shop/suggest";
import { affiliateOf } from "@/lib/shop/intake";
import { swapPiece } from "@/lib/shop/wardrobe";
import type { ClothingSlot } from "@/types";

const TUTORIAL_STORAGE_KEY = "revolution_tutorial_completed";
const SOUND_STORAGE_KEY = "revolution_sound_enabled";
const DEEP_DIVE_KEY = "revolution_deep_dive";
const DRESS_SLOTS = ["head", "top", "bottom", "feet"] as const;

const RAIL_LAYOUT: Record<"head" | "top" | "bottom" | "feet", string> = {
  head: "left-0 top-4",
  top: "right-0 top-28",
  bottom: "left-0 top-80",
  feet: "bottom-6 right-0",
};

export default function ShopExperiencePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [outfit, setOutfit] = useState<SelectedOutfit>(defaultOutfit);
  const [outfitHistory, setOutfitHistory] = useState<SelectedOutfit[]>([]);
  const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deepDive, setDeepDive] = useState(false);
  const [menuItem, setMenuItem] = useState<ClothingItem | null>(null);
  const [diveItem, setDiveItem] = useState<ClothingItem | null>(null);
  const [inventory, setInventory] = useState<ClothingItem[]>(INVENTORY);
  const outfitRef = useRef(outfit);
  const historyRef = useRef(outfitHistory);
  const inventoryRef = useRef(inventory);
  const clickTimer = useRef<number | null>(null);
  outfitRef.current = outfit;
  historyRef.current = outfitHistory;
  inventoryRef.current = inventory;

  const { opacity: menuOpacity, handlers: menuHandlers } = useFadeOnIdle({
    timeout: 2800,
    initiallyVisible: true,
    minOpacity: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialCompleted) {
      setTimeout(() => setShowTutorial(true), 900);
    }
    setSoundEnabled(localStorage.getItem(SOUND_STORAGE_KEY) === "true");
    setDeepDive(localStorage.getItem(DEEP_DIVE_KEY) === "true");
    setAvatar(loadAvatar());

    const catalog = mergeShopInventory(loadPartnerItems());
    setInventory(catalog);

    const params = new URLSearchParams(window.location.search);
    const look = params.get("look");
    const style = params.get("style");
    const slot = params.get("slot");
    const saved = loadAvatar();
    const styleKey = (style || saved?.startingStyle || "").toLowerCase();
    const presetId = look || STYLE_TO_LOOK[styleKey];

    if (presetId === "random") {
      setOutfit(randomOutfit(catalog));
    } else if (presetId) {
      const next = outfitFromPreset(presetId) ?? outfitFromItemList(presetId);
      if (next) setOutfit(next);
    }

    if (slot === "head" || slot === "top" || slot === "bottom" || slot === "feet") {
      setActiveSlot(slot);
    }

    const onAvatar = () => setAvatar(loadAvatar());
    const onPartners = () => setInventory(mergeShopInventory(loadPartnerItems()));
    window.addEventListener("revolution-avatar-changed", onAvatar);
    window.addEventListener(PARTNER_EVENT, onPartners);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("revolution-avatar-changed", onAvatar);
      window.removeEventListener(PARTNER_EVENT, onPartners);
    };
  }, []);

  const playSound = useCallback(
    (type: "select" | "remove" | "shuffle") => {
      if (!soundEnabled || typeof window === "undefined") return;
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = type === "shuffle" ? 520 : type === "remove" ? 220 : 660;
      gain.gain.value = 0.03;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      oscillator.stop(ctx.currentTime + 0.12);
      oscillator.onended = () => ctx.close();
    },
    [soundEnabled]
  );

  const remember = useCallback(() => {
    const current = outfitRef.current;
    setOutfitHistory((prev) => [...prev.slice(-9), current]);
  }, []);

  const selectItem = useCallback(
    (item: ClothingItem, openMenu = true) => {
      remember();
      setOutfit((prev) => swapPiece(prev, item));
      if (openMenu) setActiveSlot(item.slot);
      playSound("select");
    },
    [playSound, remember]
  );

  const clearSlot = useCallback(
    (slot: ClothingSlot) => {
      remember();
      setOutfit((prev) => swapPiece(prev, null, slot));
      playSound("remove");
    },
    [playSound, remember]
  );

  const applyOutfit = useCallback(
    (next: SelectedOutfit, sound: "select" | "shuffle" = "shuffle") => {
      remember();
      setOutfit({ ...next, accessory: next.accessory ?? null });
      playSound(sound);
    },
    [playSound, remember]
  );

  const undoOutfit = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setOutfitHistory((prev) => prev.slice(0, -1));
    setOutfit(previous);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const keyMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
      if (event.key in keyMap) {
        setActiveSlot(DRESS_SLOTS[keyMap[event.key]]);
      } else if (event.key === "Escape") {
        setActiveSlot(null);
        setShowCheckout(false);
        setMenuItem(null);
        setDiveItem(null);
      } else if (event.key === "r" || event.key === "R") {
        applyOutfit(randomOutfit(inventoryRef.current));
      } else if (event.key === "u" || event.key === "U") {
        undoOutfit();
      } else if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        setShowKeyboardHints((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyOutfit, undoOutfit]);

  const items = Object.values(outfit).filter((item): item is ClothingItem => item !== null);
  const total = outfitTotal(outfit);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  const saveCurrentLook = () => {
    if (items.length === 0) return;
    addLook(outfitItemIds(outfit), items.map((item) => item.brand).slice(0, 2).join(" + "));
    flash("Saved to your looks");
  };

  const shareLook = async () => {
    const summary = items
      .map((item) => `${item.brand} ${item.name} — $${item.price}\n${item.affiliateUrl}`)
      .join("\n\n");
    const text = summary || "An empty look.";
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied the pieces and links");
    } catch {
      flash("Couldn't copy from this browser");
    }
  };

  const openCheckout = () => {
    if (items.length === 0) return;
    saveCurrentLook();
    setShowCheckout(true);
  };

  const handleSlotClick = (slot: ClothingSlot) => {
    if (!deepDive) {
      setActiveSlot((current) => (current === slot ? null : slot));
      return;
    }
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      setActiveSlot((current) => (current === slot ? null : slot));
    }, 230);
  };

  const handlePieceDoubleClick = (slot: ClothingSlot) => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    if (!deepDive) return;
    const item = outfitRef.current[slot];
    if (!item) return;
    setMenuItem(item);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-500" />
          <p className="text-brand-400">Setting the dressing room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 pt-20 text-white">
      <ParticleBackground />

      {showTutorial && (
        <OnboardingTutorial
          onComplete={() => {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
            setShowTutorial(false);
          }}
          onSkip={() => {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
            setShowTutorial(false);
          }}
        />
      )}

      <div className="fixed left-0 right-0 top-16 z-40 border-b border-brand-800/50 bg-brand-950/80 backdrop-blur-md">
        <div className="container-wide section-padding flex items-center justify-between py-3">
          <Link
            href="/shop/create-avatar"
            className="group flex items-center gap-2 text-sm text-brand-400 transition-colors hover:text-white"
          >
            <Camera className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{avatar ? "Edit who you're dressing" : "Make this you"}</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/shop/partners"
              className="text-sm text-brand-400 transition-colors hover:text-white"
            >
              Add a partner piece
            </Link>
            <button
              type="button"
              onClick={undoOutfit}
              disabled={outfitHistory.length === 0}
              className="flex items-center gap-1.5 text-sm text-brand-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Undo (U)"
            >
              <Undo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => applyOutfit(randomOutfit(inventoryRef.current))}
              className="group flex items-center gap-1.5 text-sm text-brand-400 transition-colors hover:text-white"
              title="Randomize (R)"
            >
              <Shuffle className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
            <button
              type="button"
              onClick={saveCurrentLook}
              className="group flex items-center gap-1.5 text-sm text-brand-400 transition-colors hover:text-white"
            >
              <Heart className="h-4 w-4 transition-all group-hover:scale-110 group-hover:text-red-400" />
              <span className="hidden sm:inline">Save look</span>
            </button>
            <div className="hidden h-4 w-px bg-brand-700 sm:block" />
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                localStorage.setItem(SOUND_STORAGE_KEY, String(next));
              }}
              className="p-2 text-brand-400 transition-colors hover:text-white"
              title={soundEnabled ? "Mute" : "Sound on"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboardHints((prev) => !prev)}
              className="hidden p-2 text-brand-400 transition-colors hover:text-white sm:block"
              title="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showKeyboardHints && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-32 z-50 -translate-x-1/2 rounded-xl border border-brand-700 bg-brand-800/95 p-4 shadow-2xl backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Hint keys="← →" label="Turn the figure" />
              <Hint keys="1–4" label="Open a piece" />
              <Hint keys="R" label="Shuffle" />
              <Hint keys="U" label="Undo" />
              <Hint keys="Esc" label="Close" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-32 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-brand-900 shadow-xl"
          >
            <Check className="h-4 w-4 text-accent-600" />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pb-32 pt-14">
        <div className="container-wide section-padding">
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            <div className="hidden w-56 shrink-0 flex-col gap-4 xl:flex">
              <OutfitPresets inventory={inventory} onApplyPreset={(next) => applyOutfit(next as SelectedOutfit)} />
            </div>

            <div className="flex flex-1 justify-center">
              <div className="w-full max-w-3xl">
              <div className="mb-4 xl:hidden">
                <OutfitPresets
                  inventory={inventory}
                  defaultExpanded={false}
                  onApplyPreset={(next) => applyOutfit(next as SelectedOutfit)}
                />
              </div>
              <div className="relative h-[340px] w-full sm:h-[440px]" {...menuHandlers}>
                <DressedFigure
                  outfit={outfit}
                  avatar={avatar}
                  activeSlot={activeSlot}
                  deepDive={deepDive}
                  orbit
                  onSlotClick={handleSlotClick}
                  onPieceDoubleClick={handlePieceDoubleClick}
                  className="absolute left-1/2 top-0 h-[340px] w-72 -translate-x-1/2 sm:h-[440px] sm:w-80"
                />

                <div className="pointer-events-none absolute inset-0 hidden 2xl:block">
                  {DRESS_SLOTS.map((slot) => (
                    <div key={slot} className="pointer-events-auto">
                      <GarmentRail
                        label={SLOT_LABELS[slot]}
                        items={inventory.filter((item) => item.slot === slot)}
                        selected={outfit[slot]}
                        isActive={activeSlot === slot}
                        opacity={Math.max(menuOpacity, activeSlot === slot ? 1 : 0)}
                        className={RAIL_LAYOUT[slot]}
                        openUp={slot === "feet"}
                        onActivate={() =>
                          setActiveSlot((current) => (current === slot ? null : slot))
                        }
                        onSelect={selectItem}
                        onRemove={() => clearSlot(slot)}
                      />
                    </div>
                  ))}
                </div>

              </div>
                <p className="mx-auto mt-3 max-w-md text-center text-xs text-brand-300">
                  {describeLook(items)}
                </p>
                <p className="mx-auto mt-1 max-w-md text-center text-xs text-brand-400">
                  Drag across the figure to look around. The arrow keys do the same. Clothes are drawn on.
                  {avatar?.photoUrl ? " Your photo is the face from the front." : ""}
                </p>
                <div className="sm:hidden">
                  <CompleteTheLook
                    layout="line"
                    currentOutfit={outfit}
                    inventory={inventory}
                    onAddItem={(item) => selectItem(item, false)}
                  />
                </div>
              </div>
            </div>

            <div className="hidden w-60 shrink-0 xl:block">
              <div className="rounded-2xl border border-brand-700/60 bg-brand-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-accent-400">This look</p>
                <p className="mt-2 font-display text-3xl text-white">${total.toFixed(0)}</p>
                <p className="mt-1 text-sm text-brand-400">
                  {items.length === 0
                    ? "Nothing on yet."
                    : `${items.length} partner ${items.length === 1 ? "piece" : "pieces"}`}
                </p>
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-brand-100">{item.name}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cart"
                  className="mt-4 inline-flex text-sm text-brand-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Open saved looks
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 2xl:hidden">
            <div className="flex gap-2 overflow-x-auto pb-3">
              {DRESS_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveSlot((current) => (current === slot ? null : slot))}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium",
                    activeSlot === slot
                      ? "bg-accent-500 text-white"
                      : "border border-brand-700 bg-brand-800 text-brand-300"
                  )}
                >
                  {SLOT_LABELS[slot]}
                </button>
              ))}
            </div>
            {deepDive && activeSlot && outfit[activeSlot] && (
              <button
                type="button"
                onClick={() => setDiveItem(outfit[activeSlot])}
                className="mb-3 rounded-full bg-white px-4 py-2 text-sm text-brand-950"
              >
                Look closer at {outfit[activeSlot]?.name}
              </button>
            )}
            <AnimatePresence mode="wait">
              {activeSlot && (
                <motion.div
                  key={activeSlot}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 overflow-x-auto py-3">
                    {inventory
                      .filter((item) => item.slot === activeSlot)
                      .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectItem(item)}
                        className={cn(
                          "w-40 shrink-0 rounded-xl p-3 text-left",
                          outfit[activeSlot]?.id === item.id
                            ? "border-2 border-accent-500 bg-accent-500/15"
                            : "border border-brand-700 bg-brand-800"
                        )}
                      >
                        <span
                          className="mb-2 block h-16 rounded-lg border border-white/10"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="block truncate text-sm text-white">{item.name}</span>
                        <span className="mt-1 flex items-center justify-between text-xs text-brand-400">
                          {item.brand}
                          <span className="text-accent-300">${item.price}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:block">
            <CompleteTheLook
              currentOutfit={outfit}
              inventory={inventory}
              onAddItem={(item) => selectItem(item, false)}
            />
          </div>
        </div>
      </div>

      <EnhancedCheckoutBar
        items={items}
        onRemoveItem={clearSlot}
        onCheckout={openCheckout}
        onShare={shareLook}
        deepDive={deepDive}
        onToggleDeepDive={() => {
          setDeepDive((current) => {
            const next = !current;
            localStorage.setItem(DEEP_DIVE_KEY, String(next));
            if (!next) setMenuItem(null);
            return next;
          });
        }}
      />

      <AnimatePresence>
        {menuItem && (
          <PieceQuickMenu
            item={menuItem}
            onClose={() => setMenuItem(null)}
            onLookCloser={() => {
              setDiveItem(menuItem);
              setMenuItem(null);
            }}
            onSwap={() => {
              setActiveSlot(menuItem.slot);
              setMenuItem(null);
            }}
            onRemove={() => {
              clearSlot(menuItem.slot);
              setMenuItem(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {diveItem && <DeepDive item={diveItem} onClose={() => setDiveItem(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              className="w-full max-w-lg rounded-3xl border border-brand-700 bg-gradient-to-b from-brand-800 to-brand-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-2xl text-white">Get this look</h2>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="rounded-full p-2 hover:bg-brand-700"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <p className="mb-6 text-sm text-brand-300">
                Saved in your looks. Each piece opens on the maker&apos;s site. A purchase is tracked
                only when that piece has an affiliate link from a network. The original shop pieces do not.
              </p>
              <div className="mb-6 max-h-[22rem] space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl bg-brand-800/60 p-3 transition-colors hover:bg-brand-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-12 w-12 rounded-xl border border-white/10"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>
                        <span className="block font-medium text-white">{item.name}</span>
                        <span className="block text-sm text-brand-400">
                          {item.brand}
                          {affiliateOf(item).status === "tracked" ? " · affiliate link" : " · opens the maker"}
                        </span>
                      </span>
                    </div>
                    <span className="flex items-center gap-2 text-accent-300">
                      ${item.price}
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-brand-700 pt-4">
                <div>
                  <p className="text-sm text-brand-400">Together</p>
                  <p className="font-display text-3xl text-white">${total.toFixed(2)}</p>
                </div>
                <Link
                  href="/cart"
                  className="rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-950"
                >
                  View saved looks
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function outfitFromItemList(value: string): SelectedOutfit | null {
  const next = emptyOutfit();
  let found = false;
  value.split(",").forEach((id) => {
    const item = findShopItem(id.trim());
    if (!item) return;
    next[item.slot] = item;
    found = true;
  });
  return found ? next : null;
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="rounded bg-brand-700 px-2 py-0.5 text-xs">{keys}</kbd>
      <span className="text-brand-300">{label}</span>
    </div>
  );
}
