"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/fade-in";
import { driverRequirements } from "@/data/stats";
import { DRIVER_REGISTRATION_URL } from "@/lib/constants";

export default function JoinDriverSection() {
  return (
    <section id="join-driver" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              JOIN AS A DRIVER
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Dapatkan kesempatan untuk menghasilkan uang dengan fleksibel.
              Bergabunglah dengan komunitas driver kami yang profesional dan
              terpercaya.
            </p>
          </FadeIn>

          {/* Requirements */}
          <FadeIn direction="up" delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-background rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto shadow-sm border border-border"
            >
              <h3 className="text-xl font-semibold text-accent mb-4">
                Syarat:
              </h3>
              <ul className="space-y-3">
                {driverRequirements.map((requirement, index) => (
                  <motion.li
                    key={requirement}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-accent font-bold mt-1">•</span>
                    <span className="text-foreground">{requirement}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <motion.a
              href={DRIVER_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-lg font-semibold text-lg hover:bg-accent/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Daftar Sebagai Driver
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
