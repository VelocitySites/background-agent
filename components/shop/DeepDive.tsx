"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import type { ClothingItem } from "@/lib/shop/catalog";
import { storyFor, type StoryLayer } from "@/lib/shop/stories";
import { cn } from "@/lib/utils";

interface DeepDiveProps {
  item: ClothingItem;
  onClose: () => void;
}

export function DeepDive({ item, onClose }: DeepDiveProps) {
  const layers = storyFor(item);
  const [depth, setDepth] = useState(0);
  const lock = useRef(0);
  const depthRef = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const layer = layers[depth];
  depthRef.current = depth;

  const step = (direction: 1 | -1) => {
    const now = Date.now();
    if (now - lock.current < 380) return;
    lock.current = now;
    const next = depthRef.current + direction;
    if (next < 0) {
      onClose();
      return;
    }
    const clamped = Math.min(layers.length - 1, next);
    depthRef.current = clamped;
    setDepth(clamped);
  };

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) return;
      step(event.deltaY > 0 ? 1 : -1);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  });

  return (
    <motion.div
      ref={scroller}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-stretch justify-center bg-brand-950/92 p-4 text-white backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Deep dive on ${item.name}`}
    >
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center">
        <ClothZoom item={item} depth={depth} layer={layer} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-accent-300">
                {item.brand} · {depth + 1} of {layers.length}
              </p>
              <h2 className="mt-1 font-display text-3xl text-white sm:text-4xl">{item.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Close deep dive"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ol className="mb-5 flex gap-2">
            {layers.map((entry, index) => (
              <li key={entry.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setDepth(index)}
                  className={cn(
                    "w-full rounded-full px-2 py-1 text-left text-[11px] uppercase tracking-wide",
                    index === depth ? "bg-white text-brand-950" : "bg-white/10 text-brand-200 hover:bg-white/15"
                  )}
                >
                  {entry.label}
                </button>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              <p className="text-sm text-accent-300">{layer.label}</p>
              <h3 className="mt-1 font-display text-2xl text-white">{layer.title}</h3>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-brand-100">{layer.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              <Minus className="h-4 w-4" />
              Scroll out
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={depth === layers.length - 1}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-brand-950 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Scroll in
            </button>
            <p className="text-xs text-brand-400">
              Scroll the page area to move closer. Scroll back to leave.
            </p>
          </div>

          <p className="mt-6 max-w-xl text-xs leading-relaxed text-brand-500">
            Partner piece. These four layers are the material path, not an audit we have walked.
            When a piece is ours, they will name the mill, the farm or feedstock, and the people.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ClothZoom({
  item,
  depth,
  layer,
}: {
  item: ClothingItem;
  depth: number;
  layer: StoryLayer;
}) {
  const scale = 1 + depth * 0.28;
  const weave = Math.max(8, 26 - depth * 5);

  return (
    <div className="relative mx-auto h-72 w-72 shrink-0 overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl sm:h-96 sm:w-80">
      <motion.div
        className="absolute inset-[-30%] flex items-center justify-center"
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        <div
          className="h-full w-full"
          style={{
            backgroundColor: item.color,
            backgroundImage: `
              linear-gradient(115deg, rgba(255,255,255,0.22), transparent 42%),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 2px, transparent 2px ${weave}px),
              repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 2px, transparent 2px ${weave}px)
            `,
          }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-white/10" />
      <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white">
        Close-up · {layer.label}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="font-display text-2xl leading-tight text-white">{layer.title}</p>
        <p className="mt-1 text-xs text-white/75">{item.brand}</p>
      </div>
    </div>
  );
}
