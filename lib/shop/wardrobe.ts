import type { ClothingSlot } from "@/types";
import type { AvatarConfig } from "@/lib/shop/avatar";
import {
  INVENTORY,
  emptyOutfit,
  itemById,
  outfitFromIds,
  type ClothingItem,
  type GarmentKind,
  type SelectedOutfit,
} from "@/lib/shop/catalog";

/**
 * Paper-doll rig for the shop avatar.
 *
 * Skyrim's character records treat a garment as an armor addon on biped
 * slots: the piece lists the body partitions it covers, and equipping it
 * hides those partitions and attaches its model. A new mesh is another
 * addon, not a new branch in the character renderer.
 *
 * Final Fantasy XIV's glamour plates are the swap side of the same idea:
 * a named map of slot to item that dresses the character in one call.
 *
 * Today's shop drawings are the default model for each catalog piece.
 * A later piece registers a turntable (one image per facing) or a skinned
 * mesh in `garment-manifest.ts`. The dressing room equips whatever is
 * registered.
 */
export const RIG_ID = "revolution-humanoid-v1" as const;

export const FIGURE_ANGLES = ["front", "right", "back", "left"] as const;
export type FigureAngle = (typeof FIGURE_ANGLES)[number];

/** Body partitions a garment can occupy. Matches the regions the figure draws. */
export const PARTITIONS = [
  "hair",
  "head",
  "neck",
  "torso",
  "arms",
  "hands",
  "pelvis",
  "legs",
  "feet",
] as const;
export type Partition = (typeof PARTITIONS)[number];

export interface ProceduralModel {
  format: "procedural";
  procedure: GarmentKind;
}

export interface TurntableModel {
  format: "turntable";
  /** Image for each facing. A missing facing keeps the procedural stand-in. */
  views: Partial<Record<FigureAngle, string>>;
}

export interface MeshModel {
  format: "mesh";
  src: string;
  rig: typeof RIG_ID;
}

export type GarmentModel = ProceduralModel | TurntableModel | MeshModel;

export interface GarmentAddon {
  itemId: string;
  slot: ClothingSlot;
  /** Partitions this model covers. The rig hides the body there. */
  occupies: Partition[];
  /** Higher priority wins when two worn pieces want the same partition. */
  priority: number;
  model: GarmentModel;
}

export interface WornPiece {
  item: ClothingItem;
  addon: GarmentAddon;
}

export interface WornRig {
  rig: typeof RIG_ID;
  body: {
    bodyType: number;
    skinTone: number;
    hairStyle: number;
    hairColor: number;
  };
  pieces: WornPiece[];
  /** Partitions some worn piece is covering. */
  covered: Partition[];
  /** Item id of the highest-priority piece that claimed each partition. */
  partitionOwner: Partial<Record<Partition, string>>;
  bySlot: Partial<Record<ClothingSlot, WornPiece>>;
}

export interface GlamourPlate {
  id: string;
  name: string;
  slots: Partial<Record<ClothingSlot, string | null>>;
}

const OCCUPIES: Record<GarmentKind, Partition[]> = {
  cap: ["head"],
  beanie: ["head", "hair"],
  bucket: ["head"],
  tee: ["torso"],
  hoodie: ["neck", "torso", "arms", "hands", "hair"],
  oxford: ["neck", "torso", "arms"],
  graphic: ["torso"],
  chinos: ["pelvis", "legs"],
  joggers: ["pelvis", "legs"],
  jeans: ["pelvis", "legs"],
  leather: ["feet"],
  canvas: ["feet"],
  runner: ["feet"],
};

const SLOT_PRIORITY: Record<ClothingSlot, number> = {
  feet: 10,
  bottom: 20,
  top: 20,
  head: 30,
  accessory: 40,
};

export function occupiesForKind(kind: GarmentKind): Partition[] {
  return [...OCCUPIES[kind]];
}

export function proceduralAddon(item: ClothingItem): GarmentAddon {
  return {
    itemId: item.id,
    slot: item.slot,
    occupies: occupiesForKind(item.kind),
    priority: SLOT_PRIORITY[item.slot],
    model: { format: "procedural", procedure: item.kind },
  };
}

