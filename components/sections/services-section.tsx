"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import FadeIn from "@/components/fade-in";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { services, serviceTabs } from "@/data/services";

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredServices = services.filter(
    (service) => activeTab === "all" || service.category === activeTab
  );

  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <FadeIn direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-accent mb-8">
              Our Service
            </h2>
          </FadeIn>

          {/* Service Tabs */}
          <FadeIn direction="up" delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {serviceTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  {tab.name}
                </motion.button>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Services Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredServices.map((service, index) => (
                <CarouselItem
                  key={service.id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.3 },
                    }}
                    className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col border border-border"
                  >
                    {/* Service Image */}
                    <div className="relative w-full h-64 bg-gray-100 overflow-hidden group flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                      >
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Service Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-accent mb-3">
                        {service.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        {[...Array(service.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      {/* Price */}
                      <div className="mt-auto">
                        <p className="text-lg font-semibold text-foreground">
                          Start From {service.price}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Mobile/Tablet Navigation - Inside container */}
            <CarouselPrevious className="flex md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-card/90 hover:bg-card shadow-lg border border-border h-10 w-10" />
            <CarouselNext className="flex md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-card/90 hover:bg-card shadow-lg border border-border h-10 w-10" />
            {/* Desktop Navigation - Outside container */}
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
