import type { ClothingSlot } from "@/types";

export type GarmentKind =
  | "cap"
  | "beanie"
  | "bucket"
  | "tee"
  | "hoodie"
  | "oxford"
  | "graphic"
  | "chinos"
  | "joggers"
  | "jeans"
  | "leather"
  | "canvas"
  | "runner";

export type AffiliateNetwork = "impact" | "rakuten" | "awin" | "cj" | "shareasale" | "direct";

export interface AffiliateDeal {
  status: "tracked" | "untracked";
  network: AffiliateNetwork | null;
  productUrl: string;
  trackedUrl: string | null;
  /** Where Get This Look sends the shopper. Tracked only when status says so. */
  buyUrl: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  /** Public product page on the maker's site. Not a tracked affiliate link yet. */
  affiliateUrl: string;
  imageUrl: string;
  slot: ClothingSlot;
  colors: string[];
  /** Primary cloth color used to draw the garment. */
  color: string;
  /** Stitch, sole, logo, or graphic accent. */
  accent: string;
  style: string[];
  kind: GarmentKind;
  sizes?: string[];
  /** Present once a piece has been through partner intake. Catalog pieces omit it. */
  affiliate?: AffiliateDeal;
}

export interface LookPreset {
  id: string;
  name: string;
  description: string;
  gradient: string;
  items: Record<ClothingSlot, string | null>;
}

export type SelectedOutfit = Record<ClothingSlot, ClothingItem | null>;

/**
 * Affiliate inventory until there is a house line.
 * Links open the maker's own site. Commission tracking is not wired up.
 */
export const INVENTORY: ClothingItem[] = [
  {
    id: "h1",
    name: "Heritage86 Cap",
    brand: "Nike",
    price: 32,
    affiliateUrl: "https://www.nike.com/w/mens-hats-visors-caps-6m1zznik1",
    imageUrl: "",
    slot: "head",
    colors: ["black", "navy"],
    color: "#1c1c1c",
    accent: "#f5f5f4",
    style: ["streetwear", "athleisure"],
    kind: "cap",
    sizes: ["S/M", "M/L"],
  },
  {
    id: "h2",
    name: "Acrylic Watch Hat",
    brand: "Carhartt",
    price: 20,
    affiliateUrl: "https://www.carhartt.com/product/A18/acrylic-watch-hat",
    imageUrl: "",
    slot: "head",
    colors: ["gray", "black"],
    color: "#6b6560",
    accent: "#3f3a36",
    style: ["streetwear", "minimalist"],
    kind: "beanie",
    sizes: ["One size"],
  },
  {
    id: "h3",
    name: "Stock Bucket Hat",
    brand: "Stussy",
    price: 48,
    affiliateUrl: "https://www.stussy.com/collections/headwear",
    imageUrl: "",
    slot: "head",
    colors: ["khaki", "black"],
    color: "#c6b48a",
    accent: "#3d3424",
    style: ["streetwear"],
    kind: "bucket",
    sizes: ["S/M", "L/XL"],
  },
  {
    id: "t1",
    name: "Crew Neck Tee",
    brand: "Uniqlo",
    price: 20,
    affiliateUrl: "https://www.uniqlo.com/us/en/men/tops/t-shirts",
    imageUrl: "",
    slot: "top",
    colors: ["white", "black", "gray"],
    color: "#f3efe6",
    accent: "#d6d3cb",
    style: ["minimalist", "classic"],
    kind: "tee",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "t2",
    name: "Reverse Weave Hoodie",
    brand: "Champion",
    price: 70,
    affiliateUrl: "https://www.champion.com/collections/hoodies",
    imageUrl: "",
    slot: "top",
    colors: ["heather gray", "navy"],
    color: "#8e96a3",
    accent: "#1f2937",
    style: ["streetwear", "athleisure"],
    kind: "hoodie",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "t3",
    name: "Oxford Button-Down",
    brand: "J.Crew",
    price: 89,
    affiliateUrl: "https://www.jcrew.com/mens/categories/clothing/shirts",
    imageUrl: "",
    slot: "top",
    colors: ["light blue", "white"],
    color: "#c5d7ea",
    accent: "#f8fafc",
    style: ["classic", "preppy"],
    kind: "oxford",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "t4",
    name: "Graphic Tee",
    brand: "Supreme",
    price: 48,
    affiliateUrl: "https://www.supremenewyork.com/shop/all/t-shirts",
    imageUrl: "",
    slot: "top",
    colors: ["black", "white"],
    color: "#161616",
    accent: "#e05f4d",
    style: ["streetwear"],
    kind: "graphic",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "b1",
    name: "Stretch Washed Chino",
    brand: "Bonobos",
    price: 98,
    affiliateUrl: "https://bonobos.com/shop/pants",
    imageUrl: "",
    slot: "bottom",
    colors: ["khaki", "navy"],
    color: "#c4a574",
    accent: "#6b4f32",
    style: ["classic", "preppy"],
    kind: "chinos",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: "b2",
    name: "Tech Fleece Joggers",
    brand: "Nike",
    price: 120,
    affiliateUrl: "https://www.nike.com/w/mens-joggers-sweatpants-6sipzznik1",
    imageUrl: "",
    slot: "bottom",
    colors: ["black", "gray"],
    color: "#2a2e33",
    accent: "#9ca3af",
    style: ["athleisure", "streetwear"],
    kind: "joggers",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "b3",
    name: "501 Original Jeans",
    brand: "Levi's",
    price: 98,
    affiliateUrl:
      "https://www.levi.com/US/en_US/clothing/men/jeans/straight/501-original-fit-mens-jeans/p/005010194",
    imageUrl: "",
    slot: "bottom",
    colors: ["indigo", "black"],
    color: "#1d3557",
    accent: "#d6b25e",
    style: ["classic", "streetwear"],
    kind: "jeans",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: "f1",
    name: "Original Achilles Low",
    brand: "Common Projects",
    price: 425,
    affiliateUrl: "https://www.commonprojects.com/collections/original-achilles",
    imageUrl: "",
    slot: "feet",
    colors: ["white"],
    color: "#f7f6f2",
    accent: "#e7e5e4",
    style: ["minimalist", "classic"],
    kind: "leather",
    sizes: ["8", "9", "10", "11", "12"],
  },
  {
    id: "f2",
    name: "Chuck Taylor All Star",
    brand: "Converse",
    price: 65,
    affiliateUrl: "https://www.converse.com/shop/p/chuck-taylor-all-star-unisex-high-top-shoe/M9160.html",
    imageUrl: "",
    slot: "feet",
    colors: ["black", "white"],
    color: "#1a1a1a",
    accent: "#f5f5f4",
    style: ["streetwear", "classic"],
    kind: "canvas",
    sizes: ["7", "8", "9", "10", "11", "12"],
  },
  {
    id: "f3",
    name: "574 Core",
    brand: "New Balance",
    price: 100,
    affiliateUrl: "https://www.newbalance.com/pd/574-core/ML574EVG-D.html",
    imageUrl: "",
    slot: "feet",
    colors: ["gray", "navy"],
    color: "#8b919a",
    accent: "#1d4e89",
    style: ["athleisure"],
    kind: "runner",
    sizes: ["8", "9", "10", "11", "12"],
  },
];

