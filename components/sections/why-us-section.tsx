"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/fade-in";
import { stats, features } from "@/data/stats";

export default function WhyUsSection() {
  return (
    <section
      id="why-us"
      className="py-16 md:py-24 bg-background relative -mt-1"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Title */}
          <FadeIn direction="left" className="md:col-span-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent leading-tight">
              Why
              <br />
              Choosing Us
            </h2>
          </FadeIn>

          {/* Features Cards */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <FadeIn
                  key={feature.title}
                  direction="up"
                  delay={0.1 * (index + 1)}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-accent mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <FadeIn key={stat.label} direction="up" delay={0.1 * (index + 1)}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    {/* Badge shape */}
                    <svg
                      width="60"
                      height="36"
                      viewBox="0 0 80 48"
                      fill="none"
                      className="text-accent"
                    >
                      <path
                        d="M40 0L50 12H70C75.5228 12 80 16.4772 80 22V38C80 43.5228 75.5228 48 70 48H10C4.47715 48 0 43.5228 0 38V22C0 16.4772 4.47715 12 10 12H30L40 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3">
                  {stat.value}
                </p>
                <p className="font-semibold text-base md:text-lg text-accent">
                  {stat.label}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
