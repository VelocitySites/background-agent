"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Megaphone,
  Building,
  PartyPopper,
  PiggyBank,
  Download,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

interface QuarterData {
  quarter: string;
  year: number;
  revenue: number;
  expenses: {
    materials: number;
    labor: number;
    advertising: number;
    operations: number;
    employeeEvents: number;
    other: number;
  };
  profit: number;
  savedAmount: number;
  distributedAmount: number;
  employeeCount: number;
  perEmployeeDistribution: number;
}

const FINANCIAL_DATA: QuarterData[] = [
  {
    quarter: "Q3",
    year: 2026,
    revenue: 850000,
    expenses: {
      materials: 250000,
      labor: 280000,
      advertising: 100000,
      operations: 75000,
      employeeEvents: 10050,
      other: 25000,
    },
    profit: 109950,
    savedAmount: 27487.5,
    distributedAmount: 82462.5,
    employeeCount: 8,
    perEmployeeDistribution: 10307.81,
  },
  {
    quarter: "Q2",
    year: 2026,
    revenue: 720000,
    expenses: {
      materials: 210000,
      labor: 280000,
      advertising: 85000,
      operations: 68000,
      employeeEvents: 8500,
      other: 22000,
    },
    profit: 46500,
    savedAmount: 11625,
    distributedAmount: 34875,
    employeeCount: 8,
    perEmployeeDistribution: 4359.38,
  },
];

const EXPENSE_CATEGORIES = [
  { key: "materials", label: "Materials & Production", icon: Package, color: "bg-blue-500" },
  { key: "labor", label: "Employee Salaries", icon: Users, color: "bg-green-500" },
  { key: "advertising", label: "Advertising & Marketing", icon: Megaphone, color: "bg-purple-500" },
  { key: "operations", label: "Operations & Facilities", icon: Building, color: "bg-orange-500" },
  { key: "employeeEvents", label: "Employee Events & Culture", icon: PartyPopper, color: "bg-pink-500" },
  { key: "other", label: "Other Expenses", icon: DollarSign, color: "bg-gray-500" },
];

