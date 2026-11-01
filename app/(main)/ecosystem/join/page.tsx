"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const PATHS: Record<string, { title: string; prompt: string; companyLabel: string }> = {
  merge: {
    title: "Explore a merger",
    prompt:
      "You keep the brand and separate books. Tell us the company and how you would take on equal pay, the 25/75 split, and public category finances.",
    companyLabel: "Company",
  },
  acquisition: {
    title: "Discuss an acquisition",
    prompt:
      "A buyout means the team moves onto the same base pay, benefits, and profit share. Tell us what the company does and who would be affected.",
    companyLabel: "Company",
  },
  launch: {
    title: "Pitch a new company",
    prompt:
      "New companies start with leaders we interview and vet. Describe the idea, the industry, and why you should lead it.",
    companyLabel: "Working name",
  },
  suggest: {
    title: "Suggest an industry",
    prompt:
      "Which industry should carry the same pay, transparency, and profit-share rules next?",
    companyLabel: "Industry",
  },
  apply: {
    title: "Start a conversation",
    prompt:
      "Merge with separate financials, sell the company into the model, or start a new one whose leaders we vet. Say which door you are walking through.",
    companyLabel: "Company or idea",
  },
};

const STORAGE_KEY = "revolution_applications";

function JoinForm() {
  const params = useSearchParams();
  const path = params.get("path") || "apply";
  const copy = PATHS[path] ?? PATHS.apply;
  const [sent, setSent] = useState(false);

  const heading = useMemo(() => copy.title, [copy.title]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = {
      path,
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      message: String(data.get("message") || ""),
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, 50)));
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-brand-50 pb-24 pt-24">
      <div className="container-narrow section-padding">
        <Link href="/ecosystem" className="text-sm text-brand-500 hover:text-brand-800">
          ← The ecosystem
        </Link>
        <h1 className="mt-4 font-display text-4xl text-brand-950 md:text-5xl">{heading}</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-700">{copy.prompt}</p>
        <p className="mt-3 max-w-2xl text-sm text-brand-500">
          The non-negotiables stay the same: equal base pay, the same benefits, 25% set aside and
          75% shared equally each quarter, a compensation cap that moves with the cost of living,
          and category-level finances anyone can read.
        </p>

        {sent ? (
          <div className="mt-10 rounded-3xl border border-brand-200 bg-white p-8">
            <h2 className="font-display text-2xl text-brand-950">Saved on this device</h2>
            <p className="mt-3 text-brand-700">
              There is no inbox behind this form yet. We kept your note in this browser so the
              conversation is real when the company is. Nothing was emailed.
            </p>
            <Link
              href="/ecosystem"
              className="mt-6 inline-flex rounded-full bg-brand-900 px-5 py-3 text-white"
            >
              Back to the ecosystem
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5 rounded-3xl border border-brand-200 bg-white p-6 md:p-8">
            <Field label="Your name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label={copy.companyLabel} name="organization" required />
            <label className="block">
              <span className="mb-2 block text-sm text-brand-700">What should we know?</span>
              <textarea
                name="message"
                required
                rows={6}
                className="w-full rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-900 outline-none focus:border-accent-500"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-accent-500 px-6 py-3 font-medium text-white hover:bg-accent-600"
            >
              Save this note
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-brand-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-900 outline-none focus:border-accent-500"
      />
    </label>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-50 pt-24" />}>
      <JoinForm />
    </Suspense>
  );
}
