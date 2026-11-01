"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DressedFigure } from "@/components/shop/DressedFigure";
import { LOOK_PRESETS, outfitFromPreset, presetTotal } from "@/lib/shop/catalog";

export default function Home() {
  const router = useRouter();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("revolution_visited");
    setIsFirstVisit(!hasVisited);
  }, []);

  useEffect(() => {
    if (isFirstVisit === false) {
      router.push("/shop/experience");
    }
  }, [isFirstVisit, router]);

  if (isFirstVisit === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-brand-600"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (isFirstVisit) {
    return (
      <main className="min-h-screen bg-brand-50">
        <WelcomeExperience
          onComplete={() => {
            localStorage.setItem("revolution_visited", "true");
            router.push("/shop/experience");
          }}
          onShopLook={(lookId) => {
            localStorage.setItem("revolution_visited", "true");
            router.push(`/shop/experience?look=${lookId}`);
          }}
        />
      </main>
    );
  }

  return null;
}

const SECTION_LOOKS = [
  ["street-king", "minimalist"],
  ["classic", "athlete"],
  ["fire-fit", "street-king"],
  ["minimalist", "classic"],
  ["athlete", "fire-fit"],
  ["classic", "street-king"],
];

function WelcomeExperience({
  onComplete,
  onShopLook,
}: {
  onComplete: () => void;
  onShopLook: (lookId: string) => void;
}) {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      id: "hero",
      title: "Welcome to Revolution",
      subtitle: "This isn't a clothing company. It's a movement.",
    },
    {
      id: "problem",
      title: "The Problem",
      content:
        "We live in a country that rewards profit above everything else. Our government is bought and paid for. Corruption runs deep. That's not changing from the top down.",
    },
    {
      id: "response",
      title: "Our Response",
      content:
        "So we're building a company with political aims from day one. Equal pay for everyone. 100% profit sharing. Complete financial transparency. We're not here to play the game better—we're here to change the rules.",
    },
    {
      id: "commitment",
      title: "$70,000",
      subtitle: "Base salary for every employee. No exceptions.",
      content:
        "From our founder to our janitor, everyone earns the same. Best possible benefits. And 75% of all profit, shared equally, every quarter.",
    },
    {
      id: "people",
      title: "Real People. Real Stories.",
      content:
        "Every person here has a bio page. Because you should know who makes your clothes and why they believe in what we're building.",
    },
    {
      id: "enter",
      title: "Join the Revolution",
      content: "When you buy from us, you're not making a CEO richer. You're voting for a different way of doing business.",
    },
  ];

  return (
    <div className="relative">
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="fixed top-6 right-6 z-50 text-sm text-brand-500 hover:text-brand-700 transition-colors"
      >
        Skip intro →
      </button>

      {/* Progress Indicator */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSection
                ? "bg-accent-500 scale-125"
                : index < currentSection
                  ? "bg-brand-400"
                  : "bg-brand-200"
            }`}
          />
        ))}
      </div>

      {/* Scrollable Sections */}
      <div className="snap-y snap-mandatory h-screen overflow-y-auto scrollbar-hide">
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="snap-start h-screen flex items-center justify-center relative"
            onFocus={() => setCurrentSection(index)}
          >
            <div className="absolute inset-0 flex">
              <IntroModel
                lookId={SECTION_LOOKS[index]?.[0] ?? "street-king"}
                side="left"
                onShopLook={onShopLook}
              />

              {/* Center Content */}
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center max-w-2xl px-8"
                  onViewportEnter={() => setCurrentSection(index)}
                >
                  <h2 className="font-display text-5xl md:text-6xl text-brand-900 mb-6">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-2xl text-brand-600 mb-4">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-lg text-brand-700 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {section.id === "enter" && (
                    <motion.button
                      onClick={onComplete}
                      className="mt-8 px-8 py-4 bg-accent-500 text-white rounded-full text-lg font-medium hover:bg-accent-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Enter the Shop
                    </motion.button>
                  )}
                </motion.div>
              </div>

              <IntroModel
                lookId={SECTION_LOOKS[index]?.[1] ?? "classic"}
                side="right"
                onShopLook={onShopLook}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function IntroModel({
  lookId,
  side,
  onShopLook,
}: {
  lookId: string;
  side: "left" | "right";
  onShopLook: (lookId: string) => void;
}) {
  const preset = LOOK_PRESETS.find((entry) => entry.id === lookId);
  const outfit = outfitFromPreset(lookId);
  if (!preset || !outfit) return null;

  return (
    <button
      type="button"
      onClick={() => onShopLook(lookId)}
      className={`hidden md:flex w-[22%] h-full items-center justify-center ${
        side === "left"
          ? "bg-gradient-to-r from-brand-100 to-transparent"
          : "bg-gradient-to-l from-brand-100 to-transparent"
      }`}
    >
      <span className="flex flex-col items-center gap-3">
        <DressedFigure outfit={outfit} className="h-80 w-44" />
        <span className="text-center">
          <span className="block text-sm font-medium text-brand-900">{preset.name}</span>
          <span className="block text-xs text-brand-500">${presetTotal(preset)} · shop this look</span>
        </span>
      </span>
    </button>
  );
}
