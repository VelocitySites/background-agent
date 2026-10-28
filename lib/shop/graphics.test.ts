import assert from "node:assert/strict";
import { test } from "node:test";
import { itemById } from "./catalog";
import { adjustColor } from "./color";
import { clearGraphics, fold, pictureFor, recipeFor, registerGraphic } from "./graphics";
import { equipOutfit } from "./wardrobe";

test("hoodie art is a long sleeve with a hood, and a picture replaces only that facing", () => {
  clearGraphics();
  const hoodie = itemById("t2");
  const tee = itemById("t1");
  assert.ok(hoodie && tee);
  assert.equal(recipeFor(hoodie).neck, "hood");
  assert.equal(recipeFor(hoodie).sleeve, "long");
  assert.equal(recipeFor(tee).sleeve, "bare");
  assert.equal(fold(hoodie), adjustColor(hoodie.color, recipeFor(hoodie).shadow));

  registerGraphic("t1", { images: { front: "/garments/t1/front.webp" } });
  const worn = equipOutfit({ top: tee });
  assert.equal(pictureFor(worn.bySlot.top, "front"), "/garments/t1/front.webp");
  assert.equal(pictureFor(worn.bySlot.top, "back"), null);
  clearGraphics();
  assert.equal(pictureFor(equipOutfit({ top: tee }).bySlot.top, "front"), null);
});
