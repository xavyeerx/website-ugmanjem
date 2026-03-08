"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import FadeIn from "@/components/fade-in";
import type { Review } from "@/types";

interface ReviewSectionProps {
  reviews: Review[];
}

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  return (
    <section id="review" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FadeIn direction="up">
            <h3 className="text-lg md:text-xl font-semibold text-accent mb-2">
              REVIEWS
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold text-accent">
              Our Customer
            </h2>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <FadeIn key={review.id} direction="up" delay={0.1 * (index + 1)}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative rounded-2xl overflow-visible h-[500px]"
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src={review.backgroundImage}
                    alt="Review Background"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-card rounded-xl shadow-2xl p-6 flex flex-col justify-between text-center border border-border">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-accent text-center mb-1">
                    {review.name}
                  </h4>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {review.affiliation}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-4 flex-grow text-center h-[90px] flex items-center justify-center">
                    {review.review}
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
