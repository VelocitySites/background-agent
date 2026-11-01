"use client";

import { useState, useCallback } from "react";
import type { ModelState, Product, ProductVariant, ClothingSlot } from "@/types";

const DEFAULT_MODEL_IMAGE = "/images/models/default-model.png";

interface UseModelStateReturn {
  modelState: ModelState;
  setCustomPhoto: (imageUrl: string) => void;
  clearCustomPhoto: () => void;
  selectItem: (slot: ClothingSlot, product: Product, variant: ProductVariant) => void;
  removeItem: (slot: ClothingSlot) => void;
  clearAllItems: () => void;
  getSelectedProducts: () => { product: Product; variant: ProductVariant }[];
  getTotalPrice: () => number;
}

export function useModelState(): UseModelStateReturn {
  const [modelState, setModelState] = useState<ModelState>({
    baseImage: DEFAULT_MODEL_IMAGE,
    isCustomPhoto: false,
    selectedItems: {},
  });

  const setCustomPhoto = useCallback((imageUrl: string) => {
    setModelState((prev) => ({
      ...prev,
      baseImage: imageUrl,
      isCustomPhoto: true,
    }));
  }, []);

  const clearCustomPhoto = useCallback(() => {
    setModelState((prev) => ({
      ...prev,
      baseImage: DEFAULT_MODEL_IMAGE,
      isCustomPhoto: false,
    }));
  }, []);

  const selectItem = useCallback(
    (slot: ClothingSlot, product: Product, variant: ProductVariant) => {
      setModelState((prev) => ({
        ...prev,
        selectedItems: {
          ...prev.selectedItems,
          [slot]: { product, variant },
        },
      }));
    },
    []
  );

  const removeItem = useCallback((slot: ClothingSlot) => {
    setModelState((prev) => {
      const newSelectedItems = { ...prev.selectedItems };
      delete newSelectedItems[slot];
      return {
        ...prev,
        selectedItems: newSelectedItems,
      };
    });
  }, []);

  const clearAllItems = useCallback(() => {
    setModelState((prev) => ({
      ...prev,
      selectedItems: {},
    }));
  }, []);

  const getSelectedProducts = useCallback(() => {
    return Object.values(modelState.selectedItems).filter(
      (item): item is { product: Product; variant: ProductVariant } =>
        item !== undefined
    );
  }, [modelState.selectedItems]);

  const getTotalPrice = useCallback(() => {
    return getSelectedProducts().reduce(
      (total, item) => total + item.product.price,
      0
    );
  }, [getSelectedProducts]);

  return {
    modelState,
    setCustomPhoto,
    clearCustomPhoto,
    selectItem,
    removeItem,
    clearAllItems,
    getSelectedProducts,
    getTotalPrice,
  };
}
