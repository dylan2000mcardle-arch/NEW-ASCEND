"use client";

import { motion } from "framer-motion";
import ReviewCard from "@/components/ui/ReviewCard";
import type { Review } from "@/types";

const reviews: Review[] = [
  {
    id: "1",
    author: "ascendedchad",
    rank: "Ascended",
    text: "Day 60: I'm mogging my old drivers license photo. The jawline difference from the mouth tape is insane.",
    metric: "Jawline +2 tiers",
    days: 60,
  },
  {
    id: "2",
    author: "remmaxer",
    rank: "Elite",
    text: "Mask + Tape combo fixed my persistent under-eye hollows and facial bloat. A true ascension stack.",
    metric: "Under-eye -80%",
    days: 45,
  },
  {
    id: "3",
    author: "structuraldev",
    rank: "Tier 2",
    text: "Sleep quality went from 62 to 94 on my Oura. The blackout mask is the single highest ROI biohack I've tried.",
    metric: "Sleep Score 94",
    days: 30,
  },
  {
    id: "4",
    author: "cortisol_min",
    rank: "Elite",
    text: "Morning cortisol dropped 34% after 3 weeks. Face puffiness gone. Looking lean and defined every morning now.",
    metric: "Cortisol -34%",
    days: 21,
  },
  {
    id: "5",
    author: "mewingmaxxer",
    rank: "Tier 1",
    text: "The mouth tape forced me to nose breathe consistently. Combined with mewing, my maxilla is noticeably more forward.",
    metric: "Forward Growth ++",
    days: 90,
  },
  {
    id: "6",
    author: "zenith_state",
    rank: "Ascended",
    text: "Growth hormone optimization is real. My skin texture completely changed — zero breakouts, tight pores, glowing.",
    metric: "GH +41%",
    days: 120,
  },
];

export default function SocialProofSection() {
  return (
    <section id="community" className="scroll-mt-20 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Community Protocol Logs
          </p>
          <h2 className="mb-4 font-mono text-3xl font-bold text-white md:text-5xl">
            Verified <span className="text-glow-cyan text-cyan">Ascension</span>{" "}
            Reports
          </h2>
          <p className="mx-auto max-w-md text-sm text-foreground/40">
            Real results from the ASCND community. Tracked. Measured. Verified.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
