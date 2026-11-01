"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DressedFigure } from "@/components/shop/DressedFigure";
import { emptyOutfit, type ClothingItem } from "@/lib/shop/catalog";
import { admitListing, type AffiliateNetwork, type PartnerListing } from "@/lib/shop/intake";
import { loadPartnerItems, removePartnerItem, savePartnerItem } from "@/lib/shop/partner-catalog";

const NETWORKS: { value: AffiliateNetwork | ""; label: string }[] = [
  { value: "", label: "No network yet" },
  { value: "impact", label: "Impact" },
  { value: "rakuten", label: "Rakuten" },
  { value: "awin", label: "Awin" },
  { value: "cj", label: "CJ" },
  { value: "shareasale", label: "ShareASale" },
  { value: "direct", label: "The maker's own program" },
];

const EMPTY: PartnerListing = {
  brand: "",
  name: "",
  price: 0,
  productUrl: "",
  trackedUrl: "",
  network: null,
  color: "",
  accentColor: "",
  category: "",
};

export default function PartnerIntakePage() {
  const router = useRouter();
  const [form, setForm] = useState<PartnerListing>(EMPTY);
  const [priceText, setPriceText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof admitListing> | null>(null);
  const [saved, setSaved] = useState<ClothingItem[]>([]);

  useEffect(() => {
    setSaved(loadPartnerItems());
  }, []);

  const set = (patch: Partial<PartnerListing>) => {
    setForm((current) => ({ ...current, ...patch }));
    setResult(null);
  };

  const setPrice = (value: string) => {
    setPriceText(value);
    setResult(null);
  };

  const read = () => {
    const admitted = admitListing({
      ...form,
      price: Number(priceText.replace(/[$,\s]/g, "")),
      network: form.network || null,
      trackedUrl: form.trackedUrl || null,
      accentColor: form.accentColor || null,
    });
    setResult(admitted);
    return admitted;
  };

  const add = () => {
    const admitted = result?.ok ? result : read();
    if (!admitted.ok || !admitted.item) return;
    setSaved(savePartnerItem(admitted.item));
    router.push(`/shop/experience?look=${admitted.item.id}`);
  };

  const preview = result?.ok && result.item ? { ...emptyOutfit(), [result.item.slot]: result.item } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 pt-24 text-white">
      <div className="container-wide section-padding pb-24">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-400">Affiliate intake</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Add a partner piece</h1>
        <p className="mt-4 max-w-2xl text-brand-300">
          Type what the maker&apos;s page says. The shop reads a garment shape and a color, tags the
          piece, and dresses the avatar in that drawing. It does not download their photos. A sale
          is tracked only when you attach a network and the link that network gave you.
        </p>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form
            className="space-y-4 rounded-3xl border border-brand-700/60 bg-brand-900/40 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              read();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand" value={form.brand} onChange={(brand) => set({ brand })} required />
              <Field label="Product name" value={form.name} onChange={(name) => set({ name })} required />
            </div>
            <Field
              label="What it is"
              value={form.category}
              onChange={(category) => set({ category })}
              placeholder="men's pullover hoodie"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Color" value={form.color} onChange={(color) => set({ color })} placeholder="navy or #1e3a5f" required />
              <Field
                label="Second color"
                value={form.accentColor ?? ""}
                onChange={(accentColor) => set({ accentColor })}
                placeholder="optional, for a print or stitch"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price" value={priceText} onChange={setPrice} placeholder="e.g. 70" required />
              <label className="block text-sm text-brand-300">
                Network
                <select
                  value={form.network ?? ""}
                  onChange={(event) => set({ network: (event.target.value || null) as AffiliateNetwork | null })}
                  className="mt-1 w-full rounded-xl border border-brand-700 bg-brand-950 px-3 py-2 text-white"
                >
                  {NETWORKS.map((network) => (
                    <option key={network.label} value={network.value}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Field
              label="Product page"
              value={form.productUrl}
              onChange={(productUrl) => set({ productUrl })}
              placeholder="https://example.com/the-product"
              required
            />
            <Field
              label="Tracked affiliate link"
              value={form.trackedUrl ?? ""}
              onChange={(trackedUrl) => set({ trackedUrl })}
              placeholder="Leave empty until a network issues one"
            />
            <button type="submit" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-brand-950">
              Read this piece
            </button>
          </form>

          <div>
            {preview && result?.item && result.code ? (
              <div className="rounded-3xl border border-brand-700/60 bg-brand-900/40 p-4">
                <div className="relative mx-auto h-[420px] w-64">
                  <DressedFigure outfit={preview} className="absolute inset-0" />
                </div>
                <p className="mt-3 text-sm text-brand-200">
                  {result.confidence === "high" ? "Shape matched." : "Shape is a guess. Look at the figure before adding it."}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {result.code.tags.slice(0, 8).map((tag) => (
                    <li key={tag} className="rounded-full bg-brand-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-200">
                      {tag}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-brand-400">
                  {result.affiliate?.status === "tracked"
                    ? `Tracked through ${result.affiliate.network}.`
                    : "Not tracked. The buy button opens the maker's page."}
                </p>
                <button
                  type="button"
                  onClick={add}
                  className="mt-4 w-full rounded-full bg-accent-500 px-4 py-2.5 text-sm text-white hover:bg-accent-600"
                >
                  Wear it in the dressing room
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-brand-700 p-6 text-sm text-brand-400">
                The figure appears here after the shape and color can be read.
              </div>
            )}
            {result && (
              <ul className="mt-4 space-y-2 text-sm text-brand-300" role="alert">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {saved.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl">On this device</h2>
            <ul className="mt-4 divide-y divide-brand-800">
              {saved.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full border border-white/10" style={{ backgroundColor: item.color }} />
                    <span>
                      <span className="block text-white">{item.name}</span>
                      <span className="block text-xs text-brand-400">
                        {item.brand} · {item.kind}
                        {item.affiliate?.status === "tracked" ? " · tracked" : " · not tracked"}
                      </span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSaved(removeAndReload(item.id))}
                    className="text-sm text-brand-400 hover:text-white"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/shop/experience" className="mt-10 inline-flex text-sm text-brand-300 underline-offset-4 hover:text-white hover:underline">
          Back to the dressing room
        </Link>
      </div>
    </div>
  );
}

function removeAndReload(id: string) {
  removePartnerItem(id);
  return loadPartnerItems();
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm text-brand-300">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-brand-700 bg-brand-950 px-3 py-2 text-white placeholder:text-brand-500"
      />
    </label>
  );
}
