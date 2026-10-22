"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ModelState } from "@/types";
import { cn } from "@/lib/utils";

interface ModelViewerProps {
  modelState: ModelState;
  className?: string;
}

export function ModelViewer({ modelState, className }: ModelViewerProps) {
  const { selectedItems, isCustomPhoto } = modelState;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-b from-brand-100 to-brand-50 rounded-2xl overflow-hidden shadow-xl",
        className
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-200/30 to-transparent" />

      {/* Model Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-[500px]">
          {/* Placeholder silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 400"
              className="w-full h-full text-brand-300"
              fill="currentColor"
            >
              {/* Head */}
              <circle cx="100" cy="40" r="30" />
              {/* Body */}
              <path d="M70 70 L130 70 L140 200 L60 200 Z" />
              {/* Arms */}
              <path d="M60 80 L30 160 L40 165 L70 90 Z" />
              <path d="M140 80 L170 160 L160 165 L130 90 Z" />
              {/* Legs */}
              <path d="M75 200 L65 380 L85 380 L95 200 Z" />
              <path d="M105 200 L115 380 L135 380 L125 200 Z" />
            </svg>
          </div>

          {/* Clothing Layers */}
          {selectedItems.head && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16"
            >
              <div className="w-full h-full bg-accent-400 rounded-t-full flex items-center justify-center text-white text-xs">
                {selectedItems.head.product.name}
              </div>
            </motion.div>
          )}

          {selectedItems.top && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-32"
            >
              <div className="w-full h-full bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm p-2 text-center">
                {selectedItems.top.product.name}
              </div>
            </motion.div>
          )}

          {selectedItems.bottom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-52 left-1/2 -translate-x-1/2 w-36 h-40"
            >
              <div className="w-full h-full bg-brand-800 rounded-lg flex items-center justify-center text-white text-sm p-2 text-center">
                {selectedItems.bottom.product.name}
              </div>
            </motion.div>
          )}

          {selectedItems.feet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12"
            >
              <div className="w-full h-full bg-brand-950 rounded-lg flex items-center justify-center text-white text-xs">
                {selectedItems.feet.product.name}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom Photo Indicator */}
      {isCustomPhoto && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-accent-500 text-white text-xs rounded-full">
          Your Photo
        </div>
      )}

      {/* Interaction Hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-brand-500">
          Use the selectors to change items
        </p>
      </div>
    </div>
  );
}
