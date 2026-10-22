"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModelViewer } from "@/components/shop/ModelViewer";
import { ClothingSelector } from "@/components/shop/ClothingSelector";
import { useModelState } from "@/hooks/useModelState";
import { Camera, ShoppingBag } from "lucide-react";
import type { ClothingSlot } from "@/types";

const CLOTHING_SLOTS: { slot: ClothingSlot; label: string; position: "left" | "right" }[] = [
  { slot: "head", label: "Headwear", position: "left" },
  { slot: "top", label: "Tops", position: "right" },
  { slot: "bottom", label: "Bottoms", position: "left" },
  { slot: "feet", label: "Footwear", position: "right" },
];

export default function ShopPage() {
  const {
    modelState,
    selectItem,
    removeItem,
    getSelectedProducts,
    getTotalPrice,
  } = useModelState();

  const [showTryOnModal, setShowTryOnModal] = useState(false);

  const selectedProducts = getSelectedProducts();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-brand-50 pt-20">
      {/* Header */}
      <div className="container-wide section-padding py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-brand-900">
              Create Your Look
            </h1>
            <p className="text-brand-600 mt-1">
              Click on clothing items to customize your outfit
            </p>
          </div>
          <button
            onClick={() => setShowTryOnModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Be the Model</span>
          </button>
        </div>
      </div>

      {/* Main Shopping Experience */}
      <div className="container-wide section-padding pb-12">
        <div className="relative flex items-start justify-center gap-4">
          {/* Left Selectors */}
          <div className="flex flex-col gap-4 pt-12">
            {CLOTHING_SLOTS.filter((s) => s.position === "left").map(
              ({ slot, label }) => (
                <ClothingSelector
                  key={slot}
                  slot={slot}
                  label={label}
                  selectedItem={modelState.selectedItems[slot]}
                  onSelect={(product, variant) => selectItem(slot, product, variant)}
                  onRemove={() => removeItem(slot)}
                />
              )
            )}
          </div>

          {/* Center Model */}
          <div className="flex-shrink-0">
            <ModelViewer
              modelState={modelState}
              className="w-[400px] h-[600px]"
            />
          </div>

          {/* Right Selectors */}
          <div className="flex flex-col gap-4 pt-12">
            {CLOTHING_SLOTS.filter((s) => s.position === "right").map(
              ({ slot, label }) => (
                <ClothingSelector
                  key={slot}
                  slot={slot}
                  label={label}
                  selectedItem={modelState.selectedItems[slot]}
                  onSelect={(product, variant) => selectItem(slot, product, variant)}
                  onRemove={() => removeItem(slot)}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-200 shadow-lg"
        >
          <div className="container-wide section-padding py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-600 text-sm">
                  {selectedProducts.length} items selected
                </p>
                <p className="font-display text-2xl text-brand-900">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 text-brand-700 hover:text-brand-900 transition-colors">
                  Save Look
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-full hover:bg-brand-800 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Try-On Modal */}
      {showTryOnModal && (
        <TryOnModal onClose={() => setShowTryOnModal(false)} />
      )}
    </div>
  );
}

function TryOnModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-brand-900 mb-4">
          Be the Model
        </h2>
        <p className="text-brand-600 mb-6">
          Upload your photo to see yourself wearing any outfit. Your photos are
          processed privately and never stored.
        </p>

        <div className="border-2 border-dashed border-brand-300 rounded-xl p-8 text-center hover:border-accent-400 transition-colors cursor-pointer">
          <Camera className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <p className="text-brand-700 font-medium mb-2">
            Drop your photo here or click to upload
          </p>
          <p className="text-brand-500 text-sm">
            Front-facing photo works best. Good lighting recommended.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 px-4 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
            Upload Photo
          </button>
        </div>

        <p className="text-xs text-brand-500 text-center mt-4">
          🔒 Your privacy matters. Photos are processed locally and never stored on our servers.
        </p>
      </motion.div>
    </motion.div>
  );
}
