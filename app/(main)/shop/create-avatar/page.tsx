"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Shuffle,
  Camera,
  Wand2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Upload,
} from "lucide-react";

type AvatarCreationMode = "random" | "customize" | "photo";
type CreationStep = "mode" | "customize" | "style" | "complete";

interface AvatarConfig {
  mode: AvatarCreationMode;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  bodyType: number;
  facialFeatures: number;
  photoUrl?: string;
}

const SKIN_TONES = ["#FFDFC4", "#F0C08A", "#CD9A6E", "#8D6346", "#5C3D2E", "#3B2219"];
const HAIR_STYLES = ["Short", "Medium", "Long", "Curly", "Wavy", "Bald"];
const HAIR_COLORS = ["#1A1A1A", "#4A3728", "#8B4513", "#D4A574", "#C0C0C0", "#FF6B6B"];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Plus"];

export default function CreateAvatarPage() {
  const router = useRouter();
  const [step, setStep] = useState<CreationStep>("mode");
  const [avatar, setAvatar] = useState<AvatarConfig>({
    mode: "random",
    skinTone: 2,
    hairStyle: 0,
    hairColor: 0,
    bodyType: 2,
    facialFeatures: 0,
  });

  const randomizeAvatar = () => {
    setAvatar({
      ...avatar,
      skinTone: Math.floor(Math.random() * SKIN_TONES.length),
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
      bodyType: Math.floor(Math.random() * BODY_TYPES.length),
      facialFeatures: Math.floor(Math.random() * 5),
    });
  };

  const selectMode = (mode: AvatarCreationMode) => {
    setAvatar({ ...avatar, mode });
    if (mode === "random") {
      randomizeAvatar();
    }
    setStep("customize");
  };

  const handleComplete = () => {
    localStorage.setItem("revolution_avatar", JSON.stringify(avatar));
    router.push("/shop/experience");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-white pt-20">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-brand-800 z-40">
        <motion.div
          className="h-full bg-accent-500"
          initial={{ width: "0%" }}
          animate={{
            width:
              step === "mode"
                ? "25%"
                : step === "customize"
                  ? "50%"
                  : step === "style"
                    ? "75%"
                    : "100%",
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="container-wide section-padding py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Mode */}
          {step === "mode" && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-accent-400" />
                </motion.div>
                <h1 className="font-display text-4xl md:text-5xl mb-4">
                  Create Your Avatar
                </h1>
                <p className="text-xl text-brand-300">
                  Shop like you're building a character. See exactly how clothes
                  will look on you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Random */}
                <motion.button
                  onClick={() => selectMode("random")}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-brand-800/50 rounded-2xl p-8 border border-brand-700 hover:border-accent-500 transition-colors text-left group"
                >
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                    <Shuffle className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-2">
                    Surprise Me
                  </h3>
                  <p className="text-brand-400">
                    Generate a random avatar and start shopping immediately.
                    Quick and fun.
                  </p>
                </motion.button>

                {/* Customize */}
                <motion.button
                  onClick={() => selectMode("customize")}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-brand-800/50 rounded-2xl p-8 border border-brand-700 hover:border-accent-500 transition-colors text-left group"
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                    <User className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-2">
                    Build Your Look
                  </h3>
                  <p className="text-brand-400">
                    Customize skin tone, body type, hair, and more. Make it feel
                    like you.
                  </p>
                </motion.button>

                {/* Photo */}
                <motion.button
                  onClick={() => selectMode("photo")}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-brand-800/50 rounded-2xl p-8 border border-brand-700 hover:border-accent-500 transition-colors text-left group relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 px-2 py-1 bg-accent-500 text-xs rounded-full">
                    Recommended
                  </div>
                  <div className="w-14 h-14 bg-accent-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent-500/30 transition-colors">
                    <Camera className="w-7 h-7 text-accent-400" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-2">
                    Use Your Photo
                  </h3>
                  <p className="text-brand-400">
                    Upload a photo and we'll create a realistic avatar that
                    looks like you.
                  </p>
                </motion.button>
              </div>

              <p className="text-center text-brand-500 text-sm mt-8">
                Your avatar helps you visualize clothes before buying. Change it
                anytime.
              </p>
            </motion.div>
          )}

          {/* Step 2: Customize */}
          {step === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setStep("mode")}
                  className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <h2 className="font-display text-2xl">Customize Your Avatar</h2>
                <button
                  onClick={randomizeAvatar}
                  className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors"
                >
                  <Shuffle className="w-5 h-5" />
                  Randomize
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Avatar Preview */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <motion.div
                      key={JSON.stringify(avatar)}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-72 h-96 bg-gradient-to-b from-brand-700 to-brand-800 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    >
                      {/* Simplified avatar visualization */}
                      <div className="text-center">
                        <div
                          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-brand-600"
                          style={{ backgroundColor: SKIN_TONES[avatar.skinTone] }}
                        />
                        <div
                          className="w-20 h-8 rounded-full mx-auto -mt-8 mb-4"
                          style={{ backgroundColor: HAIR_COLORS[avatar.hairColor] }}
                        />
                        <div
                          className="w-32 h-48 rounded-t-3xl mx-auto"
                          style={{ backgroundColor: SKIN_TONES[avatar.skinTone] }}
                        />
                        <p className="absolute bottom-4 left-0 right-0 text-brand-400 text-sm">
                          {BODY_TYPES[avatar.bodyType]} Build
                        </p>
                      </div>
                    </motion.div>

                    {avatar.mode === "photo" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-900/90 rounded-2xl">
                        <div className="text-center p-8">
                          <Upload className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                          <p className="text-brand-300 mb-4">
                            Upload your photo to generate avatar
                          </p>
                          <button className="px-6 py-3 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors">
                            Choose Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customization Options */}
                <div className="space-y-8">
                  {/* Skin Tone */}
                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-3">
                      Skin Tone
                    </label>
                    <div className="flex gap-3">
                      {SKIN_TONES.map((tone, index) => (
                        <button
                          key={tone}
                          onClick={() => setAvatar({ ...avatar, skinTone: index })}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            avatar.skinTone === index
                              ? "border-accent-500 scale-110"
                              : "border-transparent hover:border-brand-600"
                          }`}
                          style={{ backgroundColor: tone }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-3">
                      Hair Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_STYLES.map((style, index) => (
                        <button
                          key={style}
                          onClick={() => setAvatar({ ...avatar, hairStyle: index })}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            avatar.hairStyle === index
                              ? "bg-accent-500 text-white"
                              : "bg-brand-800 text-brand-300 hover:bg-brand-700"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-3">
                      Hair Color
                    </label>
                    <div className="flex gap-3">
                      {HAIR_COLORS.map((color, index) => (
                        <button
                          key={color}
                          onClick={() => setAvatar({ ...avatar, hairColor: index })}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            avatar.hairColor === index
                              ? "border-accent-500 scale-110"
                              : "border-transparent hover:border-brand-600"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-3">
                      Body Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BODY_TYPES.map((type, index) => (
                        <button
                          key={type}
                          onClick={() => setAvatar({ ...avatar, bodyType: index })}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            avatar.bodyType === index
                              ? "bg-accent-500 text-white"
                              : "bg-brand-800 text-brand-300 hover:bg-brand-700"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    onClick={() => setStep("style")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full text-lg font-medium hover:bg-accent-600 transition-colors mt-8"
                  >
                    Continue to Style Selection
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Initial Style */}
          {step === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setStep("customize")}
                  className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <h2 className="font-display text-2xl">Pick a Starting Style</h2>
                <div />
              </div>

              <p className="text-center text-brand-300 mb-12">
                Choose a style vibe to start with. You can mix and match
                everything later.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Minimalist", emoji: "🤍", color: "bg-gray-700" },
                  { name: "Streetwear", emoji: "🔥", color: "bg-orange-700" },
                  { name: "Classic", emoji: "👔", color: "bg-blue-700" },
                  { name: "Avant-Garde", emoji: "✨", color: "bg-purple-700" },
                  { name: "Athleisure", emoji: "💪", color: "bg-green-700" },
                  { name: "Bohemian", emoji: "🌸", color: "bg-pink-700" },
                  { name: "Preppy", emoji: "🎓", color: "bg-red-700" },
                  { name: "Surprise Me", emoji: "🎲", color: "bg-accent-600" },
                ].map((style) => (
                  <motion.button
                    key={style.name}
                    onClick={handleComplete}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${style.color} rounded-2xl p-6 text-center transition-all hover:ring-2 hover:ring-accent-400`}
                  >
                    <span className="text-4xl block mb-3">{style.emoji}</span>
                    <span className="font-medium text-white">{style.name}</span>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-brand-500 text-sm mt-8">
                This just helps us show you relevant items first. Explore
                everything anytime.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
