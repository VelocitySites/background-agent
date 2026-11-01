"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Home,
  Milk,
  Fuel,
  ArrowLeft,
  Calendar,
  DollarSign,
} from "lucide-react";

interface CostData {
  year: number;
  housingIndex: number;
  milkPrice: number;
  eggsPrice: number;
  gasPrice: number;
  compositeIndex: number;
  compensationCap: number;
}

const HISTORICAL_DATA: CostData[] = [
  {
    year: 2024,
    housingIndex: 100,
    milkPrice: 4.15,
    eggsPrice: 2.89,
    gasPrice: 3.45,
    compositeIndex: 100,
    compensationCap: 400000,
  },
  {
    year: 2025,
    housingIndex: 104.2,
    milkPrice: 4.35,
    eggsPrice: 3.15,
    gasPrice: 3.62,
    compositeIndex: 104.8,
    compensationCap: 419200,
  },
  {
    year: 2026,
    housingIndex: 107.8,
    milkPrice: 4.52,
    eggsPrice: 3.45,
    gasPrice: 3.78,
    compositeIndex: 108.9,
    compensationCap: 435600,
  },
];

const METRICS = [
  {
    key: "housingIndex",
    label: "Housing Index",
    icon: Home,
    description: "National median home price and rent index",
    unit: "index",
    weight: 40,
  },
  {
    key: "milkPrice",
    label: "Gallon of Milk",
    icon: Milk,
    description: "National average price",
    unit: "$",
    weight: 20,
  },
  {
    key: "eggsPrice",
    label: "Carton of Eggs",
    icon: () => <span className="text-2xl">🥚</span>,
    description: "Dozen large eggs, national average",
    unit: "$",
    weight: 20,
  },
  {
    key: "gasPrice",
    label: "Gallon of Gas",
    icon: Fuel,
    description: "Regular unleaded, national average",
    unit: "$",
    weight: 20,
  },
];