export function createWardrobe() {
  const addons = new Map<string, GarmentAddon>();

  function register(addon: GarmentAddon) {
    addons.set(addon.itemId, { ...addon, occupies: [...addon.occupies] });
  }

  function bindCatalog(items: ClothingItem[]) {
    for (const item of items) {
      if (addons.has(item.id)) continue;
      register(proceduralAddon(item));
    }
  }

  function addonFor(item: ClothingItem): GarmentAddon {
    return addons.get(item.id) ?? proceduralAddon(item);
  }

  function equip(outfit: Partial<SelectedOutfit>, avatar?: AvatarConfig | null): WornRig {
    const bySlot: Partial<Record<ClothingSlot, WornPiece>> = {};
    const pieces: WornPiece[] = [];

    (Object.keys(emptyOutfit()) as ClothingSlot[]).forEach((slot) => {
      const item = outfit[slot];
      if (!item) return;
      const piece: WornPiece = { item, addon: addonFor(item) };
      bySlot[slot] = piece;
      pieces.push(piece);
    });

    const partitionOwner: Partial<Record<Partition, string>> = {};
    const ownerPriority: Partial<Record<Partition, number>> = {};
    for (const piece of pieces) {
      for (const partition of piece.addon.occupies) {
        const current = ownerPriority[partition] ?? -1;
        if (piece.addon.priority >= current) {
          ownerPriority[partition] = piece.addon.priority;
          partitionOwner[partition] = piece.item.id;
        }
      }
    }

    return {
      rig: RIG_ID,
      body: {
        bodyType: avatar?.bodyType ?? 2,
        skinTone: avatar?.skinTone ?? 2,
        hairStyle: avatar?.hairStyle ?? 0,
        hairColor: avatar?.hairColor ?? 0,
      },
      pieces,
      covered: Object.keys(partitionOwner) as Partition[],
      partitionOwner,
      bySlot,
    };
  }

  function reset() {
    addons.clear();
  }

  return { register, bindCatalog, addonFor, equip, reset };
}

export const wardrobe = createWardrobe();
wardrobe.bindCatalog(INVENTORY);

export function registerGarmentModel(
  itemId: string,
  model: GarmentModel,
  options?: { occupies?: Partition[]; priority?: number }
) {
  const item = itemById(itemId);
  if (!item) {
    throw new Error(`No shop piece "${itemId}" to attach a model to.`);
  }
  wardrobe.register({
    itemId,
    slot: item.slot,
    occupies: options?.occupies ?? occupiesForKind(item.kind),
    priority: options?.priority ?? SLOT_PRIORITY[item.slot],
    model,
  });
}

/** Four images, one per facing, replace the drawn garment where a file exists. */
export function attachTurntable(itemId: string, views: TurntableModel["views"]) {
  registerGarmentModel(itemId, { format: "turntable", views });
}

/** A skinned mesh on this rig. The figure keeps the drawn stand-in until a 3D pass reads it. */
export function attachMesh(itemId: string, src: string) {
  registerGarmentModel(itemId, { format: "mesh", src, rig: RIG_ID });
}

export function equipOutfit(outfit: Partial<SelectedOutfit>, avatar?: AvatarConfig | null): WornRig {
  return wardrobe.equip(outfit, avatar);
}

/** Image to draw for this facing, when the piece has a turntable model. */
export function imageFor(piece: WornPiece | undefined, angle: FigureAngle): string | null {
  if (!piece || piece.addon.model.format !== "turntable") return null;
  return piece.addon.model.views[angle] ?? null;
}

/**
 * Item to draw with the built-in garment shapes.
 * A turntable image for this facing replaces that drawing.
 * A mesh keeps the drawing as a stand-in.
 */
export function standInItem(piece: WornPiece | undefined, angle: FigureAngle): ClothingItem | null {
  if (!piece) return null;
  if (imageFor(piece, angle)) return null;
  return piece.item;
}

/** Put one piece on its paper-doll slot. Pass null to take that slot off. */
export function swapPiece(
  outfit: SelectedOutfit,
  item: ClothingItem | null,
  slot: ClothingSlot = item?.slot ?? "top"
): SelectedOutfit {
  return { ...outfit, [slot]: item };
}

/** Equip a whole plate. Slots the plate does not mention are cleared. */
export function wearPlate(plate: GlamourPlate): SelectedOutfit {
  return outfitFromIds(plate.slots);
}
