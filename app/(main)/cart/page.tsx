"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ShoppingBag, Trash2 } from "lucide-react";
import { itemById, type ClothingItem } from "@/lib/shop/catalog";
import { affiliateOf } from "@/lib/shop/intake";
import { loadPartnerItems, PARTNER_EVENT } from "@/lib/shop/partner-catalog";
import { LOOKS_EVENT, loadLooks, removeLook, type SavedLook } from "@/lib/shop/looks";

export default function CartPage() {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [partners, setPartners] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const sync = () => {
      setLooks(loadLooks());
      setPartners(loadPartnerItems());
    };
    sync();
    window.addEventListener(LOOKS_EVENT, sync);
    window.addEventListener(PARTNER_EVENT, sync);
    return () => {
      window.removeEventListener(LOOKS_EVENT, sync);
      window.removeEventListener(PARTNER_EVENT, sync);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 pb-24 pt-24">
      <div className="container-wide section-padding">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-600">Saved on this device</p>
        <h1 className="mt-2 font-display text-4xl text-brand-950 md:text-5xl">Your looks</h1>
        <p className="mt-4 max-w-2xl text-brand-700">
          A look is the outfit on the figure. A purchase supports the company only when that
          piece has a tracked affiliate link. The original shop pieces do not, yet.
        </p>

        {looks.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-brand-200 bg-white p-10 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-brand-400" />
            <p className="mt-4 font-display text-2xl text-brand-900">No looks saved yet</p>
            <p className="mt-2 text-brand-600">Dress the figure, then save the outfit.</p>
            <Link
              href="/shop/experience"
              className="mt-6 inline-flex rounded-full bg-accent-500 px-6 py-3 text-white hover:bg-accent-600"
            >
              Open the dressing room
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {looks.map((look) => {
              const items = look.itemIds
                .map((id) => itemById(id) ?? partners.find((item) => item.id === id) ?? null)
                .filter((item): item is ClothingItem => item !== null);
              const total = items.reduce((sum, item) => sum + item.price, 0);
              return (
                <article
                  key={look.id}
                  className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl text-brand-950">{look.name}</h2>
                      <p className="mt-1 text-sm text-brand-500">
                        {new Date(look.createdAt).toLocaleString()} · ${total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/shop/experience?look=${items.map((item) => item.id).join(",")}`}
                        className="rounded-full border border-brand-300 px-4 py-2 text-sm text-brand-800 hover:border-brand-900"
                      >
                        Wear it again
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLook(look.id)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-brand-500 hover:text-accent-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <ul className="mt-5 divide-y divide-brand-100">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-10 w-10 rounded-lg border border-brand-200"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>
                            <span className="block text-brand-900">{item.name}</span>
                            <span className="block text-sm text-brand-500">
                            {item.brand}
                            {affiliateOf(item).status === "tracked" ? " · affiliate link" : ""}
                          </span>
                          </span>
                        </div>
                        <a
                          href={item.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-800"
                        >
                          ${item.price}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
