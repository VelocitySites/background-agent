"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useFadeOnIdle } from "@/hooks/useFadeOnIdle";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant, ClothingSlot } from "@/types";

interface ClothingSelectorProps {
  slot: ClothingSlot;
  label: string;
  selectedItem?: {
    product: Product;
    variant: ProductVariant;
  };
  onSelect: (product: Product, variant: ProductVariant) => void;
  onRemove: () => void;
}

const MOCK_PRODUCTS: Record<ClothingSlot, Product[]> = {
  head: [
    {
      id: "hat-1",
      name: "Classic Cap",
      slug: "classic-cap",
      description: "A timeless baseball cap",
      price: 35,
      category: { id: "1", name: "Hats", slug: "hats", slot: "head", order: 1 },
      variants: [
        { id: "v1", size: "One Size", color: "Black", stock: 10, sku: "CAP-BLK" },
        { id: "v2", size: "One Size", color: "Navy", stock: 8, sku: "CAP-NVY" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: true,
    },
    {
      id: "hat-2",
      name: "Beanie",
      slug: "beanie",
      description: "Warm winter beanie",
      price: 28,
      category: { id: "1", name: "Hats", slug: "hats", slot: "head", order: 1 },
      variants: [
        { id: "v3", size: "One Size", color: "Gray", stock: 15, sku: "BNE-GRY" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: false,
    },
  ],
  top: [
    {
      id: "top-1",
      name: "Heritage Tee",
      slug: "heritage-tee",
      description: "Our signature cotton t-shirt",
      price: 45,
      category: { id: "2", name: "Tops", slug: "tops", slot: "top", order: 2 },
      variants: [
        { id: "v4", size: "S", color: "White", stock: 20, sku: "TEE-WHT-S" },
        { id: "v5", size: "M", color: "White", stock: 25, sku: "TEE-WHT-M" },
        { id: "v6", size: "L", color: "White", stock: 18, sku: "TEE-WHT-L" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: true,
    },
    {
      id: "top-2",
      name: "Revolution Hoodie",
      slug: "revolution-hoodie",
      description: "Premium heavyweight hoodie",
      price: 120,
      category: { id: "2", name: "Tops", slug: "tops", slot: "top", order: 2 },
      variants: [
        { id: "v7", size: "M", color: "Black", stock: 12, sku: "HOOD-BLK-M" },
        { id: "v8", size: "L", color: "Black", stock: 10, sku: "HOOD-BLK-L" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: true,
    },
  ],
  bottom: [
    {
      id: "bottom-1",
      name: "Essential Joggers",
      slug: "essential-joggers",
      description: "Comfortable everyday joggers",
      price: 85,
      category: { id: "3", name: "Bottoms", slug: "bottoms", slot: "bottom", order: 3 },
      variants: [
        { id: "v9", size: "M", color: "Charcoal", stock: 15, sku: "JOG-CHR-M" },
        { id: "v10", size: "L", color: "Charcoal", stock: 12, sku: "JOG-CHR-L" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: true,
    },
    {
      id: "bottom-2",
      name: "Relaxed Chinos",
      slug: "relaxed-chinos",
      description: "Classic relaxed fit chinos",
      price: 95,
      category: { id: "3", name: "Bottoms", slug: "bottoms", slot: "bottom", order: 3 },
      variants: [
        { id: "v11", size: "32", color: "Khaki", stock: 8, sku: "CHI-KHK-32" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: false,
    },
  ],
  feet: [
    {
      id: "feet-1",
      name: "Canvas Sneakers",
      slug: "canvas-sneakers",
      description: "Classic low-top canvas sneakers",
      price: 75,
      category: { id: "4", name: "Footwear", slug: "footwear", slot: "feet", order: 4 },
      variants: [
        { id: "v12", size: "10", color: "White", stock: 10, sku: "SNK-WHT-10" },
        { id: "v13", size: "11", color: "White", stock: 8, sku: "SNK-WHT-11" },
      ],
      images: [],
      modelImages: [],
      isActive: true,
      isFeatured: true,
    },
  ],
  accessory: [],
};

export function ClothingSelector({
  slot,
  label,
  selectedItem,
  onSelect,
  onRemove,
}: ClothingSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { opacity, handlers } = useFadeOnIdle({
    timeout: 2500,
    initiallyVisible: true,
  });

  const products = MOCK_PRODUCTS[slot] || [];

  const handleSelect = (product: Product) => {
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      onSelect(product, defaultVariant);
      setIsExpanded(false);
    }
  };

  return (
    <div
      className="relative"
      {...handlers}
      style={{ opacity: selectedItem ? 1 : Math.max(0.3, opacity) }}
    >
      {/* Selected Item Display / Trigger */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-48 p-3 rounded-xl border-2 transition-all duration-300",
          selectedItem
            ? "bg-white border-accent-300 shadow-md"
            : "bg-brand-100/50 border-brand-200 hover:border-brand-300"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-brand-500 uppercase tracking-wide">
              {label}
            </p>
            {selectedItem ? (
              <>
                <p className="font-medium text-brand-900 truncate">
                  {selectedItem.product.name}
                </p>
                <p className="text-sm text-accent-600">
                  ${selectedItem.product.price}
                </p>
              </>
            ) : (
              <p className="text-brand-600">Select {label}</p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-brand-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </motion.button>

      {/* Remove Button */}
      {selectedItem && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-brand-200 hover:bg-brand-300 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-brand-700" />
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-brand-200 overflow-hidden z-50"
          >
            <div className="max-h-64 overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className={cn(
                      "w-full p-3 text-left hover:bg-brand-50 transition-colors flex items-center gap-3",
                      selectedItem?.product.id === product.id && "bg-accent-50"
                    )}
                  >
                    <div className="w-12 h-12 bg-brand-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-brand-600">
                        ${product.price}
                      </p>
                    </div>
                    {selectedItem?.product.id === product.id && (
                      <div className="w-2 h-2 bg-accent-500 rounded-full" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-brand-500">
                  No items available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
