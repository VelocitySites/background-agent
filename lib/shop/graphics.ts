import type { ClothingItem, GarmentKind } from "@/lib/shop/catalog";
import { adjustColor } from "@/lib/shop/color";
import { imageFor, type FigureAngle, type WornPiece } from "@/lib/shop/wardrobe";

/**
 * The drawing kit for the avatar.
 *
 * Change a kind here to restyle every piece of that shape. To replace one
 * product with finished art, call `registerGraphic` with an image per facing.
 * A missing facing keeps the drawn stand-in. The dressing room reads this
 * file, so a later art pass does not have to edit the figure component.
 */
export interface GraphicRecipe {
  sleeve: "bare" | "long";
  neck: "crew" | "hood" | "collar" | "none";
  /** How far to push the cloth shadow. More negative is a deeper fold. */
  shadow: number;
  images?: Partial<Record<FigureAngle, string>>;
}

export const GRAPHIC_RECIPES: Record<GarmentKind, GraphicRecipe> = {
  cap: { sleeve: "bare", neck: "none", shadow: -28 },
  beanie: { sleeve: "bare", neck: "none", shadow: -28 },
  bucket: { sleeve: "bare", neck: "none", shadow: -28 },
  tee: { sleeve: "bare", neck: "crew", shadow: -32 },
  graphic: { sleeve: "bare", neck: "crew", shadow: -32 },
  hoodie: { sleeve: "long", neck: "hood", shadow: -32 },
  oxford: { sleeve: "long", neck: "collar", shadow: -32 },
  chinos: { sleeve: "bare", neck: "none", shadow: -28 },
  joggers: { sleeve: "bare", neck: "none", shadow: -28 },
  jeans: { sleeve: "bare", neck: "none", shadow: -28 },
  leather: { sleeve: "bare", neck: "none", shadow: -35 },
  canvas: { sleeve: "bare", neck: "none", shadow: -35 },
  runner: { sleeve: "bare", neck: "none", shadow: -35 },
};

const itemGraphics = new Map<string, Partial<GraphicRecipe>>();

export function registerGraphic(itemId: string, patch: Partial<GraphicRecipe>) {
  const current = itemGraphics.get(itemId);
  itemGraphics.set(itemId, {
    ...current,
    ...patch,
    images: { ...current?.images, ...patch.images },
  });
}

export function clearGraphics() {
  itemGraphics.clear();
}

export function recipeFor(item: ClothingItem): GraphicRecipe {
  const base = GRAPHIC_RECIPES[item.kind];
  const extra = itemGraphics.get(item.id);
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    images: { ...base.images, ...extra.images },
  };
}

/** Fold color for a piece, taken from its recipe so every facing stays in step. */
export function fold(item: ClothingItem | null | undefined, fallback = "transparent"): string {
  if (!item) return fallback;
  return adjustColor(item.color, recipeFor(item).shadow);
}

/** Image to paint over the body for this facing, if art has been registered. */
export function pictureFor(piece: WornPiece | undefined, angle: FigureAngle): string | null {
  if (!piece) return null;
  return imageFor(piece, angle) ?? recipeFor(piece.item).images?.[angle] ?? null;
}
