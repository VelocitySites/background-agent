import { attachMesh, attachTurntable, type GarmentModel } from "@/lib/shop/wardrobe";

/**
 * Future clothing models land here.
 *
 * The item id is the shop piece (`t2` is the Reverse Weave Hoodie, and so on).
 * Add an entry and the dressing room equips it. Nothing else has to change.
 *
 * A turntable is four images, one per facing. Prefer `registerGraphic` in
 * `lib/shop/graphics.ts` for a single piece. A mesh is a glTF skinned to
 * `revolution-humanoid-v1`. The figure still draws the stand-in for a mesh
 * until a 3D pass is added; the equip path already returns the mesh.
 *
 *   { itemId: "t2", model: { format: "turntable", views: {
 *       front: "/garments/t2/front.png",
 *       right: "/garments/t2/right.png",
 *       back: "/garments/t2/back.png",
 *       left: "/garments/t2/left.png",
 *   } } }
 *
 *   { itemId: "b3", model: { format: "mesh", src: "/garments/b3.glb", rig: "revolution-humanoid-v1" } }
 */
const FUTURE_MODELS: { itemId: string; model: GarmentModel }[] = [];

let loaded = false;

export function registerShopModels() {
  if (loaded) return;
  loaded = true;
  for (const entry of FUTURE_MODELS) {
    if (entry.model.format === "turntable") {
      attachTurntable(entry.itemId, entry.model.views);
    } else if (entry.model.format === "mesh") {
      attachMesh(entry.itemId, entry.model.src);
    }
  }
}
