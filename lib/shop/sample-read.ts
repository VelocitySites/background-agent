import { matchColorPhrase } from "@/lib/shop/color-theory";
import type { PartnerListing } from "@/lib/shop/intake";

/**
 * A product record from a public Shopify catalog feed (`/products.json`).
 * Only the fields the avatar needs are kept. Photos and marketing copy are dropped.
 */
export interface ShopifyProduct {
  title?: string;
  vendor?: string;
  product_type?: string;
  handle?: string;
  options?: { name?: string; values?: string[] }[];
  variants?: { price?: string | number; title?: string; option1?: string | null }[];
}

export interface OutletSample {
  outlet: string;
  origin: string;
  product: ShopifyProduct;
}

export interface ReadSample {
  outlet: string;
  listing: PartnerListing;
  /** The merchant's color words, before they were matched to a known name. */
  merchantColor: string | null;
  colorName: string | null;
  slots: Array<"head" | "top" | "bottom" | "feet">;
}

const COLOR_OPTIONS = new Set(["color", "colour"]);

const SLOT_HINTS: { slot: "head" | "top" | "bottom" | "feet"; pattern: RegExp }[] = [
  { slot: "head", pattern: /\b(beanie|watch cap|bucket hat|snapback|baseball cap|cap|hat)\b/i },
  { slot: "top", pattern: /\b(hoodie|hoody|hooded|t-shirt|tshirt|tee|oxford|dress shirt|sweater|sweatshirt|crew neck|crew)\b/i },
  { slot: "bottom", pattern: /\b(jeans|jean|denim|joggers|jogger|sweatpants|sweatpant|chinos|chino|trousers|trouser|pants|pant)\b/i },
  { slot: "feet", pattern: /\b(boots|boot|sneakers|sneaker|runners|runner|trainers|trainer|high-tops|high top|shoes|shoe)\b/i },
];

/** Slots named in a title. Two slots means the record is a set, not one piece. */
export function mentionedSlots(text: string): Array<"head" | "top" | "bottom" | "feet"> {
  const found: Array<"head" | "top" | "bottom" | "feet"> = [];
  for (const hint of SLOT_HINTS) {
    if (hint.pattern.test(text) && !found.includes(hint.slot)) found.push(hint.slot);
  }
  return found;
}

export function trimShopifyProduct(product: ShopifyProduct): ShopifyProduct {
  return {
    title: product.title,
    vendor: product.vendor,
    product_type: product.product_type,
    handle: product.handle,
    options: (product.options ?? []).slice(0, 4).map((option) => ({
      name: option.name,
      values: (option.values ?? []).slice(0, 4),
    })),
    variants: (product.variants ?? []).slice(0, 1).map((variant) => ({
      price: variant.price,
      title: variant.title,
      option1: variant.option1,
    })),
  };
}

export function dollarsFromFeed(price: string | number | undefined): number | null {
  if (typeof price === "number") {
    if (!Number.isFinite(price) || price <= 0) return null;
    if (Number.isInteger(price) && price >= 1000) return Math.round(price) / 100;
    return price;
  }
  if (!price) return null;
  const amount = Number(String(price).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function colorWords(product: ShopifyProduct): string | null {
  const title = product.title?.trim() ?? "";
  const piped = title.split("|").map((part) => part.trim()).filter(Boolean);
  if (piped.length > 1) return piped[piped.length - 1];
  const named = title.match(/\bin\s+(.+)$/i);
  if (named) return named[1].trim();

  const values = (product.options ?? [])
    .filter((entry) => COLOR_OPTIONS.has((entry.name ?? "").toLowerCase()))
    .flatMap((entry) => entry.values ?? []);
  const inTitle = values.find((value) => title.toLowerCase().includes(value.toLowerCase()));
  if (inTitle) return inTitle;
  if (matchColorPhrase(title)) return title;
  return values[0]?.trim() || title || null;
}

export function readShopifySample(product: ShopifyProduct, origin: string, outlet: string): ReadSample | null {
  const title = product.title?.trim() ?? "";
  const handle = product.handle?.trim() ?? "";
  const brandName = product.vendor?.trim() ?? "";
  const brand = brandName.length > 1 && !/^\d+$/.test(brandName) ? brandName : outlet;
  const price = dollarsFromFeed(product.variants?.[0]?.price);
  if (!title || !handle || !price) return null;

  let productUrl: string;
  try {
    productUrl = new URL(`/products/${handle}`, origin).toString();
  } catch {
    return null;
  }

  const merchantColor = colorWords(product);
  const matched = merchantColor ? matchColorPhrase(merchantColor) : null;
  const category = [product.product_type, title].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  return {
    outlet,
    merchantColor,
    colorName: matched?.name ?? null,
    slots: mentionedSlots(category),
    listing: {
      brand,
      name: title,
      price,
      productUrl,
      color: matched?.name ?? merchantColor ?? "",
      category,
    },
  };
}
