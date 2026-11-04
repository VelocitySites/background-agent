import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { judgeSample, summarizeSamples } from "../lib/shop/sample-run";
import { readShopifySample, trimShopifyProduct, type ShopifyProduct } from "../lib/shop/sample-read";

/**
 * Read a few public Shopify catalog feeds and keep a small sample the avatar can be tested against.
 * Photos and marketing copy are not stored. Nothing is marked as a tracked affiliate sale.
 */
const FEEDS: { outlet: string; url: string }[] = [
  { outlet: "Allbirds", url: "https://www.allbirds.com/products.json?limit=50" },
  { outlet: "Everlane", url: "https://www.everlane.com/products.json?limit=40" },
  { outlet: "Kotn", url: "https://kotn.com/products.json?limit=40" },
  { outlet: "Outdoor Voices", url: "https://www.outdoorvoices.com/products.json?limit=40" },
  { outlet: "Taylor Stitch", url: "https://www.taylorstitch.com/products.json?limit=40" },
  { outlet: "Pangaia", url: "https://pangaia.com/products.json?limit=40" },
  { outlet: "Reigning Champ", url: "https://www.reigningchamp.com/products.json?limit=40" },
  { outlet: "Kith", url: "https://kith.com/products.json?limit=30" },
  { outlet: "Noah", url: "https://www.noahny.com/products.json?limit=30" },
];

const SKIP = /\b(kids?|kid’s|baby|toddler|infant|youth)\b/i;

interface Kept {
  outlet: string;
  origin: string;
  product: ShopifyProduct;
}

async function main() {
  const wearable: Kept[] = [];
  const refused: Kept[] = [];
  const kinds = new Set<string>();
  const perOutlet = new Map<string, number>();
  const failures: string[] = [];

  for (const feed of FEEDS) {
    const origin = new URL(feed.url).origin;
    let products: ShopifyProduct[] = [];
    try {
      const response = await fetch(feed.url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "RevolutionShopSample/1.0 (sample test; no images)",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { products?: ShopifyProduct[] };
      products = body.products ?? [];
      console.log(`read ${products.length} from ${feed.outlet}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      failures.push(`${feed.outlet}: ${message}`);
      console.log(`miss ${feed.outlet}: ${message}`);
      continue;
    }

    for (const product of products) {
      const title = `${product.product_type ?? ""} ${product.title ?? ""}`;
      if (SKIP.test(title)) continue;
      const sample = readShopifySample(product, origin, feed.outlet);
      if (!sample) continue;
      const verdict = judgeSample(sample);
      const trimmed = { outlet: feed.outlet, origin, product: trimShopifyProduct(product) };
      if (verdict.wearable && verdict.kind) {
        const count = perOutlet.get(feed.outlet) ?? 0;
        if (count >= 2) continue;
        if (kinds.has(verdict.kind) && count >= 1) continue;
        kinds.add(verdict.kind);
        perOutlet.set(feed.outlet, count + 1);
        wearable.push(trimmed);
      } else if (refused.length < 4 && (perOutlet.get(`${feed.outlet}:skip`) ?? 0) < 1) {
        perOutlet.set(`${feed.outlet}:skip`, 1);
        refused.push(trimmed);
      }
    }
  }

  const samples = [...wearable, ...refused];
  const verdicts = samples.map((sample) => {
    const read = readShopifySample(sample.product, sample.origin, sample.outlet);
    if (!read) throw new Error(`Could not reread ${sample.product.title}`);
    return judgeSample(read);
  });

  const fixture = {
    scrapedAt: new Date().toISOString(),
    note: "Public catalog fields only. No product photos. Purchases are not tracked.",
    feeds: FEEDS.map((feed) => feed.url),
    failures,
    samples,
  };

  const destination = path.join(process.cwd(), "lib/shop/fixtures/outlet-sample.json");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(`\n${summarizeSamples(verdicts)}`);
  if (failures.length) console.log(`\nFeeds that did not answer: ${failures.join("; ")}`);
  console.log(`\nWrote ${samples.length} samples to ${destination}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