export default function CostOfLivingPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const currentData = HISTORICAL_DATA.find((d) => d.year === selectedYear)!;
  const previousData = HISTORICAL_DATA.find((d) => d.year === selectedYear - 1);

  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-brand-50 pt-20">
      {/* Header */}
      <section className="py-12 section-padding bg-brand-900 text-white">
        <div className="container-wide">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Transparency
          </Link>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Real Cost of Living Index
          </h1>
          <p className="text-xl text-brand-300 max-w-3xl">
            We don't trust government inflation numbers. We track what real
            people actually pay for essentials. This index determines our
            compensation cap adjustments.
          </p>
        </div>
      </section>

      {/* Year Selector */}
      <section className="py-6 section-padding bg-white border-b border-brand-200">
        <div className="container-wide">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-brand-500" />
            <span className="text-brand-600 font-medium">Year:</span>
            {HISTORICAL_DATA.map((data) => (
              <button
                key={data.year}
                onClick={() => setSelectedYear(data.year)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedYear === data.year
                    ? "bg-brand-900 text-white"
                    : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                }`}
              >
                {data.year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Compensation Cap */}
      <section className="py-12 section-padding">
        <div className="container-wide">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-brand-200 p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-brand-500 text-sm uppercase tracking-wide mb-2">
                  {selectedYear} Maximum Compensation
                </p>
                <p className="text-5xl font-display text-brand-900">
                  {formatCurrency(currentData.compensationCap)}
                </p>
                <p className="text-brand-600 mt-2">
                  Base salary + profit share capped at this amount per person
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand-500 text-sm mb-1">
                  Composite Index: {currentData.compositeIndex.toFixed(1)}
                </p>
                {previousData && (
                  <div
                    className={`flex items-center gap-1 justify-end ${
                      currentData.compositeIndex > previousData.compositeIndex
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {currentData.compositeIndex > previousData.compositeIndex ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {calculateChange(
                        currentData.compositeIndex,
                        previousData.compositeIndex
                      )?.toFixed(1)}
                      % from {previousData.year}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="py-12 section-padding">
        <div className="container-wide">
          <h2 className="font-display text-2xl text-brand-900 mb-8">
            What We Track
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {METRICS.map((metric) => {
              const currentValue =
                currentData[metric.key as keyof CostData] as number;
              const previousValue = previousData
                ? (previousData[metric.key as keyof CostData] as number)
                : undefined;
              const change = calculateChange(currentValue, previousValue);
              const Icon = metric.icon;

              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-brand-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-brand-900">
                          {metric.label}
                        </h3>
                        <p className="text-sm text-brand-500">
                          {metric.weight}% weight
                        </p>
                      </div>
                    </div>
                    {change !== null && (
                      <div
                        className={`flex items-center gap-1 ${
                          change > 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-3xl font-display text-brand-900 mb-2">
                    {metric.unit === "$" ? "$" : ""}
                    {currentValue.toFixed(metric.unit === "$" ? 2 : 1)}
                    {metric.unit === "index" && " pts"}
                  </p>
                  <p className="text-sm text-brand-600">{metric.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 section-padding bg-brand-100/50">
        <div className="container-narrow">
          <h2 className="font-display text-2xl text-brand-900 mb-6">
            How We Calculate It
          </h2>

          <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6 mb-6">
            <h3 className="font-medium text-brand-900 mb-4">The Formula</h3>
            <div className="bg-brand-50 rounded-lg p-4 font-mono text-sm text-brand-700 overflow-x-auto">
              <p>Composite Index = </p>
              <p className="ml-4">
                (Housing Index × 0.40) +
              </p>
              <p className="ml-4">
                (Milk Price Change × 0.20) +
              </p>
              <p className="ml-4">
                (Eggs Price Change × 0.20) +
              </p>
              <p className="ml-4">
                (Gas Price Change × 0.20)
              </p>
              <p className="mt-4">
                New Cap = Base Cap × (Current Index / Base Index)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6">
            <h3 className="font-medium text-brand-900 mb-4">Why These Metrics?</h3>
            <div className="space-y-4 text-brand-700">
              <p>
                <strong>Housing (40%)</strong> — The largest expense for most
                people. We track both home prices and rental rates to capture
                the full picture.
              </p>
              <p>
                <strong>Groceries (40%)</strong> — Milk and eggs are staple
                items that everyone buys. Their prices reflect real inflation
                that affects daily life.
              </p>
              <p>
                <strong>Gas (20%)</strong> — Transportation costs affect
                everything from commuting to the price of goods. It's a
                fundamental economic indicator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Not CPI */}
      <section className="py-12 section-padding">
        <div className="container-narrow">
          <h2 className="font-display text-2xl text-brand-900 mb-6">
            Why Not Use Government CPI?
          </h2>

          <div className="prose prose-brand max-w-none">
            <p className="text-brand-700 leading-relaxed mb-4">
              The Consumer Price Index (CPI) is supposed to measure inflation,
              but it's been modified over the decades to systematically
              undercount real price increases. Methods like "hedonic
              adjustment" and "substitution" make inflation look lower than it
              feels.
            </p>
            <p className="text-brand-700 leading-relaxed mb-4">
              When the government reports 3% inflation but your rent went up
              10% and groceries cost 15% more, something is wrong with the
              measurement.
            </p>
            <p className="text-brand-900 font-medium">
              We track what we can verify. Prices that real people pay at real
              stores. No adjustments, no substitutions, no games.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-12 section-padding bg-brand-900 text-white">
        <div className="container-narrow">
          <h2 className="font-display text-2xl mb-6">Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-800/50 rounded-xl p-6">
              <h3 className="font-medium text-white mb-2">Housing</h3>
              <p className="text-brand-300 text-sm">
                Zillow Home Value Index, Apartment List National Rent Report
              </p>
            </div>
            <div className="bg-brand-800/50 rounded-xl p-6">
              <h3 className="font-medium text-white mb-2">Groceries</h3>
              <p className="text-brand-300 text-sm">
                Bureau of Labor Statistics Average Price Data (verified against
                major retailers)
              </p>
            </div>
            <div className="bg-brand-800/50 rounded-xl p-6">
              <h3 className="font-medium text-white mb-2">Gas</h3>
              <p className="text-brand-300 text-sm">
                AAA Gas Prices, EIA Weekly Retail Gasoline Prices
              </p>
            </div>
            <div className="bg-brand-800/50 rounded-xl p-6">
              <h3 className="font-medium text-white mb-2">Updates</h3>
              <p className="text-brand-300 text-sm">
                Index recalculated annually in January. Compensation cap
                adjusted for the new year.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
