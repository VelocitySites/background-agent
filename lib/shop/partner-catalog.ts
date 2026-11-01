import { INVENTORY, type ClothingItem } from "@/lib/shop/catalog";

export const PARTNER_STORAGE_KEY = "revolution_partner_items";
export const PARTNER_EVENT = "revolution-partners-changed";

export function mergeShopInventory(partners: ClothingItem[], catalog: ClothingItem[] = INVENTORY): ClothingItem[] {
  const ids = new Set(catalog.map((item) => item.id));
  return [...catalog, ...partners.filter((item) => item && item.id && !ids.has(item.id))];
}

export function loadPartnerItems(): ClothingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PARTNER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClothingItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.kind === "string");
  } catch {
    return [];
  }
}

export function savePartnerItem(item: ClothingItem): ClothingItem[] {
  const productUrl = item.affiliate?.productUrl;
  const next = [
    item,
    ...loadPartnerItems().filter((existing) => existing.id !== item.id && existing.affiliate?.productUrl !== productUrl),
  ].slice(0, 40);
  persist(next);
  return next;
}

export function removePartnerItem(id: string) {
  persist(loadPartnerItems().filter((item) => item.id !== id));
}

export function findShopItem(id: string): ClothingItem | null {
  return INVENTORY.find((item) => item.id === id) ?? loadPartnerItems().find((item) => item.id === id) ?? null;
}

function persist(items: ClothingItem[]) {
  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(PARTNER_EVENT));
}
