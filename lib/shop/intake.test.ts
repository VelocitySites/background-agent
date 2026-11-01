import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultOutfit, type ClothingItem } from "./catalog";
import { codeColor, parseColor, relateColors } from "./color-theory";
import { admitListing } from "./intake";
import { codeItem } from "./item-code";
import { mergeShopInventory } from "./partner-catalog";
import { describeLook, suggestPieces } from "./suggest";
import { equipOutfit } from "./wardrobe";

test("navy is a dark blue anchor and white is a neutral", () => {
  const navy = codeColor("#1e3a5f");
  assert.equal(navy.family, "blue");
  assert.equal(navy.value, "dark");
  assert.equal(navy.chroma, "muted");
  assert.equal(codeColor("#d62828").chroma, "saturated");
  assert.equal(parseColor("chartreuse-mustard-mystery"), null);
  assert.equal(parseColor("navy blue"), "#1e3a5f");
  const white = codeColor("#f7f6f2");
  assert.equal(white.neutral, true);
  assert.equal(white.value, "light");
  const relation = relateColors(navy, white);
  assert.equal(relation.relation, "neutral");
  assert.ok(relation.score > 0.8);
});

test("two loud colors score below a neutral pair", () => {
  const red = codeColor("#d62828");
  const green = codeColor("#2a9d4a");
  const loud = relateColors(red, green);
  const quiet = relateColors(codeColor("#161616"), codeColor("#f3efe6"));
  assert.ok(loud.relation === "clash" || loud.relation === "complementary");
  assert.ok(loud.score < 0.5);
  assert.ok(loud.score < quiet.score);
});

test("a partner hoodie is drawn as a hoodie and is not treated as a tracked sale", () => {
  const result = admitListing({
    brand: "Champion",
    name: "Reverse Weave Pullover",
    price: 70,
    productUrl: "https://www.champion.com/hoodie",
    color: "navy",
    category: "men's pullover hoodie",
  });
  assert.equal(result.ok, true);
  assert.equal(result.item?.kind, "hoodie");
  assert.equal(result.item?.slot, "top");
  assert.equal(result.confidence, "high");
  assert.equal(result.affiliate?.status, "untracked");
  assert.equal(result.item?.affiliateUrl, "https://www.champion.com/hoodie");
  assert.ok(result.code?.tags.includes("kind:hoodie"));
  assert.ok(result.code?.tags.includes("role:anchor") || result.code?.tags.includes("family:blue"));
  const worn = equipOutfit({ top: result.item });
  assert.equal(worn.partitionOwner.arms, result.item?.id);
  assert.equal(worn.partitionOwner.hair, result.item?.id);
  assert.match(result.notes.join(" "), /not a photo/i);
});

test("a tracked network link is the buy link and the product page is kept", () => {
  const result = admitListing({
    brand: "Nike",
    name: "Club Fleece",
    price: 65,
    productUrl: "https://www.nike.com/t/club-fleece",
    trackedUrl: "https://goto.impact.com/nike-club",
    network: "impact",
    color: "#2a2e33",
    category: "jogger",
  });
  assert.equal(result.ok, true);
  assert.equal(result.item?.kind, "joggers");
  assert.equal(result.affiliate?.status, "tracked");
  assert.equal(result.affiliate?.buyUrl, "https://goto.impact.com/nike-club");
  assert.equal(result.affiliate?.productUrl, "https://www.nike.com/t/club-fleece");
  assert.equal(result.item?.affiliateUrl, "https://goto.impact.com/nike-club");
});

test("a link without a network is not called tracked", () => {
  const result = admitListing({
    brand: "Nike",
    name: "Club Fleece",
    price: 65,
    productUrl: "https://www.nike.com/t/club-fleece",
    trackedUrl: "https://example.com/maybe",
    color: "black",
    category: "jogger",
  });
  assert.equal(result.affiliate?.status, "untracked");
  assert.equal(result.item?.affiliateUrl, "https://www.nike.com/t/club-fleece");
});

