"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Instagram, Twitter, Linkedin } from "lucide-react";
import type { TeamMember } from "@/types";

const TEAM_MEMBERS: Record<string, TeamMember & { fullBio: string }> = {
  "sarah-chen": {
    id: "1",
    slug: "sarah-chen",
    name: "Sarah Chen",
    role: "Founder",
    title: "Founder & Creative Director",
    quote: "Every thread tells a story. Every story shapes who we become.",
    bio: "I started Revolution in my garage with a single sewing machine and a belief that fashion should mean something more than just looking good.",
    fullBio: `Growing up, I watched my grandmother transform simple fabrics into works of art. Her hands moved with a precision that could only come from decades of practice, but more importantly, they moved with love. Every stitch was intentional. Every seam had purpose.

When I started Revolution in 2020, I didn't just want to make clothes. I wanted to capture that same intentionality—that same love—and share it with the world.

The journey hasn't been easy. There were months when I questioned everything. Nights spent wondering if anyone would care about what we were building. But every time I saw someone put on one of our pieces and stand a little taller, smile a little wider, I knew we were onto something.

Today, Revolution is more than a company. It's a community of people who believe that what we wear matters—not because of the brand name or the price tag, but because of the hands that made it and the story it tells.

I'm proud of what we've built, but I'm even more excited about where we're going. Because this revolution is just getting started.`,
    funFacts: [
      "Learned to sew from my grandmother at age 8",
      "Once made a dress entirely from recycled newspapers",
      "Can name every Pantone color by number",
      "Has a secret collection of vintage buttons from the 1920s",
      "Makes her own herbal tea blends",
    ],
    heroImage: "/images/team/sarah-chen.jpg",
    gallery: [
      "/images/team/sarah-1.jpg",
      "/images/team/sarah-2.jpg",
      "/images/team/sarah-3.jpg",
      "/images/team/sarah-4.jpg",
    ],
    socialLinks: {
      instagram: "https://instagram.com/sarahchen",
      twitter: "https://twitter.com/sarahchen",
      linkedin: "https://linkedin.com/in/sarahchen",
    },
    order: 1,
    joinedAt: new Date("2020-01-01"),
  },
  "marcus-williams": {
    id: "2",
    slug: "marcus-williams",
    name: "Marcus Williams",
    role: "CTO",
    title: "Chief Technology Officer",
    quote: "Technology should serve humanity, not the other way around.",
    bio: "Before Revolution, I spent a decade building systems for tech giants. Now I build systems that help people express themselves.",
    fullBio: `I spent 10 years in Silicon Valley building technology that, honestly, didn't always make people's lives better. Algorithms designed to keep you scrolling. Systems built to maximize engagement at the cost of well-being.

When Sarah asked me to join Revolution, I saw a chance to use my skills for something different. Something meaningful. Here, technology isn't the product—it's a tool that helps people connect with the things they love.

Our virtual try-on feature? It's not about showing you a perfect version of yourself. It's about helping you see possibilities. Our website isn't designed to trick you into buying more—it's designed to tell our story and invite you to be part of it.

The tech world often forgets that behind every screen is a human being. At Revolution, we never do.`,
    funFacts: [
      "Built my first computer at 12",
      "Plays jazz piano every Sunday morning",
      "Has a collection of vintage typewriters",
      "Once debugged code in his sleep (literally)",
      "Makes a mean espresso",
    ],
    heroImage: "/images/team/marcus-williams.jpg",
    gallery: [],
    socialLinks: {
      linkedin: "https://linkedin.com/in/marcuswilliams",
    },
    order: 2,
    joinedAt: new Date("2020-03-15"),
  },
};

export default function TeamMemberPage() {
  const params = useParams();
  const memberSlug = params.member as string;
  const member = TEAM_MEMBERS[memberSlug];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="font-display text-4xl text-brand-900 mb-4">
            Team Member Not Found
          </h1>
          <Link
            href="/about"
            className="text-accent-600 hover:text-accent-700"
          >
            ← Back to Team
          </Link>
        </div>
      </div>
    );
  }

  const memberSlugs = Object.keys(TEAM_MEMBERS);
  const currentIndex = memberSlugs.indexOf(memberSlug);
  const prevMember = currentIndex > 0 ? memberSlugs[currentIndex - 1] : null;
  const nextMember =
    currentIndex < memberSlugs.length - 1
      ? memberSlugs[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Hero Section - Full Screen with Parallax */}
      <motion.section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-br from-brand-200 via-brand-100 to-accent-100"
        />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-8"
        >
          {/* Large Initial */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-40 h-40 mx-auto mb-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-2xl"
          >
            <span className="font-display text-7xl text-brand-700">
              {member.name[0]}
            </span>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-accent-500 uppercase tracking-widest text-sm mb-4"
          >
            {member.role}
          </motion.p>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-6xl md:text-8xl text-brand-900 mb-6"
          >
            {member.name}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-brand-600"
          >
            {member.title}
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-brand-400 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-brand-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Quote Section */}
      <section className="py-24 section-padding bg-brand-900 text-white">
        <div className="container-narrow">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display text-center leading-relaxed"
          >
            &ldquo;{member.quote}&rdquo;
          </motion.blockquote>
        </div>
      </section>

      {/* Full Bio Section */}
      <section className="py-24 section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="font-display text-3xl text-brand-900 mb-8">
              My Story
            </h2>
            {member.fullBio.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-brand-700 text-lg leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-24 section-padding bg-brand-100/50">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl text-brand-900 mb-8 text-center">
              Things You Might Not Know
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {member.funFacts.map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <p className="text-brand-700">{fact}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Links */}
      {member.socialLinks && (
        <section className="py-12 section-padding">
          <div className="container-narrow">
            <div className="flex items-center justify-center gap-6">
              {member.socialLinks.instagram && (
                <a
                  href={member.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-brand-100 rounded-full text-brand-600 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {member.socialLinks.twitter && (
                <a
                  href={member.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-brand-100 rounded-full text-brand-600 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {member.socialLinks.linkedin && (
                <a
                  href={member.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-brand-100 rounded-full text-brand-600 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="py-12 section-padding border-t border-brand-200">
        <div className="container-wide">
          <div className="flex items-center justify-between">
            {prevMember ? (
              <Link
                href={`/about/${prevMember}`}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/about"
              className="text-brand-600 hover:text-brand-900 transition-colors"
            >
              Back to Team
            </Link>

            {nextMember ? (
              <Link
                href={`/about/${nextMember}`}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-900 transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
