"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Handshake,
  Rocket,
  Users,
  CheckCircle2,
  Globe,
} from "lucide-react";

const JOIN_PATHS = [
  {
    id: "merge",
    icon: Handshake,
    title: "Merge With Us",
    subtitle: "Keep your identity, share our values",
    description:
      "Your company joins the Revolution ecosystem while maintaining separate financials and brand identity. You adopt our core commitments: equal pay, profit sharing, and transparency.",
    features: [
      "Maintain your brand and team",
      "Separate financial reporting",
      "Shared mission and values",
      "Access to ecosystem resources",
      "Cross-promotion opportunities",
    ],
    cta: "Explore Merger",
  },
  {
    id: "acquisition",
    icon: Building2,
    title: "Get Acquired",
    subtitle: "Full integration into Revolution",
    description:
      "We acquire your company and fully integrate it into the Revolution family. Your team transitions to equal pay, full profit sharing, and becomes part of our unified mission.",
    features: [
      "Full financial integration",
      "Team transitions to $70k base + profit share",
      "Unified brand experience",
      "Complete operational support",
      "Immediate ecosystem benefits",
    ],
    cta: "Discuss Acquisition",
  },
  {
    id: "launch",
    icon: Rocket,
    title: "Start Fresh",
    subtitle: "We'll build it together",
    description:
      "Have an idea for a new industry? We interview and vet leaders, provide startup capital, and launch a new Revolution company from scratch. You lead it, we support it.",
    features: [
      "Startup capital provided",
      "Leadership interview process",
      "Built-in customer base",
      "Operational infrastructure",
      "Mentorship from existing leaders",
    ],
    cta: "Pitch Your Idea",
  },
];

