import type { ClothingSlot } from "@/types";
import type { AffiliateDeal, AffiliateNetwork, ClothingItem, GarmentKind } from "@/lib/shop/catalog";
import { adjustColor } from "@/lib/shop/color";
import { codeColor, hslToHex, parseColor } from "@/lib/shop/color-theory";
import { codeItem, type ItemCode } from "@/lib/shop/item-code";

/**
 * A listing as a future affiliate feed would hand it over, or as a person
 * would type it while reading the maker's page. This does not fetch the page.
 * Commission is tracked only when a network and a tracked URL are both present.
 */
export type { AffiliateNetwork };

export interface PartnerListing {
  brand: string;
  name: string;
  price: number;
  productUrl: string;
  trackedUrl?: string | null;
  network?: AffiliateNetwork | null;
  /** Merchant color words, or a hex such as #1e3a5f. */
  color: string;
  accentColor?: string | null;
  /** What the garment is, in the maker's words. "men's pullover hoodie". */
  category: string;
  imageUrl?: string;
}

export interface AdmitResult {
  ok: boolean;
  item: ClothingItem | null;
  code: ItemCode | null;
  confidence: "high" | "low";
  notes: string[];
  affiliate: AffiliateDeal | null;
}

const SHAPES: { kind: GarmentKind; slot: ClothingSlot; phrase: string; confidence: "high" | "low"; note?: string }[] = [
  { kind: "graphic", slot: "top", phrase: "graphic tee", confidence: "high" },
  { kind: "graphic", slot: "top", phrase: "graphic t-shirt", confidence: "high" },
  { kind: "graphic", slot: "top", phrase: "logo tee", confidence: "high" },
  { kind: "hoodie", slot: "top", phrase: "hoodie", confidence: "high" },
  { kind: "hoodie", slot: "top", phrase: "hoody", confidence: "high" },
  { kind: "hoodie", slot: "top", phrase: "hooded", confidence: "high" },
  { kind: "oxford", slot: "top", phrase: "button-down", confidence: "high" },
  { kind: "oxford", slot: "top", phrase: "button down", confidence: "high" },
  { kind: "oxford", slot: "top", phrase: "oxford", confidence: "high" },
  { kind: "oxford", slot: "top", phrase: "dress shirt", confidence: "high" },
  { kind: "tee", slot: "top", phrase: "t-shirt", confidence: "high" },
  { kind: "tee", slot: "top", phrase: "tshirt", confidence: "high" },
  { kind: "tee", slot: "top", phrase: "tee", confidence: "low" },
  { kind: "tee", slot: "top", phrase: "crew neck", confidence: "high" },
  { kind: "joggers", slot: "bottom", phrase: "jogger", confidence: "high" },
  { kind: "joggers", slot: "bottom", phrase: "sweatpant", confidence: "high" },
  { kind: "chinos", slot: "bottom", phrase: "chino", confidence: "high" },
  { kind: "chinos", slot: "bottom", phrase: "trouser", confidence: "high" },
  { kind: "jeans", slot: "bottom", phrase: "jean", confidence: "high" },
  { kind: "jeans", slot: "bottom", phrase: "denim", confidence: "high" },
  { kind: "beanie", slot: "head", phrase: "beanie", confidence: "high" },
  { kind: "beanie", slot: "head", phrase: "watch cap", confidence: "high" },
  { kind: "beanie", slot: "head", phrase: "watch hat", confidence: "high" },
  { kind: "bucket", slot: "head", phrase: "bucket", confidence: "high" },
  { kind: "cap", slot: "head", phrase: "baseball cap", confidence: "high" },
  { kind: "cap", slot: "head", phrase: "snapback", confidence: "high" },
  { kind: "cap", slot: "head", phrase: "cap", confidence: "high" },
  { kind: "cap", slot: "head", phrase: "hat", confidence: "low" },
  { kind: "canvas", slot: "feet", phrase: "high-top", confidence: "high" },
  { kind: "canvas", slot: "feet", phrase: "high top", confidence: "high" },
  { kind: "canvas", slot: "feet", phrase: "canvas", confidence: "high" },
  { kind: "leather", slot: "feet", phrase: "leather sneaker", confidence: "high" },
  { kind: "leather", slot: "feet", phrase: "leather shoe", confidence: "high" },
  { kind: "leather", slot: "feet", phrase: "boot", confidence: "low", note: "Boots use the leather-shoe drawing, the closest shape on the figure." },
  { kind: "runner", slot: "feet", phrase: "runner", confidence: "high" },
  { kind: "runner", slot: "feet", phrase: "sneaker", confidence: "high" },
  { kind: "runner", slot: "feet", phrase: "trainer", confidence: "high" },
  { kind: "runner", slot: "feet", phrase: "shoe", confidence: "low" },
];

function httpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function readShape(category: string) {
  const text = category.toLowerCase();
  let best: (typeof SHAPES)[number] | null = null;
  for (const shape of SHAPES) {
    if (!text.includes(shape.phrase)) continue;
    if (!best || shape.phrase.length > best.phrase.length) best = shape;
  }
  return best;
}

function stylesFrom(category: string, kind: GarmentKind): string[] {
  const text = category.toLowerCase();
  const styles = new Set<string>();
  if (/street|skate|logo|graphic|snapback/.test(text)) styles.add("streetwear");
  if (/fleece|jogger|runner|athletic|sport|sneaker|trainer/.test(text) || kind === "hoodie" || kind === "runner") {
    styles.add("athleisure");
  }
  if (/oxford|chino|trouser|leather|dress shirt|boot/.test(text)) styles.add("classic");
  if (/preppy|button/.test(text)) styles.add("preppy");
  if (/minimal|plain|crew|beige|navy/.test(text) || kind === "tee") styles.add("minimalist");
  if (styles.size === 0) styles.add("classic");
  return Array.from(styles);
}

function accentHex(mainHex: string, kind: GarmentKind, requested: string | null | undefined, notes: string[]): string {
  const parsed = requested ? parseColor(requested) : null;
  if (requested && !parsed) notes.push("The second color was not a known name or hex, so the stitch color was derived.");
  if (parsed) return parsed;
  const main = codeColor(mainHex);
  if (kind === "graphic") return hslToHex((main.hue + 180) % 360, 0.55, main.lightness > 0.5 ? 0.4 : 0.62);
  return adjustColor(mainHex, main.value === "light" ? -36 : 40);
}

function partnerId(brand: string, name: string, productUrl: string): string {
  const slug = `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  let hash = 0;
  for (const char of productUrl) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `p-${slug || "piece"}-${hash.toString(36)}`;
}

export function affiliateOf(item: ClothingItem): AffiliateDeal {
  if (item.affiliate) return item.affiliate;
  return {
    status: "untracked",
    network: null,
    productUrl: item.affiliateUrl,
    trackedUrl: null,
    buyUrl: item.affiliateUrl,
  };
}

export function admitListing(listing: PartnerListing): AdmitResult {
  const notes: string[] = [];
  const brand = listing.brand.trim();
  const name = listing.name.trim();
  const productUrl = httpUrl(listing.productUrl);
  const trackedUrl = httpUrl(listing.trackedUrl);
  const network = listing.network ?? null;
  const problems: string[] = [];

  if (!brand || !name) problems.push("Brand and product name are required.");
  if (!Number.isFinite(listing.price) || listing.price <= 0 || listing.price > 100000) {
    problems.push("Price needs to be a real amount.");
  }
  if (!productUrl) problems.push("The product page needs a full http or https link.");

  const shape = readShape(listing.category);
  if (!shape) {
    problems.push("No garment shape matched that description, so nothing was drawn. Say what it is: hoodie, jean, cap, sneaker.");
  }
  const cloth = parseColor(listing.color);
  if (!cloth) {
    problems.push("The color needs a known name, such as navy, or a hex like #1e3a5f. A guessed color would dress the avatar wrong.");
  }
  if (problems.length > 0 || !shape || !cloth || !productUrl) {
    return { ok: false, item: null, code: null, confidence: "low", notes: problems, affiliate: null };
  }

  if (shape.note) notes.push(shape.note);
  if (shape.confidence === "low") {
    notes.push("The shape is a best guess from a broad word. Confirm it before relying on the drawing.");
  }
  notes.push("The avatar wears a drawing of this shape in these colors. It is not a photo of the product.");

  let status: AffiliateDeal["status"] = "untracked";
  if (trackedUrl && network) status = "tracked";
  else if (trackedUrl && !network) {
    notes.push("A second link was pasted without a network, so the purchase is not treated as tracked.");
  } else {
    notes.push("No affiliate network is attached. Opening the piece does not pay the company.");
  }

  const affiliate: AffiliateDeal = {
    status,
    network: status === "tracked" ? network : null,
    productUrl,
    trackedUrl: status === "tracked" ? trackedUrl : null,
    buyUrl: status === "tracked" && trackedUrl ? trackedUrl : productUrl,
  };

  const item: ClothingItem = {
    id: partnerId(brand, name, productUrl),
    name,
    brand,
    price: Math.round(listing.price * 100) / 100,
    affiliateUrl: affiliate.buyUrl,
    imageUrl: listing.imageUrl?.trim() || "",
    slot: shape.slot,
    colors: [listing.color.trim().toLowerCase()],
    color: cloth,
    accent: accentHex(cloth, shape.kind, listing.accentColor, notes),
    style: stylesFrom(`${listing.category} ${listing.color}`, shape.kind),
    kind: shape.kind,
    affiliate,
  };

  return {
    ok: true,
    item,
    code: codeItem(item),
    confidence: shape.confidence,
    notes,
    affiliate,
  };
}