export default function TransparencyPage() {
  const [selectedQuarter, setSelectedQuarter] = useState(0);
  const currentData = FINANCIAL_DATA[selectedQuarter];

  const totalExpenses = Object.values(currentData.expenses).reduce(
    (sum, val) => sum + val,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-brand-50 pt-20">
      {/* Header */}
      <section className="py-16 section-padding bg-brand-900 text-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-accent-400 uppercase tracking-widest text-sm mb-4">
              Radical Transparency
            </p>
            <h1 className="font-display text-4xl md:text-5xl mb-6">
              Our Finances. Open Book.
            </h1>
            <p className="text-xl text-brand-300">
              We promised you could see where your money goes. Here it is. Every
              quarter, we publish exactly how much we made, how much we spent,
              and how much went to our employees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quarter Selector */}
      <section className="py-8 section-padding bg-white border-b border-brand-200">
        <div className="container-wide">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-brand-600 font-medium whitespace-nowrap">
              Select Quarter:
            </span>
            {FINANCIAL_DATA.map((data, index) => (
              <button
                key={`${data.quarter}-${data.year}`}
                onClick={() => setSelectedQuarter(index)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedQuarter === index
                    ? "bg-brand-900 text-white"
                    : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                }`}
              >
                {data.quarter} {data.year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="py-12 section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              key={`revenue-${selectedQuarter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-brand-600">Total Revenue</span>
              </div>
              <p className="text-3xl font-display text-brand-900">
                {formatCurrency(currentData.revenue)}
              </p>
            </motion.div>

            <motion.div
              key={`expenses-${selectedQuarter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-brand-600">Total Expenses</span>
              </div>
              <p className="text-3xl font-display text-brand-900">
                {formatCurrency(totalExpenses)}
              </p>
            </motion.div>

            <motion.div
              key={`profit-${selectedQuarter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-accent-600" />
                </div>
                <span className="text-brand-600">Net Profit</span>
              </div>
              <p className="text-3xl font-display text-brand-900">
                {formatCurrency(currentData.profit)}
              </p>
            </motion.div>

            <motion.div
              key={`employees-${selectedQuarter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-brand-600">Team Size</span>
              </div>
              <p className="text-3xl font-display text-brand-900">
                {currentData.employeeCount}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expense Breakdown */}
      <section className="py-12 section-padding">
        <div className="container-wide">
          <h2 className="font-display text-2xl text-brand-900 mb-8">
            Where The Money Went
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden">
            {/* Visual Bar */}
            <div className="h-8 flex">
              {EXPENSE_CATEGORIES.map(({ key, color }) => {
                const amount = currentData.expenses[key as keyof typeof currentData.expenses];
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div
                    key={key}
                    className={`${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                );
              })}
            </div>

            {/* Breakdown Table */}
            <div className="divide-y divide-brand-100">
              {EXPENSE_CATEGORIES.map(({ key, label, icon: Icon, color }) => {
                const amount = currentData.expenses[key as keyof typeof currentData.expenses];
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 hover:bg-brand-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${color}`}
                      />
                      <Icon className="w-5 h-5 text-brand-400" />
                      <span className="text-brand-800">{label}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-brand-500 text-sm">
                        {percentage}%
                      </span>
                      <span className="text-brand-900 font-medium w-28 text-right">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-4 bg-brand-50 font-medium">
                <span className="text-brand-900">Total Expenses</span>
                <span className="text-brand-900">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profit Distribution */}
      <section className="py-12 section-padding bg-brand-900 text-white">
        <div className="container-wide">
          <h2 className="font-display text-2xl mb-8">
            How We Shared The Profit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-brand-800/50 rounded-2xl p-8 border border-brand-700"
            >
              <p className="text-brand-400 mb-2">Net Profit</p>
              <p className="text-4xl font-display text-white mb-4">
                {formatCurrency(currentData.profit)}
              </p>
              <p className="text-brand-400 text-sm">
                Revenue minus all expenses
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-brand-800/50 rounded-2xl p-8 border border-brand-700"
            >
              <p className="text-brand-400 mb-2">25% → Savings</p>
              <p className="text-4xl font-display text-white mb-4">
                {formatCurrency(currentData.savedAmount)}
              </p>
              <p className="text-brand-400 text-sm">
                Reserved for future growth and stability
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-accent-600/20 rounded-2xl p-8 border border-accent-500/30"
            >
              <p className="text-accent-300 mb-2">75% → Employees</p>
              <p className="text-4xl font-display text-accent-400 mb-4">
                {formatCurrency(currentData.distributedAmount)}
              </p>
              <p className="text-accent-300 text-sm">
                Shared equally among {currentData.employeeCount} team members
              </p>
            </motion.div>
          </div>

          {/* Per Employee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-white/10 rounded-2xl p-8 text-center"
          >
            <p className="text-brand-300 mb-2">
              Each of our {currentData.employeeCount} employees received
            </p>
            <p className="text-5xl font-display text-white mb-2">
              {formatCurrencyDetailed(currentData.perEmployeeDistribution)}
            </p>
            <p className="text-brand-400">
              in addition to their ${70000} base salary this quarter
            </p>
          </motion.div>
        </div>
      </section>

      {/* Download & Verification */}
      <section className="py-12 section-padding">
        <div className="container-narrow">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-200 text-center">
            <h3 className="font-display text-xl text-brand-900 mb-4">
              Want More Detail?
            </h3>
            <p className="text-brand-600 mb-6">
              Download our complete quarterly financial report with full
              breakdowns, receipts summary, and verification from our
              independent accountant.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-full hover:bg-brand-800 transition-colors">
              <Download className="w-5 h-5" />
              Download {currentData.quarter} {currentData.year} Report (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Compensation Cap */}
      <section className="py-12 section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="font-display text-2xl text-brand-900 mb-2">
                    Maximum Compensation
                  </h2>
                  <p className="text-brand-600">
                    Total compensation (salary + profit share) is capped per person
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-display text-brand-900">$435,600</p>
                  <p className="text-brand-500 text-sm">2026 cap (adjusted for cost of living)</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-brand-200">
                <p className="text-sm text-brand-600 mb-4">
                  Adjusted annually based on our Real Cost of Living Index:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-brand-50 rounded-lg p-3 text-center">
                    <span className="text-lg">🏠</span>
                    <p className="text-brand-700 text-sm font-medium mt-1">Housing</p>
                    <p className="text-brand-500 text-xs">40% weight</p>
                  </div>
                  <div className="bg-brand-50 rounded-lg p-3 text-center">
                    <span className="text-lg">🥛</span>
                    <p className="text-brand-700 text-sm font-medium mt-1">Milk</p>
                    <p className="text-brand-500 text-xs">20% weight</p>
                  </div>
                  <div className="bg-brand-50 rounded-lg p-3 text-center">
                    <span className="text-lg">🥚</span>
                    <p className="text-brand-700 text-sm font-medium mt-1">Eggs</p>
                    <p className="text-brand-500 text-xs">20% weight</p>
                  </div>
                  <div className="bg-brand-50 rounded-lg p-3 text-center">
                    <span className="text-lg">⛽</span>
                    <p className="text-brand-700 text-sm font-medium mt-1">Gas</p>
                    <p className="text-brand-500 text-xs">20% weight</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-brand-50 border-t border-brand-200 flex items-center justify-between">
              <p className="text-sm text-brand-600">
                Base cap: $400,000 (2024) • Current index: 108.9
              </p>
              <Link
                href="/transparency/cost-of-living"
                className="flex items-center gap-2 text-accent-600 hover:text-accent-700 text-sm font-medium"
              >
                View Full Index
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 section-padding bg-brand-100/50">
        <div className="container-narrow">
          <div className="prose prose-brand max-w-none text-center">
            <p className="text-brand-600">
              These numbers are real. They're verified by an independent
              accountant. We publish them because we believe you have the right
              to know how the companies you support actually operate.
            </p>
            <p className="text-brand-500 text-sm mt-4">
              Questions about our finances?{" "}
              <a href="/contact" className="text-accent-600 hover:underline">
                Contact us
              </a>
              . We'll answer anything.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