test("a bad color is named even when the price is also missing", () => {
  const result = admitListing({
    brand: "Champion",
    name: "Reverse Weave Pullover",
    price: Number.NaN,
    productUrl: "https://www.champion.com/hoodie",
    color: "chartreuse-mustard-mystery",
    category: "hoodie",
  });
  assert.equal(result.ok, false);
  assert.equal(result.item, null);
  assert.match(result.notes.join(" "), /color/i);
  assert.match(result.notes.join(" "), /price/i);
});

test("an unrecognized product is refused instead of dressed as a tee", () => {
  const result = admitListing({
    brand: "Sony",
    name: "Earbuds",
    price: 80,
    productUrl: "https://example.com/earbuds",
    color: "black",
    category: "wireless earbuds",
  });
  assert.equal(result.ok, false);
  assert.equal(result.item, null);
});

test("graphic tee is not classified as a plain tee", () => {
  const result = admitListing({
    brand: "Shop",
    name: "Box Logo",
    price: 40,
    productUrl: "https://example.com/box",
    color: "black",
    accentColor: "red",
    category: "graphic tee",
  });
  assert.equal(result.item?.kind, "graphic");
  assert.equal(result.code?.role, "statement");
});

test("suggestions prefer a quiet bottom beside a red shirt", () => {
  const red = piece({
    id: "red",
    name: "Red Tee",
    slot: "top",
    kind: "tee",
    color: "#d62828",
    accent: "#111111",
    style: ["streetwear"],
  });
  const quiet = piece({
    id: "quiet",
    name: "Stone Chino",
    slot: "bottom",
    kind: "chinos",
    color: "#c4a574",
    accent: "#6b4f32",
    style: ["classic"],
  });
  const loud = piece({
    id: "loud",
    name: "Lime Jogger",
    slot: "bottom",
    kind: "joggers",
    color: "#b6e23a",
    accent: "#111111",
    style: ["streetwear"],
  });
  const suggestions = suggestPieces({ top: red, bottom: null, head: null, feet: null }, [quiet, loud]);
  const bottom = suggestions.find((entry) => entry.item.slot === "bottom");
  assert.equal(bottom?.item.id, "quiet");
});

test("two loud pieces are described as too much at once", () => {
  const red = piece({ id: "red", name: "Red Tee", slot: "top", kind: "tee", color: "#d62828", accent: "#111111", style: ["streetwear"] });
  const green = piece({ id: "green", name: "Green Chino", slot: "bottom", kind: "chinos", color: "#2a9d4a", accent: "#111111", style: ["classic"] });
  assert.match(describeLook([red, green]), /loud|neutral/i);
  assert.equal(codeItem(red).role, "statement");
});

test("the stock look gets a headwear suggestion with a color reason", () => {
  const suggestions = suggestPieces(defaultOutfit(), mergeShopInventory([]));
  assert.ok(suggestions.length > 0);
  assert.equal(suggestions.every((entry) => entry.item.slot === "head" || defaultOutfit()[entry.item.slot] == null), true);
  assert.ok(suggestions[0].reason.length > 8);
});

test("partner pieces merge behind the catalog without replacing an id", () => {
  const extra = piece({ id: "t1", name: "Fake tee", slot: "top", kind: "tee", color: "#ffffff", accent: "#000000", style: [] });
  const added = piece({ id: "p-new", name: "Added", slot: "top", kind: "tee", color: "#ffffff", accent: "#000000", style: [] });
  const merged = mergeShopInventory([extra, added]);
  assert.equal(merged.filter((item) => item.id === "t1").length, 1);
  assert.equal(merged.find((item) => item.id === "t1")?.name, "Crew Neck Tee");
  assert.ok(merged.some((item) => item.id === "p-new"));
});

function piece(partial: Pick<ClothingItem, "id" | "name" | "slot" | "kind" | "color" | "accent" | "style">): ClothingItem {
  return {
    brand: "Test",
    price: 10,
    affiliateUrl: "https://example.com/p",
    imageUrl: "",
    colors: [],
    ...partial,
  };
}
