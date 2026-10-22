"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("revolution_visited");
    setIsFirstVisit(!hasVisited);
  }, []);

  useEffect(() => {
    if (isFirstVisit === false) {
      router.push("/shop");
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
            router.push("/shop");
          }}
        />
      </main>
    );
  }

  return null;
}

function WelcomeExperience({ onComplete }: { onComplete: () => void }) {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      id: "hero",
      title: "Welcome to Revolution",
      subtitle: "Where every thread tells a story",
    },
    {
      id: "origin",
      title: "Our Beginning",
      content:
        "We started in a small garage with a single sewing machine and a vision: to create clothing that means something.",
    },
    {
      id: "mission",
      title: "Our Mission",
      content:
        "We believe that what you wear should reflect who you are and what you stand for. Every piece we create carries the spirit of our team.",
    },
    {
      id: "people",
      title: "Our People",
      content:
        "From our founder to our newest team member, everyone here has a story worth sharing. And we share them all.",
    },
    {
      id: "enter",
      title: "Enter the Experience",
      content: "You're not just shopping. You're joining a movement.",
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
              {/* Left Model Placeholder */}
              <div className="w-1/4 h-full bg-gradient-to-r from-brand-100 to-transparent flex items-center justify-center">
                <div className="w-48 h-96 bg-brand-200 rounded-lg flex items-center justify-center text-brand-400">
                  Model
                </div>
              </div>

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

              {/* Right Model Placeholder */}
              <div className="w-1/4 h-full bg-gradient-to-l from-brand-100 to-transparent flex items-center justify-center">
                <div className="w-48 h-96 bg-brand-200 rounded-lg flex items-center justify-center text-brand-400">
                  Model
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