const FUTURE_INDUSTRIES = [
  { name: "Food & Beverage", status: "exploring" },
  { name: "Home Goods", status: "exploring" },
  { name: "Technology", status: "exploring" },
  { name: "Health & Wellness", status: "exploring" },
  { name: "Education", status: "exploring" },
  { name: "Financial Services", status: "future" },
];

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-brand-50 pt-16">
      {/* Hero */}
      <section className="py-24 section-padding bg-gradient-to-b from-brand-900 to-brand-950 text-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 text-accent-400 mb-6">
              <Globe className="w-5 h-5" />
              <span className="uppercase tracking-widest text-sm">
                The Bigger Picture
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl mb-6">
              One Company is a Statement.
              <br />
              <span className="text-accent-400">An Ecosystem is a Movement.</span>
            </h1>
            <p className="text-xl text-brand-300 leading-relaxed">
              Revolution isn't just a clothing company. It's a platform for
              building businesses that operate differently. We're creating an
              ecosystem of companies across industries—all committed to equal
              pay, profit sharing, and radical transparency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-24 section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl text-brand-900 mb-8">
              The Vision
            </h2>
            <div className="prose prose-lg max-w-none text-brand-700">
              <p>
                Imagine a world where you could choose to buy from companies
                that treat their workers fairly—across every industry. Your
                coffee, your furniture, your software, your clothes. All from
                businesses that share profits equally, pay everyone the same
                base salary, and show you exactly where your money goes.
              </p>
              <p>
                That's what we're building. Revolution Clothing is just the
                beginning. Every successful company we add to the ecosystem
                proves the model works. Every industry we enter expands the
                movement.
              </p>
              <p className="text-brand-900 font-medium">
                We're not waiting for capitalism to change. We're building an
                alternative, one company at a time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Paths */}
      <section className="py-24 section-padding bg-brand-100/50">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-brand-900 mb-4">
              Three Ways to Join
            </h2>
            <p className="text-brand-600 text-lg max-w-2xl mx-auto">
              Whether you have an existing company or just an idea, there's a
              path into the Revolution ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {JOIN_PATHS.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-brand-200 flex flex-col"
              >
                <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                  <path.icon className="w-7 h-7 text-accent-600" />
                </div>
                <h3 className="font-display text-2xl text-brand-900 mb-2">
                  {path.title}
                </h3>
                <p className="text-accent-600 text-sm mb-4">{path.subtitle}</p>
                <p className="text-brand-600 mb-6 flex-grow">
                  {path.description}
                </p>
                <ul className="space-y-2 mb-8">
                  {path.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-brand-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/ecosystem/join?path=${path.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-full hover:bg-brand-800 transition-colors"
                >
                  {path.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl text-brand-900 mb-8">
              Non-Negotiables
            </h2>
            <p className="text-brand-600 mb-8">
              Every company in the Revolution ecosystem must commit to these
              principles. No exceptions. No "phased implementation." These are
              requirements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-100/50 rounded-xl p-6">
                <h3 className="font-medium text-brand-900 mb-2">
                  Equal Base Salary
                </h3>
                <p className="text-brand-600 text-sm">
                  Every employee, regardless of role, earns the same base
                  salary. Currently $70,000/year across the ecosystem.
                </p>
              </div>
              <div className="bg-brand-100/50 rounded-xl p-6">
                <h3 className="font-medium text-brand-900 mb-2">
                  100% Profit Sharing
                </h3>
                <p className="text-brand-600 text-sm">
                  After expenses, 75% of profit is distributed equally among
                  employees. 25% is saved for stability and growth.
                </p>
              </div>
              <div className="bg-brand-100/50 rounded-xl p-6">
                <h3 className="font-medium text-brand-900 mb-2">
                  Full Transparency
                </h3>
                <p className="text-brand-600 text-sm">
                  Quarterly public financial reports. Customers can see where
                  every dollar goes.
                </p>
              </div>
              <div className="bg-brand-100/50 rounded-xl p-6">
                <h3 className="font-medium text-brand-900 mb-2">
                  Equal Benefits
                </h3>
                <p className="text-brand-600 text-sm">
                  Best possible health insurance and benefits for all
                  employees. Same coverage, no tiers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future Industries */}
      <section className="py-24 section-padding bg-brand-900 text-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl mb-4">Where We're Going</h2>
            <p className="text-brand-300 text-lg">
              Industries we're actively exploring or planning to enter
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FUTURE_INDUSTRIES.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl p-6 text-center ${
                  industry.status === "exploring"
                    ? "bg-brand-800/50 border border-brand-700"
                    : "bg-brand-800/20 border border-brand-800"
                }`}
              >
                <p className="font-medium text-white mb-1">{industry.name}</p>
                <p className="text-xs text-brand-400 uppercase tracking-wide">
                  {industry.status === "exploring" ? "Exploring" : "Future"}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-brand-400 mb-6">
              Have an idea for an industry we should enter?
            </p>
            <Link
              href="/ecosystem/suggest"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-600 text-brand-300 rounded-full hover:border-brand-400 hover:text-white transition-colors"
            >
              Suggest an Industry
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Current Companies */}
      <section className="py-24 section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-brand-900 mb-4">
              The Ecosystem Today
            </h2>
            <p className="text-brand-600 text-lg">
              Companies currently operating under Revolution principles
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-200 text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="font-display text-3xl text-accent-600">R</span>
              </div>
              <h3 className="font-display text-2xl text-brand-900 mb-2">
                Revolution Clothing
              </h3>
              <p className="text-accent-600 mb-4">Founding Company</p>
              <p className="text-brand-600 mb-6">
                Where it all began. Proving the model works in fashion before
                expanding to new industries.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div>
                  <p className="text-2xl font-display text-brand-900">8</p>
                  <p className="text-brand-500">Team Members</p>
                </div>
                <div className="w-px h-10 bg-brand-200" />
                <div>
                  <p className="text-2xl font-display text-brand-900">2024</p>
                  <p className="text-brand-500">Founded</p>
                </div>
                <div className="w-px h-10 bg-brand-200" />
                <div>
                  <p className="text-2xl font-display text-brand-900">$70k</p>
                  <p className="text-brand-500">Equal Salary</p>
                </div>
              </div>
            </div>

            <p className="text-center text-brand-500 mt-8">
              More companies coming soon. This is just the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 section-padding bg-brand-950 text-white">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Users className="w-12 h-12 text-accent-400 mx-auto mb-6" />
            <h2 className="font-display text-4xl mb-6">
              Ready to Build Something Different?
            </h2>
            <p className="text-brand-300 text-lg mb-8 max-w-2xl mx-auto">
              Whether you want to transform your existing company or start
              something new, we want to hear from you. The revolution needs
              leaders.
            </p>
            <Link
              href="/ecosystem/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full text-lg font-medium hover:bg-accent-600 transition-colors"
            >
              Start a Conversation
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
