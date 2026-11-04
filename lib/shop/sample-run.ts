import type { ClothingItem } from "@/lib/shop/catalog";
import { admitListing } from "@/lib/shop/intake";
import { equipOutfit } from "@/lib/shop/wardrobe";
import type { ReadSample } from "@/lib/shop/sample-read";

export interface SampleVerdict {
  outlet: string;
  name: string;
  brand: string;
  productUrl: string;
  price: number;
  wearable: boolean;
  kind: ClothingItem["kind"] | null;
  slot: ClothingItem["slot"] | null;
  confidence: "high" | "low" | null;
  role: string | null;
  covered: string[];
  notes: string[];
  item: ClothingItem | null;
}

/** Dress one scraped listing on the rig and say whether the shop can wear it. */
export function judgeSample(sample: ReadSample): SampleVerdict {
  const base = {
    outlet: sample.outlet,
    name: sample.listing.name,
    brand: sample.listing.brand,
    productUrl: sample.listing.productUrl,
    price: sample.listing.price,
  };
  if (sample.slots.length > 1) {
    return {
      ...base,
      wearable: false,
      kind: null,
      slot: null,
      confidence: null,
      role: null,
      covered: [],
      notes: ["The title names more than one garment, so it was not dressed as a single piece."],
      item: null,
    };
  }

  const result = admitListing(sample.listing);
  if (!result.ok || !result.item) {
    return {
      ...base,
      wearable: false,
      kind: null,
      slot: null,
      confidence: null,
      role: null,
      covered: [],
      notes: result.notes,
      item: null,
    };
  }

  const worn = equipOutfit({ [result.item.slot]: result.item });
  const covered = Object.entries(worn.partitionOwner)
    .filter(([, id]) => id === result.item?.id)
    .map(([partition]) => partition);

  return {
    ...base,
    wearable: true,
    kind: result.item.kind,
    slot: result.item.slot,
    confidence: result.confidence,
    role: result.code?.role ?? null,
    covered,
    notes: result.notes,
    item: result.item,
  };
}

export function summarizeSamples(verdicts: SampleVerdict[]): string {
  const wearable = verdicts.filter((row) => row.wearable);
  const refused = verdicts.length - wearable.length;
  const lines = [
    `${wearable.length} of ${verdicts.length} scraped pieces can be worn. ${refused} were refused.`,
    "None of these are tracked sales. The figure wears a drawing, not the product photo.",
    "",
  ];
  for (const row of verdicts) {
    if (row.wearable) {
      lines.push(
        `wear  ${row.outlet} — ${row.name} — ${row.kind} on ${row.slot} (${row.confidence}, ${row.role}) covers ${row.covered.join(", ") || "the slot"} — $${row.price}`
      );
    } else {
      lines.push(`skip  ${row.outlet} — ${row.name} — ${row.notes[0] ?? "refused"}`);
    }
  }
  return lines.join("\n");
}
