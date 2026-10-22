"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, DollarSign, Users, PieChart, Shield } from "lucide-react";

export default function MissionPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-brand-950 text-white">
      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900 to-brand-950" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center max-w-4xl px-8"
        >
          <p className="text-accent-400 uppercase tracking-widest text-sm mb-6">
            Why We Exist
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
            The Revolution
            <br />
            <span className="text-accent-400">Isn't a Metaphor</span>
          </h1>
          <p className="text-xl md:text-2xl text-brand-300 max-w-2xl mx-auto">
            We're building proof that another way is possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-brand-600 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-brand-600 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* The Problem */}
      <section className="py-32 section-padding bg-brand-950">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display text-4xl md:text-5xl text-white mb-12">
              The Problem
            </h2>

            <p className="text-xl text-brand-300 leading-relaxed">
              We live in a country that fosters and rewards profit above
              everything else. There is little to do about this from a
              democratic point of view.
            </p>

            <p className="text-xl text-brand-300 leading-relaxed">
              Our government is bought and paid for with two goals in mind:{" "}
              <span className="text-white font-medium">profit</span> or{" "}
              <span className="text-white font-medium">power</span>.
            </p>

            <p className="text-xl text-brand-300 leading-relaxed">
              That is America.
            </p>

            <p className="text-xl text-brand-300 leading-relaxed">
              Corruption runs deeper than we can imagine, and it's why these two
              goals will never change. War is profit and power. To become
              emperor of Rome, you needed a big army. To win favor with their
              people, you needed to bring back the spoils of war.
            </p>

            <p className="text-2xl text-white font-display mt-12">
              It goes deeper than the US.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Response */}
      <section className="py-32 section-padding bg-brand-900">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-white mb-8">
              Our Response
            </h2>

            <p className="text-xl text-brand-300 leading-relaxed mb-8">
              That is why we are building a company with{" "}
              <span className="text-accent-400 font-medium">
                political aims in mind from day one
              </span>
              . We aim to revolutionize capitalism within the clothing industry.
            </p>

            <p className="text-2xl text-white font-display">
              We're not here to play the game better.
              <br />
              We're here to change the rules.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-32 section-padding bg-brand-950">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Our Commitments
            </h2>
            <p className="text-brand-400 text-lg">
              Not promises. Not values. Commitments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Transparency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-brand-900/50 rounded-2xl p-8 border border-brand-800"
            >
              <div className="w-14 h-14 bg-accent-500/20 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="font-display text-2xl text-white mb-4">
                Radical Transparency
              </h3>
              <p className="text-brand-300 leading-relaxed mb-6">
                Our company is fully transparent with all money we earn and
                spend. You can see exactly where your dollar goes.
              </p>
              <ul className="space-y-2 text-brand-400 text-sm">
                <li>• Quarterly financial reports</li>
                <li>• Material costs breakdown</li>
                <li>• Employee compensation totals</li>
                <li>• Advertising & operational spend</li>
              </ul>
            </motion.div>

            {/* Equal Pay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-900/50 rounded-2xl p-8 border border-brand-800"
            >
              <div className="w-14 h-14 bg-accent-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="font-display text-2xl text-white mb-4">
                Equal Pay. No Exceptions.
              </h3>
              <p className="text-brand-300 leading-relaxed mb-6">
                Every employee—from customer service to design—earns the same
                base salary. Not "competitive." Not "based on experience."
              </p>
              <div className="bg-brand-800/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-display text-accent-400">$70,000</p>
                <p className="text-brand-400 text-sm mt-1">
                  Base salary for everyone
                </p>
              </div>
              <p className="text-brand-400 text-sm mt-4">
                + Best possible health insurance
                <br />+ Same benefits for all
              </p>
            </motion.div>

            {/* Profit Sharing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-brand-900/50 rounded-2xl p-8 border border-brand-800"
            >
              <div className="w-14 h-14 bg-accent-500/20 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="font-display text-2xl text-white mb-4">
                100% Profit Sharing
              </h3>
              <p className="text-brand-300 leading-relaxed mb-6">
                After expenses, profit goes to the people who do the work. Not
                executives. Not shareholders. Employees.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-full bg-brand-800 rounded-full h-3">
                    <div
                      className="bg-brand-600 h-3 rounded-full"
                      style={{ width: "25%" }}
                    />
                  </div>
                  <span className="text-brand-400 text-sm w-20">25% Saved</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-brand-800 rounded-full h-3">
                    <div
                      className="bg-accent-500 h-3 rounded-full"
                      style={{ width: "75%" }}
                    />
                  </div>
                  <span className="text-accent-400 text-sm w-20">
                    75% Shared
                  </span>
                </div>
              </div>
              <p className="text-brand-400 text-sm mt-4">
                Distributed quarterly. Equally. To everyone.
              </p>
            </motion.div>
          </div>

          {/* Compensation Cap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-brand-800/30 rounded-2xl p-8 border border-brand-700"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <h3 className="font-display text-2xl text-white mb-4">
                  Maximum Compensation: $400,000
                </h3>
                <p className="text-brand-300 leading-relaxed mb-4">
                  Total compensation (salary + profit share) is capped at $400,000 per person per year.
                  This is directly tied to our mission of reducing greed within capitalism.
                </p>
                <p className="text-brand-300 leading-relaxed">
                  We want to make money—but we also want the opportunity to help others in the world 
                  while doing so. We don't expect to hit our cap, but if we do, we'll have more than 
                  enough to live a great life and focus on what actually matters.
                </p>
              </div>
              <div className="bg-brand-900/50 rounded-xl p-6 text-center border border-brand-700">
                <p className="text-brand-400 text-sm mb-2">Adjusted annually by</p>
                <p className="text-2xl font-display text-accent-400">Real Cost of Living</p>
                <p className="text-brand-500 text-xs mt-2">Not government CPI</p>
              </div>
            </div>

            {/* What the cap means */}
            <div className="mt-6 pt-6 border-t border-brand-700">
              <p className="text-white font-medium mb-4">
                What $400,000 means: freedom to focus on life, not accumulation.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-brand-900/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  <p className="text-brand-300 text-sm mt-2">Family time</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">🎨</span>
                  <p className="text-brand-300 text-sm mt-2">Creative pursuits</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">🏔️</span>
                  <p className="text-brand-300 text-sm mt-2">Hobbies & travel</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">🤝</span>
                  <p className="text-brand-300 text-sm mt-2">Helping others</p>
                </div>
              </div>
              <p className="text-brand-400 text-sm">
                You shouldn't be worrying about affording the next new car, the biggest house, or the 
                latest phone. You have plenty for food, shelter, occasional travel, and the things 
                that make life worth living.
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-brand-700">
              <p className="text-sm text-brand-400 mb-4">
                Cap adjusts annually based on real costs that real people pay:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-900/30 rounded-lg p-3 text-center">
                  <span className="text-xl">🏠</span>
                  <p className="text-brand-300 text-sm mt-1">Housing Index</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-3 text-center">
                  <span className="text-xl">🥛</span>
                  <p className="text-brand-300 text-sm mt-1">Gallon of Milk</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-3 text-center">
                  <span className="text-xl">🥚</span>
                  <p className="text-brand-300 text-sm mt-1">Carton of Eggs</p>
                </div>
                <div className="bg-brand-900/30 rounded-lg p-3 text-center">
                  <span className="text-xl">⛽</span>
                  <p className="text-brand-300 text-sm mt-1">Gallon of Gas</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Family & Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-brand-900/50 rounded-2xl p-8 border border-brand-800">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">👶</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-4">
                6 Months Parental Leave
              </h3>
              <p className="text-brand-300 leading-relaxed mb-4">
                We encourage family-making. After 12 months at the company, all parents get 
                6 months of paid parental leave. Birth, adoption, fostering—all count.
              </p>
              <p className="text-brand-400 text-sm">
                Because your family should never compete with your paycheck.
              </p>
            </div>

            <div className="bg-brand-900/50 rounded-2xl p-8 border border-brand-800">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-4">
                Best Possible Healthcare
              </h3>
              <p className="text-brand-300 leading-relaxed mb-4">
                The same health insurance for everyone—the best we can provide. No tiers, 
                no "executive plans." Your health isn't worth less because of your job title.
              </p>
              <p className="text-brand-400 text-sm">
                Full coverage for you and your family.
              </p>
            </div>
          </motion.div>

          {/* Retirement Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-brand-800/20 rounded-xl p-6 border border-brand-700/50"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🔮</span>
              <div>
                <h4 className="text-white font-medium mb-2">Retirement: We're Working On It</h4>
                <p className="text-brand-400 text-sm">
                  We believe everyone deserves a secure retirement, but we haven't figured out 
                  the best approach yet. Traditional 401(k)s have problems. We're exploring 
                  alternatives that align with our values. This section will update as we 
                  develop a solution worth implementing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-32 section-padding bg-brand-900">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display text-4xl md:text-5xl text-white mb-12">
              Why This Matters
            </h2>

            <p className="text-xl text-brand-300 leading-relaxed">
              Most companies exist to{" "}
              <span className="text-white">extract value</span>. They take your
              labor, your creativity, your time—and they give the profits to
              people who already have more than they need.
            </p>

            <p className="text-xl text-brand-300 leading-relaxed">
              We believe a company can exist to{" "}
              <span className="text-accent-400 font-medium">
                distribute value
              </span>{" "}
              instead.
            </p>

            <div className="bg-brand-800/50 rounded-2xl p-8 my-12 border-l-4 border-accent-500">
              <p className="text-2xl text-white font-display leading-relaxed">
                When you buy from us, you're not making a CEO richer. You're
                funding a different way of doing business. You're voting with
                your wallet for a world where work is rewarded fairly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 section-padding bg-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent-500 rounded-full blur-3xl" />
        </div>

        <div className="container-narrow relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent-400 uppercase tracking-widest text-sm mb-6">
              This is not a slogan
            </p>
            <h2 className="font-display text-5xl md:text-6xl text-white mb-8">
              Every shirt we sell.
              <br />
              Every person we hire.
              <br />
              Every dollar we share.
            </h2>
            <p className="text-2xl text-brand-300 mb-12">This is the revolution.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full text-lg font-medium hover:bg-accent-600 transition-colors"
              >
                Shop the Revolution
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 px-8 py-4 border border-brand-600 text-brand-300 rounded-full text-lg hover:border-brand-400 hover:text-white transition-colors"
              >
                See Our Finances
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
