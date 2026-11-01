"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { TeamMember } from "@/types";

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    slug: "sarah-chen",
    name: "Sarah Chen",
    role: "Founder",
    title: "Founder & Creative Director",
    quote: "Every thread tells a story. Every story shapes who we become.",
    bio: "I started Revolution in my garage with a single sewing machine and a belief that fashion should mean something more than just looking good.",
    funFacts: [
      "Learned to sew from my grandmother at age 8",
      "Once made a dress entirely from recycled newspapers",
      "Can name every Pantone color by number",
    ],
    heroImage: "/images/team/sarah-chen.jpg",
    gallery: [],
    order: 1,
    joinedAt: new Date("2020-01-01"),
  },
  {
    id: "2",
    slug: "marcus-williams",
    name: "Marcus Williams",
    role: "CTO",
    title: "Chief Technology Officer",
    quote: "Technology should serve humanity, not the other way around.",
    bio: "Before Revolution, I spent a decade building systems for tech giants. Now I build systems that help people express themselves.",
    funFacts: [
      "Built my first computer at 12",
      "Plays jazz piano",
      "Has a collection of vintage typewriters",
    ],
    heroImage: "/images/team/marcus-williams.jpg",
    gallery: [],
    order: 2,
    joinedAt: new Date("2020-03-15"),
  },
  {
    id: "3",
    slug: "elena-rodriguez",
    name: "Elena Rodriguez",
    role: "Design Lead",
    title: "Head of Design",
    quote: "Good design is invisible. Great design is unforgettable.",
    bio: "I believe that design is about solving problems, not just making things pretty. Every piece we create has to work as hard as our customers do.",
    funFacts: [
      "Grew up in three different countries",
      "Collects vintage fashion magazines",
      "Makes her own natural dyes",
    ],
    heroImage: "/images/team/elena-rodriguez.jpg",
    gallery: [],
    order: 3,
    joinedAt: new Date("2020-06-01"),
  },
  {
    id: "4",
    slug: "james-okonkwo",
    name: "James Okonkwo",
    role: "Operations",
    title: "Head of Operations",
    quote: "Excellence is in the details.",
    bio: "I make sure every package that leaves our doors is perfect. Because when you order from us, you're trusting us with your expectations.",
    funFacts: [
      "Former professional basketball player",
      "Makes the best coffee in the office",
      "Has visited 47 countries",
    ],
    heroImage: "/images/team/james-okonkwo.jpg",
    gallery: [],
    order: 4,
    joinedAt: new Date("2021-01-10"),
  },
  {
    id: "5",
    slug: "david-martinez",
    name: "David Martinez",
    role: "Facilities",
    title: "Facilities Manager",
    quote: "A clean space is a creative space.",
    bio: "I take care of our space so everyone else can focus on what they do best. Every morning, I make sure this place is ready to inspire.",
    funFacts: [
      "Has been with us since day one",
      "Grows vegetables in our rooftop garden",
      "His playlists are legendary",
    ],
    heroImage: "/images/team/david-martinez.jpg",
    gallery: [],
    order: 5,
    joinedAt: new Date("2020-01-15"),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-50 pt-16">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-200 to-brand-50" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center max-w-4xl px-8"
        >
          <h1 className="font-display text-5xl md:text-7xl text-brand-900 mb-6">
            Who We Are
          </h1>
          <p className="text-xl md:text-2xl text-brand-700 leading-relaxed">
            Every person here has a story. Every story shapes our brand.
            <br />
            <span className="text-brand-600">
              We believe you should know the people behind the clothes you wear.
            </span>
          </p>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="font-display text-4xl text-brand-900 mb-8">
              Our Story
            </h2>
            <p className="text-brand-700 text-lg leading-relaxed mb-6">
              Revolution started in a small garage in 2020 with a simple idea:
              what if the clothes we wear could mean something more? What if
              every purchase connected you not just to a product, but to the
              people who made it?
            </p>
            <p className="text-brand-700 text-lg leading-relaxed mb-6">
              We&apos;re not just a clothing company. We&apos;re a community of
              makers, dreamers, and believers who think fashion should tell a
              story. Your story. Our story. The story of everyone who puts their
              heart into creating something beautiful.
            </p>
            <p className="text-brand-700 text-lg leading-relaxed">
              From our founder to our facilities manager, everyone here is part
              of the revolution. And now, so are you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-brand-100/50">
        <div className="container-wide section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-brand-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-brand-600 text-lg">
              The humans behind the brand
            </p>
          </motion.div>

          <div className="space-y-32">
            {TEAM_MEMBERS.map((member, index) => (
              <TeamMemberFeature
                key={member.id}
                member={member}
                isReversed={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-24 section-padding bg-brand-900 text-white">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl mb-6">
              Want to Join the Revolution?
            </h2>
            <p className="text-brand-300 text-lg mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for passionate people who believe in
              what we do. Check out our open positions and become part of the
              story.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function TeamMemberFeature({
  member,
  isReversed,
}: {
  member: TeamMember;
  isReversed: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-center`}
    >
      {/* Image */}
      <motion.div
        style={{ y }}
        className="w-full lg:w-1/2 aspect-[3/4] max-w-md"
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-brand-200 to-brand-300 shadow-2xl">
          {/* Placeholder for actual image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-brand-500">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-brand-400/30 flex items-center justify-center">
                <span className="text-5xl">{member.name[0]}</span>
              </div>
              <p className="text-lg">{member.role}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div>
          <p className="text-accent-500 text-sm uppercase tracking-widest mb-2">
            {member.role}
          </p>
          <h3 className="font-display text-4xl text-brand-900">{member.name}</h3>
          <p className="text-brand-600">{member.title}</p>
        </div>

        <blockquote className="text-2xl text-brand-800 italic border-l-4 border-accent-400 pl-6">
          &ldquo;{member.quote}&rdquo;
        </blockquote>

        <p className="text-brand-700 leading-relaxed">{member.bio}</p>

        {/* Fun Facts */}
        <div className="bg-white/50 rounded-xl p-6">
          <p className="text-sm font-medium text-brand-600 mb-3">
            Fun Facts About {member.name.split(" ")[0]}
          </p>
          <ul className="space-y-2">
            {member.funFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-brand-700">
                <span className="text-accent-500 mt-1">•</span>
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/about/${member.slug}`}
          className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium transition-colors"
        >
          Read {member.name.split(" ")[0]}&apos;s Full Story
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
