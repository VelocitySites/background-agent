import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultOutfit, itemById, outfitFromIds, type SelectedOutfit } from "./catalog";
import {
  attachMesh,
  createWardrobe,
  equipOutfit,
  imageFor,
  occupiesForKind,
  RIG_ID,
  standInItem,
  swapPiece,
  wearPlate,
  type GlamourPlate,
} from "./wardrobe";

function full(outfit: Partial<SelectedOutfit>): SelectedOutfit {
  return {
    head: outfit.head ?? null,
    top: outfit.top ?? null,
    bottom: outfit.bottom ?? null,
    feet: outfit.feet ?? null,
    accessory: outfit.accessory ?? null,
  };
}

test("a catalog piece equips as a procedural model on its slot", () => {
  const worn = equipOutfit(defaultOutfit());
  assert.equal(worn.rig, RIG_ID);
  assert.equal(worn.bySlot.top?.item.id, "t1");
  assert.equal(worn.bySlot.top?.addon.model.format, "procedural");
  assert.deepEqual(worn.bySlot.bottom?.addon.occupies, occupiesForKind("jeans"));
  assert.equal(worn.covered.includes("torso"), true);
  assert.equal(worn.covered.includes("arms"), false);
});

test("a hoodie covers the arms and the hair, a tee does not", () => {
  const hoodie = equipOutfit(outfitFromIds({ top: "t2" }));
  assert.equal(hoodie.partitionOwner.arms, "t2");
  assert.equal(hoodie.partitionOwner.hair, "t2");
  const tee = equipOutfit(outfitFromIds({ top: "t1" }));
  assert.equal(tee.partitionOwner.arms, undefined);
  assert.equal(tee.partitionOwner.hair, undefined);
});

test("headwear outranks a hoodie on the hair partition", () => {
  const worn = equipOutfit(outfitFromIds({ head: "h2", top: "t2" }));
  assert.equal(worn.partitionOwner.hair, "h2");
  assert.equal(worn.partitionOwner.torso, "t2");
  assert.equal(worn.bySlot.head?.item.name, "Acrylic Watch Hat");
});

test("swapPiece replaces one slot and leaves the rest", () => {
  const start = full(defaultOutfit());
  const beanie = itemById("h2");
  assert.ok(beanie);
  const next = swapPiece(start, beanie);
  assert.equal(next.head?.id, "h2");
  assert.equal(next.top?.id, start.top?.id);
  assert.equal(next.bottom?.id, start.bottom?.id);
  const cleared = swapPiece(next, null, "head");
  assert.equal(cleared.head, null);
  assert.equal(cleared.top?.id, start.top?.id);
});

test("a glamour plate dresses every slot in one call", () => {
  const plate: GlamourPlate = {
    id: "street-king",
    name: "Street King",
    slots: { head: "h1", top: "t2", bottom: "b2", feet: "f2" },
  };
  const outfit = wearPlate(plate);
  const worn = equipOutfit(outfit);
  assert.deepEqual(
    worn.pieces.map((piece) => piece.item.id).sort(),
    ["b2", "f2", "h1", "t2"]
  );
  assert.equal(worn.bySlot.feet?.addon.model.format, "procedural");
});

test("binding the catalog does not overwrite a model that was already registered", () => {
  const tee = itemById("t1");
  assert.ok(tee);
  const wardrobe = createWardrobe();
  wardrobe.register({
    itemId: "t1",
    slot: "top",
    occupies: occupiesForKind("tee"),
    priority: 20,
    model: { format: "mesh", src: "/garments/t1.glb", rig: RIG_ID },
  });
  wardrobe.bindCatalog([tee]);
  const piece = wardrobe.equip({ top: tee }).bySlot.top;
  assert.equal(piece?.addon.model.format, "mesh");
});

test("a registered turntable replaces the drawing only on angles that have an image", () => {
  const wardrobe = createWardrobe();
  const tee = itemById("t1");
  assert.ok(tee);
  wardrobe.bindCatalog([tee]);
  wardrobe.register({
    itemId: "t1",
    slot: "top",
    occupies: occupiesForKind("tee"),
    priority: 20,
    model: { format: "turntable", views: { front: "/garments/t1/front.png" } },
  });
  const worn = wardrobe.equip(outfitFromIds({ top: "t1" }));
  const piece = worn.bySlot.top;
  assert.equal(imageFor(piece, "front"), "/garments/t1/front.png");
  assert.equal(standInItem(piece, "front"), null);
  assert.equal(imageFor(piece, "back"), null);
  assert.equal(standInItem(piece, "back")?.id, "t1");
});

test("a mesh registers on the rig and the drawn stand-in stays", () => {
  const jeans = itemById("b3");
  assert.ok(jeans);
  const wardrobe = createWardrobe();
  wardrobe.register({
    itemId: "b3",
    slot: "bottom",
    occupies: occupiesForKind("jeans"),
    priority: 20,
    model: { format: "mesh", src: "/garments/b3.glb", rig: RIG_ID },
  });
  const piece = wardrobe.equip({ bottom: jeans }).bySlot.bottom;
  assert.equal(piece?.addon.model.format, "mesh");
  if (piece?.addon.model.format === "mesh") {
    assert.equal(piece.addon.model.src, "/garments/b3.glb");
    assert.equal(piece.addon.model.rig, RIG_ID);
  }
  assert.equal(standInItem(piece, "front")?.id, "b3");
  assert.equal(imageFor(piece, "front"), null);
});

test("registering a model for an unknown piece fails", () => {
  assert.throws(() => attachMesh("nope", "/garments/nope.glb"), /No shop piece/);
});
