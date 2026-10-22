"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Trash2, Wand2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

type TryOnStep = "upload" | "processing" | "result";

export default function TryOnPage() {
  const [step, setStep] = useState<TryOnStep>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    []
  );

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartTryOn = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("result");
    }, 3000);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-brand-50 pt-20">
      {/* Header */}
      <div className="container-wide section-padding py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-brand-900 mb-4">
            Be the Model
          </h1>
          <p className="text-brand-600 text-lg">
            Upload your photo and see yourself wearing any outfit from our
            collection. It&apos;s like having a personal fitting room, anywhere.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-narrow section-padding pb-24">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${
                    isDragging
                      ? "border-accent-500 bg-accent-50"
                      : uploadedImage
                        ? "border-brand-300 bg-white"
                        : "border-brand-300 bg-brand-100/50 hover:border-brand-400 hover:bg-brand-100"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Your uploaded photo"
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-brand-600" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-200 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-brand-500" />
                    </div>
                    <h3 className="text-xl font-medium text-brand-800 mb-2">
                      Drop your photo here
                    </h3>
                    <p className="text-brand-600 mb-4">
                      or click to browse your files
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="px-4 py-2 bg-accent-500 text-white rounded-full text-sm">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Photo
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">📸</span>
                  </div>
                  <h4 className="font-medium text-brand-900 mb-2">
                    Front-facing works best
                  </h4>
                  <p className="text-sm text-brand-600">
                    For the most accurate fit preview, use a photo where
                    you&apos;re facing the camera directly.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">💡</span>
                  </div>
                  <h4 className="font-medium text-brand-900 mb-2">
                    Good lighting helps
                  </h4>
                  <p className="text-sm text-brand-600">
                    Natural light or well-lit indoor spaces produce the best
                    results.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">👔</span>
                  </div>
                  <h4 className="font-medium text-brand-900 mb-2">
                    Wear fitted clothes
                  </h4>
                  <p className="text-sm text-brand-600">
                    Form-fitting clothing in your photo helps our AI understand
                    your shape better.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={handleStartTryOn}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full text-lg font-medium hover:bg-accent-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Wand2 className="w-5 h-5" />
                    Start Try-On Experience
                  </button>
                </motion.div>
              )}

              {/* Privacy Notice */}
              <div className="mt-12 bg-brand-100/50 rounded-xl p-6 flex items-start gap-4">
                <Lock className="w-6 h-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brand-900 mb-1">
                    Your privacy is protected
                  </h4>
                  <p className="text-sm text-brand-600">
                    Your photos are processed securely and are never stored on
                    our servers. All processing happens in real-time, and your
                    data is deleted immediately after your session ends. We
                    believe your image is yours alone.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-brand-200 border-t-accent-500 rounded-full"
                />
                <div className="absolute inset-4 bg-brand-100 rounded-full flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-accent-500" />
                </div>
              </div>
              <h2 className="font-display text-2xl text-brand-900 mb-4">
                Creating your look...
              </h2>
              <p className="text-brand-600">
                Our AI is working its magic. This usually takes just a few
                seconds.
              </p>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center bg-gradient-to-b from-brand-100 to-white">
                  <h2 className="font-display text-2xl text-brand-900 mb-2">
                    Your Virtual Try-On
                  </h2>
                  <p className="text-brand-600">
                    See how our pieces look on you
                  </p>
                </div>

                {/* Result Preview */}
                <div className="p-8">
                  <div className="aspect-[3/4] max-w-md mx-auto bg-gradient-to-b from-brand-100 to-brand-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-brand-500">
                      <div className="w-48 h-64 mx-auto mb-4 bg-brand-200 rounded-lg flex items-center justify-center">
                        Try-On Preview
                      </div>
                      <p className="text-sm">
                        Virtual try-on will appear here
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-brand-50 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-brand-700 hover:text-brand-900 transition-colors"
                  >
                    Try Another Photo
                  </button>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors"
                  >
                    Shop This Look
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
