import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { matchColorPhrase } from "./color-theory";
import { judgeSample } from "./sample-run";
import { dollarsFromFeed, mentionedSlots, readShopifySample, type OutletSample, type ShopifyProduct } from "./sample-read";

test("merchant color phrases keep a known color and ignore a lookalike word", () => {
  assert.equal(matchColorPhrase("Dark Indigo")?.name, "indigo");
  assert.equal(matchColorPhrase("Heather Grey")?.name, "heather grey");
  assert.equal(matchColorPhrase("Cashmere Blue")?.name, "blue");
  assert.equal(matchColorPhrase("reduced")?.name, undefined);
  assert.equal(matchColorPhrase("Birch/Deep Ocean/Haze"), null);
  assert.equal(dollarsFromFeed("88.00"), 88);
  assert.equal(dollarsFromFeed(11000), 110);
});

test("a title that names two garments is not one piece", () => {
  const slots = mentionedSlots("Womens Merino Wool Sweater and Trousers Set");
  assert.deepEqual(slots, ["top", "bottom"]);
  const sample = readShopifySample(
    {
      title: "Womens Merino Wool Sweater and Trousers Set—Smoked Black",
      vendor: "PANGAIA",
      product_type: "Sweatshirt and Pants",
      handle: "set-black",
      variants: [{ price: "505.00" }],
    },
    "https://pangaia.com",
    "Pangaia"
  );
  assert.ok(sample);
  const verdict = judgeSample(sample);
  assert.equal(verdict.wearable, false);
  assert.match(verdict.notes[0], /more than one garment/);
});

test("the scraped outlet sample dresses real pieces and refuses the ones it cannot draw", () => {
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/outlet-sample.json", import.meta.url), "utf8")) as {
    samples: OutletSample[];
  };
  assert.ok(fixture.samples.length >= 8);
  const verdicts = fixture.samples.map((sample) => {
    const read = readShopifySample(sample.product, sample.origin, sample.outlet);
    assert.ok(read, sample.product.title);
    return judgeSample(read);
  });

  const wearable = verdicts.filter((row) => row.wearable);
  const refused = verdicts.filter((row) => !row.wearable);
  assert.ok(wearable.length >= 6);
  assert.ok(refused.length >= 3);
  assert.ok(new Set(wearable.map((row) => row.outlet)).size >= 4);

  for (const row of wearable) {
    assert.ok(row.item);
    assert.equal(row.item.imageUrl, "");
    assert.equal(row.item.affiliate?.status, "untracked");
    assert.ok(row.covered.length > 0);
    assert.equal(row.item.affiliateUrl, row.productUrl);
  }

  const jean = wearable.find((row) => row.kind === "jeans");
  const hoodie = wearable.find((row) => row.kind === "hoodie");
  const cap = wearable.find((row) => row.kind === "cap");
  assert.ok(jean?.covered.includes("legs"));
  assert.ok(hoodie?.covered.includes("torso"));
  assert.ok(hoodie?.covered.includes("arms"));
  assert.equal(cap?.brand, "Noah");

  const colorRefusal = refused.find((row) => /color/i.test(row.notes.join(" ")));
  const shapeRefusal = refused.find((row) => /shape/i.test(row.notes.join(" ")));
  assert.ok(colorRefusal);
  assert.ok(shapeRefusal);
});

test("a color named only in the title is not replaced by another colorway", () => {
  const product: ShopifyProduct = {
    title: "Women's Shrunken Tee in Birch/Deep Ocean/Haze",
    vendor: "Kotn",
    handle: "womens-shrunken-tee-in-birch-deep-ocean-haze",
    options: [{ name: "Color", values: ["Black", "Birch/Deep Ocean/Haze"] }],
    variants: [{ price: "48.00" }],
  };
  const sample = readShopifySample(product, "https://kotn.com", "Kotn");
  assert.equal(sample?.colorName, null);
  assert.equal(sample?.listing.color, "Birch/Deep Ocean/Haze");
  assert.equal(judgeSample(sample!).wearable, false);
});
