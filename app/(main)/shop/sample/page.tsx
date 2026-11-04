"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DressedFigure } from "@/components/shop/DressedFigure";
import { emptyOutfit } from "@/lib/shop/catalog";
import fixture from "@/lib/shop/fixtures/outlet-sample.json";
import { readShopifySample, type OutletSample } from "@/lib/shop/sample-read";
import { judgeSample, type SampleVerdict } from "@/lib/shop/sample-run";
import { savePartnerItem } from "@/lib/shop/partner-catalog";

const samples = fixture.samples as OutletSample[];

export default function SampleShopPage() {
  const router = useRouter();
  const verdicts = useMemo(
    () =>
      samples.flatMap((sample) => {
        const read = readShopifySample(sample.product, sample.origin, sample.outlet);
        return read ? [judgeSample(read)] : [];
      }),
    []
  );
  const wearable = verdicts.filter((row) => row.wearable);
  const refused = verdicts.filter((row) => !row.wearable);

  const wear = (row: SampleVerdict) => {
    if (!row.item) return;
    savePartnerItem(row.item);
    router.push(`/shop/experience?look=${row.item.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 pt-24 text-white">
      <div className="container-wide section-padding pb-24">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-400">Sample test</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Clothes from other shops</h1>
        <p className="mt-4 max-w-2xl text-brand-300">
          These are a few pieces read from public catalog feeds. The avatar wears a drawing of the
          shape and color. Product photos are not used, and a purchase is not tracked.
        </p>
        <p className="mt-4 text-sm text-brand-200">
          {wearable.length} of {verdicts.length} can be worn. {refused.length} were refused, which is
          the point of the test.
        </p>

        <h2 className="mt-10 font-display text-2xl">The figure can wear these</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wearable.map((row) => (
            <article key={row.productUrl} className="rounded-3xl border border-brand-700/60 bg-brand-900/40 p-4">
              <div className="relative mx-auto h-72 w-44">
                <DressedFigure
                  outfit={{ ...emptyOutfit(), [row.slot ?? "top"]: row.item }}
                  className="absolute inset-0"
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-accent-300">{row.outlet}</p>
              <h3 className="mt-1 text-sm font-medium text-white">{row.name}</h3>
              <p className="mt-1 text-xs text-brand-300">
                {row.kind} · {row.confidence} match · {row.role} · ${row.price}
              </p>
              <p className="mt-1 text-xs text-brand-400">Covers {row.covered.join(", ")}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => wear(row)}
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-brand-950"
                >
                  Wear it in the dressing room
                </button>
                <a href={row.productUrl} className="self-center text-brand-300 underline-offset-4 hover:text-white hover:underline">
                  Maker&apos;s page
                </a>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl">The shop refused these</h2>
        <ul className="mt-4 space-y-3">
          {refused.map((row) => (
            <li key={row.productUrl} className="rounded-2xl border border-brand-700/60 bg-brand-900/30 px-4 py-3">
              <p className="text-sm text-white">
                {row.outlet} — {row.name}
              </p>
              <p className="mt-1 text-sm text-brand-300">{row.notes[0]}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-brand-400">
          Refresh the sample with <span className="text-brand-200">npm run shop:sample</span>.{" "}
          <Link href="/shop/partners" className="underline-offset-4 hover:text-white hover:underline">
            Add a piece by hand
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
