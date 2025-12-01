"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HERO_BACKGROUND_URL } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax Effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 1.6 }}
        className="absolute inset-0 w-full h-full bg-primary"
        style={{
          backgroundImage: `url(${HERO_BACKGROUND_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "25% center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Animated Background Elements */}
      <FloatingElements />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Content centered */}
          <div className="flex flex-col items-center text-center max-w-2xl">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6 drop-shadow-lg px-4"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.0 }}
                className="block whitespace-nowrap"
              >
                Antar Jemput & Jastip
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.2 }}
                className="block text-balance"
              >
                Mahasiswa UGM
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
              className="text-base sm:text-lg md:text-xl text-white drop-shadow-md mb-8 md:mb-12 px-4"
            >
              Solusi mobilitas & jastipan terpercaya barisan mahasiswa UGM.
              Semua bisa cuma lewat satu chat. #ChatKamiAja
            </motion.p>

            {/* Animated Indicators */}
            <AnimatedIndicators />

            {/* Scroll Indicator - Hidden on mobile */}
            <ScrollIndicator />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles with different animations */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-32 right-20 w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm"
      />
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 right-10 w-4 h-4 rounded-full bg-white/20"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, 20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-40 left-1/4 w-5 h-5 rounded-full border-2 border-white/30"
      />

      {/* Additional decorative elements */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-40 right-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/30 backdrop-blur-sm"
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute bottom-1/4 left-20 w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm"
      />
    </div>
  );
}

function AnimatedIndicators() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2.8 }}
      className="flex items-center gap-3 mb-8"
    >
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 2.9 }}
          className="w-8 h-8 rounded-full bg-white/40 border-2 border-primary flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 3.1 }}
            className="w-5 h-5 text-accent"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 3.0 }}
          className="w-6 h-6 rounded-full bg-primary"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 3.1 }}
          className="w-6 h-6 rounded-full bg-white/40"
        />
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 3.2 }}
        className="w-6 h-6 rounded-full bg-white/40"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 3.3 }}
        className="w-4 h-4 rounded-full bg-white/40"
      />
    </motion.div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 3.4 }}
      className="hidden md:flex flex-col items-center gap-2"
    >
      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-white/70 text-sm font-medium"
      >
        Scroll Down
      </motion.div>
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="w-6 h-6 text-white/70" />
      </motion.div>
    </motion.div>
  );
}
