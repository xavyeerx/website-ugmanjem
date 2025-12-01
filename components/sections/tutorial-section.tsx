"use client";

import Image from "next/image";
import FadeIn from "@/components/fade-in";
import ParallaxSection from "@/components/parallax-section";
import { tutorialSteps } from "@/data/stats";

export default function TutorialSection() {
  return (
    <section id="tutorial" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Mockup Images */}
          <FadeIn direction="left" className="flex justify-center">
            <ParallaxSection offset={30}>
              <div className="relative w-full max-w-2xl">
                <div className="relative w-full">
                  <Image
                    src="/images/anjem_mockup_iphone.png"
                    alt="UGM Anjem WhatsApp Mockup"
                    width={700}
                    height={840}
                    className="w-full h-auto object-contain"
                    style={{
                      mixBlendMode: "multiply",
                    }}
                  />
                </div>
              </div>
            </ParallaxSection>
          </FadeIn>

          {/* How To Order Content */}
          <div>
            <FadeIn direction="right">
              <h2 className="text-3xl md:text-4xl font-bold text-accent mb-6 md:mb-8">
                How To Order?
              </h2>
            </FadeIn>

            <div className="space-y-5 md:space-y-6">
              {tutorialSteps.map((step, index) => (
                <FadeIn
                  key={step.step}
                  direction="right"
                  delay={0.1 * (index + 1)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full text-base font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-accent mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                        {step.link && (
                          <>
                            {" "}
                            <a
                              href={step.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent underline hover:text-accent/80 font-semibold"
                            >
                              {step.link.text}
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
