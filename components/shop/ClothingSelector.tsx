"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Check, Shirt, HardHat, Footprints } from "lucide-react";
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

const SLOT_ICONS: Record<ClothingSlot, React.ElementType> = {
  head: HardHat,
  top: Shirt,
  bottom: Shirt,
  feet: Footprints,
  accessory: Shirt,
};

const COLOR_MAP: Record<string, string> = {
  Black: "#1a1a1a",
  Navy: "#1e3a5f",
  Gray: "#6b7280",
  Charcoal: "#374151",
  White: "#ffffff",
  Khaki: "#c3b091",
};

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
        { id: "v1", size: "One Size", color: "Black", colorHex: "#1a1a1a", stock: 10, sku: "CAP-BLK" },
        { id: "v2", size: "One Size", color: "Navy", colorHex: "#1e3a5f", stock: 8, sku: "CAP-NVY" },
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
        { id: "v3", size: "One Size", color: "Gray", colorHex: "#6b7280", stock: 15, sku: "BNE-GRY" },
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
        { id: "v4", size: "S", color: "White", colorHex: "#ffffff", stock: 20, sku: "TEE-WHT-S" },
        { id: "v5", size: "M", color: "White", colorHex: "#ffffff", stock: 25, sku: "TEE-WHT-M" },
        { id: "v6", size: "L", color: "White", colorHex: "#ffffff", stock: 18, sku: "TEE-WHT-L" },
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
        { id: "v7", size: "M", color: "Black", colorHex: "#1a1a1a", stock: 12, sku: "HOOD-BLK-M" },
        { id: "v8", size: "L", color: "Black", colorHex: "#1a1a1a", stock: 10, sku: "HOOD-BLK-L" },
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
        { id: "v9", size: "M", color: "Charcoal", colorHex: "#374151", stock: 15, sku: "JOG-CHR-M" },
        { id: "v10", size: "L", color: "Charcoal", colorHex: "#374151", stock: 12, sku: "JOG-CHR-L" },
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
        { id: "v11", size: "32", color: "Khaki", colorHex: "#c3b091", stock: 8, sku: "CHI-KHK-32" },
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
        { id: "v12", size: "10", color: "White", colorHex: "#ffffff", stock: 10, sku: "SNK-WHT-10" },
        { id: "v13", size: "11", color: "White", colorHex: "#ffffff", stock: 8, sku: "SNK-WHT-11" },
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { opacity, handlers } = useFadeOnIdle({
    timeout: 3000,
    initiallyVisible: true,
    minOpacity: 0.4,
  });

  const products = MOCK_PRODUCTS[slot] || [];
  const Icon = SLOT_ICONS[slot];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product: Product, variant?: ProductVariant) => {
    const selectedVariant = variant || product.variants[0];
    if (selectedVariant) {
      onSelect(product, selectedVariant);
      setSelectedVariantId(selectedVariant.id);
      setIsExpanded(false);
    }
  };

  const getUniqueColors = (product: Product) => {
    const colorMap = new Map<string, ProductVariant>();
    product.variants.forEach((v) => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, v);
      }
    });
    return Array.from(colorMap.values());
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      {...handlers}
      style={{ 
        opacity: selectedItem ? 1 : Math.max(0.4, opacity),
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Selected Item Display / Trigger */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-56 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
          selectedItem
            ? "bg-gradient-to-r from-white to-brand-50 border-accent-300 shadow-lg"
            : "bg-gradient-to-r from-brand-100/60 to-brand-100/40 border-brand-200 hover:border-brand-300"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              selectedItem 
                ? "bg-gradient-to-br from-accent-100 to-accent-200" 
                : "bg-brand-200/50"
            )}>
              {selectedItem ? (
                <span className="text-lg font-bold text-accent-600">
                  {selectedItem.product.name.charAt(0)}
                </span>
              ) : (
                <Icon className="w-5 h-5 text-brand-500" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-brand-500 uppercase tracking-wide font-medium">
                {label}
              </p>
              {selectedItem ? (
                <>
                  <p className="font-semibold text-brand-900 truncate max-w-[120px]">
                    {selectedItem.product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-accent-600 font-medium">
                      ${selectedItem.product.price}
                    </span>
                    {selectedItem.variant.colorHex && (
                      <span 
                        className="w-3 h-3 rounded-full border border-brand-300"
                        style={{ backgroundColor: selectedItem.variant.colorHex }}
                      />
                    )}
                  </div>
                </>
              ) : (
                <p className="text-brand-600">Select {label}</p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-brand-400 transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </motion.button>

      {/* Remove Button */}
      {selectedItem && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setSelectedVariantId(null);
          }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-brand-200 hover:bg-red-400 hover:text-white rounded-full flex items-center justify-center transition-all z-20 shadow-md"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-brand-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-brand-100 bg-brand-50/50">
              <h4 className="text-sm font-medium text-brand-900">Select {label}</h4>
              <p className="text-xs text-brand-500">{products.length} items available</p>
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-hide">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="border-b border-brand-100 last:border-0">
                    <button
                      onClick={() => handleSelect(product)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-brand-50 transition-colors flex items-start gap-3",
                        selectedItem?.product.id === product.id && "bg-accent-50"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-brand-400">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-brand-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-brand-600">
                              ${product.price}
                            </p>
                          </div>
                          {selectedItem?.product.id === product.id && (
                            <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Color swatches */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {getUniqueColors(product).map((variant) => (
                            <button
                              key={variant.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(product, variant);
                              }}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-all",
                                selectedVariantId === variant.id
                                  ? "border-accent-500 ring-2 ring-accent-200 scale-110"
                                  : "border-brand-200 hover:border-brand-400"
                              )}
                              style={{ 
                                backgroundColor: variant.colorHex || COLOR_MAP[variant.color] || "#ccc" 
                              }}
                              title={variant.color}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Icon className="w-8 h-8 text-brand-300 mx-auto mb-2" />
                  <p className="text-brand-500">No items available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
