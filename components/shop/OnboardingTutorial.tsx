"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, MousePointerClick, Palette, ShoppingBag } from "lucide-react";

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Welcome to the Experience",
    description: "Build your perfect outfit by clicking on different parts of your avatar. It's like creating a character in your favorite game.",
    icon: Sparkles,
    highlight: "avatar",
  },
  {
    id: 2,
    title: "Click to Customize",
    description: "Tap on the avatar's head, body, legs, or feet to see available items for that slot. Each click opens a selection menu.",
    icon: MousePointerClick,
    highlight: "slots",
  },
  {
    id: 3,
    title: "Mix Colors & Sizes",
    description: "Once you select an item, choose your preferred color and size. See how different combinations look on your avatar.",
    icon: Palette,
    highlight: "selector",
  },
  {
    id: 4,
    title: "Get Your Look",
    description: "When you're happy with your outfit, click 'Get This Look' to shop the items from our partner stores.",
    icon: ShoppingBag,
    highlight: "checkout",
  },
];

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
      if (e.key === "Enter" || e.key === " ") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSkip} />

          {/* Tutorial Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="bg-gradient-to-b from-brand-800 to-brand-900 rounded-3xl border border-brand-700 shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-full bg-brand-700/50 hover:bg-brand-700 transition-colors z-10"
              >
                <X className="w-4 h-4 text-brand-400" />
              </button>

              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8 pt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center"
                    >
                      <Icon className="w-10 h-10 text-accent-400" />
                    </motion.div>

                    {/* Text */}
                    <h3 className="text-2xl font-display text-white mb-3">{step.title}</h3>
                    <p className="text-brand-300 leading-relaxed">{step.description}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mt-8 mb-6">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? "w-8 bg-accent-500"
                          : index < currentStep
                            ? "bg-accent-500/50"
                            : "bg-brand-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 px-4 rounded-xl text-brand-400 hover:text-white hover:bg-brand-700/50 transition-all text-sm"
                  >
                    Skip Tutorial
                  </button>
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-accent-500/25"
                  >
                    {isLastStep ? "Let's Go!" : "Next"}
                    {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