export const LOOK_PRESETS: LookPreset[] = [
  {
    id: "street-king",
    name: "Street King",
    description: "Cap, hoodie, joggers, canvas highs",
    gradient: "from-purple-500 to-indigo-600",
    items: { head: "h1", top: "t2", bottom: "b2", feet: "f2", accessory: null },
  },
  {
    id: "minimalist",
    name: "Clean & Simple",
    description: "Tee, chinos, white leather",
    gradient: "from-emerald-500 to-teal-600",
    items: { head: null, top: "t1", bottom: "b1", feet: "f1", accessory: null },
  },
  {
    id: "fire-fit",
    name: "Fire Fit",
    description: "Bucket, graphic tee, 501s",
    gradient: "from-orange-500 to-red-600",
    items: { head: "h3", top: "t4", bottom: "b3", feet: "f2", accessory: null },
  },
  {
    id: "athlete",
    name: "Sport Mode",
    description: "Cap, hoodie, joggers, runners",
    gradient: "from-cyan-500 to-blue-600",
    items: { head: "h1", top: "t2", bottom: "b2", feet: "f3", accessory: null },
  },
  {
    id: "classic",
    name: "Pressed",
    description: "Oxford, chinos, white leather",
    gradient: "from-sky-500 to-blue-700",
    items: { head: null, top: "t3", bottom: "b1", feet: "f1", accessory: null },
  },
];

export const STYLE_TO_LOOK: Record<string, string> = {
  minimalist: "minimalist",
  streetwear: "street-king",
  classic: "classic",
  "avant-garde": "fire-fit",
  athleisure: "athlete",
  bohemian: "fire-fit",
  preppy: "classic",
  "surprise me": "random",
};

export const SLOT_LABELS: Record<ClothingSlot, string> = {
  head: "Headwear",
  top: "Top",
  bottom: "Bottom",
  feet: "Footwear",
  accessory: "Accessory",
};

export function itemById(id: string | null | undefined): ClothingItem | null {
  if (!id) return null;
  return INVENTORY.find((item) => item.id === id) ?? null;
}

export function itemsForSlot(slot: ClothingSlot): ClothingItem[] {
  return INVENTORY.filter((item) => item.slot === slot);
}

export function emptyOutfit(): SelectedOutfit {
  return {
    head: null,
    top: null,
    bottom: null,
    feet: null,
    accessory: null,
  };
}

export function outfitFromIds(
  map: Partial<Record<ClothingSlot, string | null>>
): SelectedOutfit {
  const outfit = emptyOutfit();
  (Object.keys(outfit) as ClothingSlot[]).forEach((slot) => {
    outfit[slot] = itemById(map[slot]);
  });
  return outfit;
}

export function defaultOutfit(): SelectedOutfit {
  return outfitFromIds({ top: "t1", bottom: "b3", feet: "f2" });
}

export function outfitFromPreset(presetId: string): SelectedOutfit | null {
  const preset = LOOK_PRESETS.find((entry) => entry.id === presetId);
  if (!preset) return null;
  return outfitFromIds(preset.items);
}

export function randomOutfit(source: ClothingItem[] = INVENTORY): SelectedOutfit {
  const outfit = emptyOutfit();
  (["head", "top", "bottom", "feet"] as ClothingSlot[]).forEach((slot) => {
    const items = source.filter((item) => item.slot === slot);
    if (items.length === 0) return;
    const useItem = slot === "head" ? Math.random() > 0.35 : true;
    outfit[slot] = useItem ? items[Math.floor(Math.random() * items.length)] : null;
  });
  return outfit;
}

export function outfitItemIds(outfit: SelectedOutfit): string[] {
  return Object.values(outfit)
    .filter((item): item is ClothingItem => item !== null)
    .map((item) => item.id);
}

export function outfitTotal(outfit: SelectedOutfit): number {
  return Object.values(outfit)
    .filter((item): item is ClothingItem => item !== null)
    .reduce((sum, item) => sum + item.price, 0);
}

export function presetTotal(preset: LookPreset): number {
  return Object.values(preset.items).reduce((sum, id) => {
    const item = itemById(id);
    return sum + (item?.price ?? 0);
  }, 0);
}
