"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Ruler,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";

type MeasurementStep = "intro" | "capture" | "processing" | "results" | "manual";

interface Measurements {
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
  shoeSize: string;
}

interface SizeRecommendations {
  tops: string;
  bottoms: string;
  outerwear: string;
  shoes: string;
}

export default function MeasurementsPage() {
  const [step, setStep] = useState<MeasurementStep>("intro");
  const [measurements, setMeasurements] = useState<Measurements>({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    inseam: "",
    shoeSize: "",
  });
  const [recommendations, setRecommendations] = useState<SizeRecommendations | null>(
    null
  );

  const handleCapture = () => {
    setStep("processing");
    setTimeout(() => {
      setMeasurements({
        height: "5'10\"",
        weight: "165 lbs",
        chest: "40\"",
        waist: "32\"",
        hips: "38\"",
        inseam: "32\"",
        shoeSize: "10",
      });
      setRecommendations({
        tops: "M",
        bottoms: "32",
        outerwear: "M",
        shoes: "10",
      });
      setStep("results");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-brand-50 pt-20">
      {/* Header */}
      <section className="py-12 section-padding bg-brand-900 text-white">
        <div className="container-narrow">
          <div className="flex items-center gap-3 text-accent-400 mb-4">
            <Ruler className="w-5 h-5" />
            <span className="uppercase tracking-widest text-sm">
              Perfect Fit Technology
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Never Guess Your Size Again
          </h1>
          <p className="text-xl text-brand-300">
            Take a few photos and we'll calculate your exact measurements. Get
            personalized size recommendations for every item.
          </p>
        </div>
      </section>

      <div className="container-narrow section-padding py-12">
        {/* Intro Step */}
        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-accent-500" />
                </div>
                <h2 className="font-display text-2xl text-brand-900 mb-4">
                  How It Works
                </h2>
                <p className="text-brand-600 max-w-md mx-auto mb-8">
                  Our AI analyzes photos to calculate your body measurements
                  with high accuracy. No tape measure required.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-brand-50 rounded-xl">
                    <div className="w-12 h-12 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-display text-brand-700">1</span>
                    </div>
                    <h3 className="font-medium text-brand-900 mb-2">
                      Take 2 Photos
                    </h3>
                    <p className="text-sm text-brand-600">
                      Front-facing and side profile in fitted clothing
                    </p>
                  </div>
                  <div className="p-6 bg-brand-50 rounded-xl">
                    <div className="w-12 h-12 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-display text-brand-700">2</span>
                    </div>
                    <h3 className="font-medium text-brand-900 mb-2">
                      AI Analysis
                    </h3>
                    <p className="text-sm text-brand-600">
                      Our system calculates your measurements in seconds
                    </p>
                  </div>
                  <div className="p-6 bg-brand-50 rounded-xl">
                    <div className="w-12 h-12 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-display text-brand-700">3</span>
                    </div>
                    <h3 className="font-medium text-brand-900 mb-2">
                      Perfect Sizes
                    </h3>
                    <p className="text-sm text-brand-600">
                      Get recommendations for every brand and item
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setStep("capture")}
                    className="flex items-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full font-medium hover:bg-accent-600 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Start Photo Capture
                  </button>
                  <button
                    onClick={() => setStep("manual")}
                    className="flex items-center gap-2 px-8 py-4 text-brand-700 hover:text-brand-900 transition-colors"
                  >
                    <Ruler className="w-5 h-5" />
                    Enter Manually
                  </button>
                </div>
              </div>

              <div className="px-8 py-4 bg-brand-50 border-t border-brand-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-600">
                  Your photos are processed on-device and never uploaded to our
                  servers. Measurements are stored securely and only used to
                  improve your shopping experience.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Capture Step */}
        {step === "capture" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-brand-200 p-8">
              <h2 className="font-display text-2xl text-brand-900 mb-6 text-center">
                Photo Capture
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Front Photo */}
                <div>
                  <h3 className="font-medium text-brand-900 mb-3">
                    1. Front View
                  </h3>
                  <div className="aspect-[3/4] bg-brand-100 rounded-xl border-2 border-dashed border-brand-300 flex items-center justify-center cursor-pointer hover:border-accent-400 transition-colors">
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                      <p className="text-brand-600 mb-1">Tap to capture</p>
                      <p className="text-sm text-brand-500">
                        Stand facing the camera, arms at sides
                      </p>
                    </div>
                  </div>
                </div>

                {/* Side Photo */}
                <div>
                  <h3 className="font-medium text-brand-900 mb-3">
                    2. Side View
                  </h3>
                  <div className="aspect-[3/4] bg-brand-100 rounded-xl border-2 border-dashed border-brand-300 flex items-center justify-center cursor-pointer hover:border-accent-400 transition-colors">
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                      <p className="text-brand-600 mb-1">Tap to capture</p>
                      <p className="text-sm text-brand-500">
                        Turn 90°, stand naturally
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-brand-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-brand-900 mb-2">
                  Tips for best results:
                </h4>
                <ul className="space-y-1 text-sm text-brand-600">
                  <li>• Wear fitted clothing (not baggy)</li>
                  <li>• Stand against a plain background</li>
                  <li>• Good lighting helps accuracy</li>
                  <li>• Place phone at waist height, 6-8 feet away</li>
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("intro")}
                  className="text-brand-600 hover:text-brand-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCapture}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full font-medium hover:bg-accent-600 transition-colors"
                >
                  Analyze Photos
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-brand-200 border-t-accent-500 rounded-full"
              />
              <div className="absolute inset-4 bg-brand-100 rounded-full flex items-center justify-center">
                <Ruler className="w-8 h-8 text-accent-500" />
              </div>
            </div>
            <h2 className="font-display text-2xl text-brand-900 mb-4">
              Analyzing your photos...
            </h2>
            <p className="text-brand-600">
              Our AI is calculating your measurements. This takes just a few
              seconds.
            </p>
          </motion.div>
        )}

        {/* Results Step */}
        {step === "results" && recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 text-green-600 mb-6">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="font-display text-2xl text-brand-900">
                    Your Measurements
                  </h2>
                </div>

                {/* Measurements Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {Object.entries(measurements).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-brand-50 rounded-xl p-4 text-center"
                    >
                      <p className="text-sm text-brand-500 capitalize mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-xl font-display text-brand-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Size Recommendations */}
                <h3 className="font-medium text-brand-900 mb-4">
                  Your Recommended Sizes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-accent-50 rounded-xl p-4 text-center border border-accent-200">
                    <p className="text-sm text-accent-600 mb-1">Tops</p>
                    <p className="text-3xl font-display text-accent-700">
                      {recommendations.tops}
                    </p>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-4 text-center border border-accent-200">
                    <p className="text-sm text-accent-600 mb-1">Bottoms</p>
                    <p className="text-3xl font-display text-accent-700">
                      {recommendations.bottoms}
                    </p>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-4 text-center border border-accent-200">
                    <p className="text-sm text-accent-600 mb-1">Outerwear</p>
                    <p className="text-3xl font-display text-accent-700">
                      {recommendations.outerwear}
                    </p>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-4 text-center border border-accent-200">
                    <p className="text-sm text-accent-600 mb-1">Shoes</p>
                    <p className="text-3xl font-display text-accent-700">
                      {recommendations.shoes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setStep("capture")}
                    className="px-6 py-3 text-brand-700 hover:text-brand-900 transition-colors"
                  >
                    Retake Photos
                  </button>
                  <a
                    href="/shop/experience"
                    className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full font-medium hover:bg-accent-600 transition-colors"
                  >
                    Start Shopping
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="px-8 py-4 bg-brand-50 border-t border-brand-200">
                <p className="text-sm text-brand-600 text-center">
                  These recommendations will automatically apply when you shop.
                  Each item will show your best size.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Entry Step */}
        {step === "manual" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-brand-200 p-8">
              <h2 className="font-display text-2xl text-brand-900 mb-6">
                Enter Your Measurements
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {[
                  { key: "height", label: "Height", placeholder: "5'10\"" },
                  { key: "weight", label: "Weight", placeholder: "165 lbs" },
                  { key: "chest", label: "Chest", placeholder: "40\"" },
                  { key: "waist", label: "Waist", placeholder: "32\"" },
                  { key: "hips", label: "Hips", placeholder: "38\"" },
                  { key: "inseam", label: "Inseam", placeholder: "32\"" },
                  { key: "shoeSize", label: "Shoe Size", placeholder: "10" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      {label}
                    </label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={measurements[key as keyof Measurements]}
                      onChange={(e) =>
                        setMeasurements({
                          ...measurements,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-brand-300 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("intro")}
                  className="text-brand-600 hover:text-brand-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setRecommendations({
                      tops: "M",
                      bottoms: "32",
                      outerwear: "M",
                      shoes: measurements.shoeSize || "10",
                    });
                    setStep("results");
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full font-medium hover:bg-accent-600 transition-colors"
                >
                  Calculate Sizes
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
