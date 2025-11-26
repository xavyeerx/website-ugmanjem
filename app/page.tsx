"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight, Star, Cloud, Moon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import FadeIn from "@/components/fade-in";
import ParallaxSection from "@/components/parallax-section";
import AnimatedCard from "@/components/animated-card";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { name: "Home", id: "home" },
  { name: "Why Us", id: "why-us" },
  { name: "Tutorial", id: "tutorial" },
  { name: "Services", id: "services" },
  { name: "Pricelist", id: "pricelist" },
  { name: "Review", id: "review" },
  { name: "Join Driver", id: "join-driver" },
  { name: "Contact Us", id: "contact-us" },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [activeServiceTab, setActiveServiceTab] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  // Price calculator states
  const [serviceType, setServiceType] = useState("antar-jemput");
  const [distance, setDistance] = useState("");
  const [isRainy, setIsRainy] = useState(false);
  const [isEarlyMorning, setIsEarlyMorning] = useState(false);

  const serviceDescriptions: Record<string, string> = {
    "antar-jemput":
      "Butuh dianter atau dijemput ke kampus? Kamu bisa pesan driver buat antar sampai tujuan kok!",
    jastip:
      "Mager keluar tapi pengen sesuatu? Kamu bisa titip driver buat beliin lhoo!",
  };

  // Calculate estimated price
  const calculatePrice = () => {
    const distanceNum = parseFloat(distance) || 0;
    // 1000 meter = Rp 2.500, so 1 meter = Rp 2.5
    let basePrice = distanceNum * 2.5;

    // Minimum price
    if (basePrice < 5000) {
      basePrice = 5000;
    }

    // Add service type fee
    if (serviceType === "jastip") {
      basePrice += 1000;
    }

    // Add condition fees
    if (isRainy) {
      basePrice += 2000;
    }
    if (isEarlyMorning) {
      basePrice += 1000;
    }

    return basePrice;
  };

  const estimatedPrice = calculatePrice();

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Prevent body scroll when mobile menu or lightbox is open
  useEffect(() => {
    if (isMobileMenuOpen || lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, lightboxOpen]);

  // Handle lightbox open
  const openLightbox = (imageSrc: string) => {
    setLightboxImage(imageSrc);
    setLightboxOpen(true);
  };

  // Handle lightbox close
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Detect active section on scroll using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -50% 0px", // Offset for navbar
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#39BFDF] to-[#89DCED]">
      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-[#39BFDF] shadow-md"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-anjem-putih-k2r22UnDwCRpmIf1XgpE3ot9zNknye.png"
                alt="UNS Anjem Logo"
                width={150}
                height={60}
                className="h-20 w-auto"
              />
            </motion.button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm lg:text-base font-semibold transition-all ${
                    activeSection === section.id
                      ? "text-[#39BFDF] bg-white"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {section.name}
                </motion.button>
              ))}
            </div>

            {/* Order Button */}
            <motion.a
              href="http://wa.me/6289506606948?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UNS%20dong"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block px-6 py-2 rounded-full bg-white text-[#39BFDF] font-bold hover:bg-gray-100 transition-colors text-base shadow-lg"
            >
              Order Now
            </motion.a>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white z-50 md:hidden shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#39BFDF]">Menu</h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavClick(section.id)}
                      className={`w-full text-left px-6 py-4 font-semibold transition-colors ${
                        activeSection === section.id
                          ? "bg-[#39BFDF] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {section.name}
                    </motion.button>
                  ))}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 border-t border-gray-200">
                  <a
                    href="http://wa.me/6289506606948?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UNS%20dong"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 rounded-full bg-[#39BFDF] text-white text-center font-bold hover:bg-[#2da3c4] transition-colors"
                  >
                    Order Now
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image with Parallax Effect */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 1.6 }}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg%20utama%20motor-HjQikHPEyCYnyNSMqQZbPSZzy7nJ1W.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
          }}
        ></motion.div>

        {/* Bottom gradient fade to next section - Soft transition */}
        <div className="absolute bottom-0 left-0 right-0 h-48 md:h-56 bg-gradient-to-b from-transparent via-transparent via-[#E0F7FF]/10 via-[#E0F7FF]/25 via-[#E0F7FF]/45 via-white/60 to-white/80"></div>

        {/* Animated Background Elements */}
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
                  Mahasiswa UNS
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.4 }}
                className="text-base sm:text-lg md:text-xl text-white drop-shadow-md mb-8 md:mb-12 px-4"
              >
                Solusi mobilitas & jastipan terpercaya barisan mahasiswa UNS.
                Semua bisa cuma lewat satu chat. #ChatKamiAja
              </motion.p>

              {/* Animated Indicators */}
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
                    className="w-8 h-8 rounded-full bg-white/40 border-2 border-[#39BFDF] flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 3.1 }}
                      className="w-5 h-5 text-[#39BFDF]"
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
                    className="w-6 h-6 rounded-full bg-[#39BFDF]"
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

              {/* Scroll Indicator - Hidden on mobile */}
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
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Wave Section - Soft smooth transition */}
      <div className="h-48 md:h-56 bg-gradient-to-b from-white/80 via-white/70 via-white/55 via-white/40 via-white/25 via-white/10 to-white"></div>

      {/* Why Us Section */}
      <section
        id="why-us"
        className="py-16 md:py-24 bg-[#FFFFFF] relative -mt-1"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* Title */}
            <FadeIn direction="left" className="md:col-span-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#39BFDF] leading-tight">
                Why
                <br />
                Choosing Us
              </h2>
            </FadeIn>

            {/* Features Cards */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1 */}
                <FadeIn direction="up" delay={0.1}>
                  <div>
                    <h3 className="text-xl font-semibold text-[#39BFDF] mb-3">
                      Driver Mahasiswa
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Driver kami 100% mahasiswa UNS, jadi lebih paham wilayah
                      dalam kampus, bonus dapet relasi deh..
                    </p>
                  </div>
                </FadeIn>

                {/* Card 2 */}
                <FadeIn direction="up" delay={0.2}>
                  <div>
                    <h3 className="text-xl font-semibold text-[#39BFDF] mb-3">
                      Aman, Satset, Fleksibel
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Tinggal chat grup, kami bisa bantuin segala kebutuhanmu,
                      penolong banget buat anak perantauan.
                    </p>
                  </div>
                </FadeIn>

                {/* Card 3 */}
                <FadeIn direction="up" delay={0.3}>
                  <div>
                    <h3 className="text-xl font-semibold text-[#39BFDF] mb-3">
                      Terjangkau & Mudah Diakses
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Bantu kamu lebih irit di perantauan dengan tarif yang
                      terjangkau.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <FadeIn direction="up" delay={0.1}>
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
                      className="text-[#39BFDF]"
                    >
                      <path
                        d="M40 0L50 12H70C75.5228 12 80 16.4772 80 22V38C80 43.5228 75.5228 48 70 48H10C4.47715 48 0 43.5228 0 38V22C0 16.4772 4.47715 12 10 12H30L40 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#39BFDF] mb-3">
                  52
                </p>
                <p
                  className="font-semibold text-base md:text-lg"
                  style={{ color: "#39BFDF" }}
                >
                  Driver Active
                </p>
              </motion.div>
            </FadeIn>

            {/* Stat 2 */}
            <FadeIn direction="up" delay={0.2}>
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
                      className="text-[#39BFDF]"
                    >
                      <path
                        d="M40 0L50 12H70C75.5228 12 80 16.4772 80 22V38C80 43.5228 75.5228 48 70 48H10C4.47715 48 0 43.5228 0 38V22C0 16.4772 4.47715 12 10 12H30L40 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#39BFDF] mb-3">
                  11
                </p>
                <p
                  className="font-semibold text-base md:text-lg"
                  style={{ color: "#39BFDF" }}
                >
                  WA Group
                </p>
              </motion.div>
            </FadeIn>

            {/* Stat 3 */}
            <FadeIn direction="up" delay={0.3}>
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
                      className="text-[#39BFDF]"
                    >
                      <path
                        d="M40 0L50 12H70C75.5228 12 80 16.4772 80 22V38C80 43.5228 75.5228 48 70 48H10C4.47715 48 0 43.5228 0 38V22C0 16.4772 4.47715 12 10 12H30L40 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#39BFDF] mb-3">
                  50.000+
                </p>
                <p
                  className="font-semibold text-base md:text-lg"
                  style={{ color: "#39BFDF" }}
                >
                  Order Complete
                </p>
              </motion.div>
            </FadeIn>

            {/* Stat 4 */}
            <FadeIn direction="up" delay={0.4}>
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
                      className="text-[#39BFDF]"
                    >
                      <path
                        d="M40 0L50 12H70C75.5228 12 80 16.4772 80 22V38C80 43.5228 75.5228 48 70 48H10C4.47715 48 0 43.5228 0 38V22C0 16.4772 4.47715 12 10 12H30L40 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#39BFDF] mb-3">
                  9000+
                </p>
                <p
                  className="font-semibold text-base md:text-lg"
                  style={{ color: "#39BFDF" }}
                >
                  Members Group
                </p>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <section id="tutorial" className="py-16 md:py-24 bg-[#FFFFFF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Mockup Images */}
            <FadeIn direction="left" className="flex justify-center">
              <ParallaxSection offset={30}>
                <div className="relative w-full max-w-2xl">
                  <div
                    className="relative w-full"
                    style={{
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Image
                      src="/images/anjem_mockup_iphone.png"
                      alt="UNS Anjem WhatsApp Mockup"
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
                <h2 className="text-3xl md:text-4xl font-bold text-[#39BFDF] mb-6 md:mb-8">
                  How To Order?
                </h2>
              </FadeIn>

              <div className="space-y-5 md:space-y-6">
                {/* Step 1 */}
                <FadeIn direction="right" delay={0.1}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#39BFDF] text-white rounded-full text-base font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#39BFDF] mb-2">
                        Join WA Group
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Join WA Group komunitas UNS Anjem bareng mahasiswa UNS
                        lainnya dengan{" "}
                        <a
                          href="http://wa.me/6289506606948?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UNS%20dong"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#39BFDF] underline hover:text-[#2da3c4] font-semibold"
                        >
                          klik disini
                        </a>
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Step 2 */}
                <FadeIn direction="right" delay={0.2}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#39BFDF] text-white rounded-full text-base font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#39BFDF] mb-2">
                        Chat Order via Group
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Kirim pesan di group untuk dapat terhubung dengan driver
                        ready dengan menyebutkan kebutuhanmu. Example:{" "}
                        <span className="font-semibold italic">
                          "Mau anjem dari FIB ke kos dong"
                        </span>
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Step 3 */}
                <FadeIn direction="right" delay={0.3}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#39BFDF] text-white rounded-full text-base font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#39BFDF] mb-2">
                        Driver Akan Take Order
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Driver ready akan membales pesananmu via Personal Chat
                        (PC) dan melanjutkan detail pemesanan via PC.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Step 4 */}
                <FadeIn direction="right" delay={0.4}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#39BFDF] text-white rounded-full text-base font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#39BFDF] mb-2">
                        OTW! Bayar Langsung ke Driver
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Shareloc dan driver kami siap mencuri, bayar dengan
                        tunai atau QRIS.
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-[#FFFFFF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <FadeIn direction="up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#39BFDF] mb-8">
                Our Service
              </h2>
            </FadeIn>

            {/* Service Tabs */}
            <FadeIn direction="up" delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { id: "all", name: "All" },
                  { id: "anjem", name: "Anjem" },
                  { id: "jastip", name: "Jastip" },
                  { id: "survei", name: "Survei Kost" },
                  { id: "berkas", name: "Urus Berkas" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveServiceTab(tab.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      activeServiceTab === tab.id
                        ? "bg-[#39BFDF] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                {[
                  {
                    id: 1,
                    title: "Antar Jemput",
                    image: "/images/service-anjem.jpg",
                    rating: 5,
                    trips: "40.000+",
                    price: "RP 5K",
                    category: "anjem",
                  },
                  {
                    id: 2,
                    title: "Jasa Titip",
                    image: "/images/service-jastip.jpg",
                    rating: 5,
                    trips: "12.000+",
                    price: "RP 6k",
                    category: "jastip",
                  },
                  {
                    id: 3,
                    title: "Survei Kost",
                    image: "/images/service-survei.jpg",
                    rating: 5,
                    trips: "50+",
                    price: "RP 15k",
                    category: "survei",
                  },
                  {
                    id: 4,
                    title: "Urus Berkas Kampus",
                    image: "/images/service-berkas.jpg",
                    rating: 5,
                    trips: "200+",
                    price: "RP 15k",
                    category: "berkas",
                  },
                ]
                  .filter(
                    (service) =>
                      activeServiceTab === "all" ||
                      service.category === activeServiceTab
                  )
                  .map((service, index) => (
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
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col"
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
                                // Fallback jika gambar tidak ada
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Service Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-[#39BFDF] mb-3">
                            {service.title}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(service.rating)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.1 }}
                                >
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                </motion.div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              +{service.trips} trip done
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-auto">
                            <p className="text-lg font-semibold text-gray-800">
                              Start From {service.price}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              {/* Mobile/Tablet Navigation - Inside container */}
              <CarouselPrevious className="flex md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10" />
              <CarouselNext className="flex md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10" />
              {/* Desktop Navigation - Outside container */}
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Pricelist Section */}
      <section
        id="pricelist"
        className="py-16 md:py-24 bg-[#FFFFFF] relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Layered Images */}
            <FadeIn
              direction="left"
              className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-20 lg:mr-4"
            >
              {/* Blur Background Image */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center -z-0">
                <div className="relative w-full h-full opacity-40">
                  <Image
                    src="/images/price_anjem_blur.png"
                    alt="Pricelist Background"
                    width={600}
                    height={800}
                    className="w-full h-auto object-contain"
                    style={{
                      filter: "blur(12px)",
                      transform: "scale(1.1)",
                    }}
                  />
                </div>
              </div>

              {/* Clear Foreground Image */}
              <ParallaxSection offset={40}>
                <motion.div
                  className="relative z-10 w-full flex items-center justify-center cursor-pointer group"
                  onClick={() => openLightbox("/images/price_anjem_nov.png")}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="/images/price_anjem_nov.png"
                    alt="UNS Anjem Pricelist"
                    width={600}
                    height={800}
                    className="w-full h-auto object-contain drop-shadow-2xl transition-all group-hover:drop-shadow-3xl"
                  />
                  {/* Overlay hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-lg">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <p className="text-sm font-semibold text-[#39BFDF] flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                        Klik untuk perbesar
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ParallaxSection>
            </FadeIn>

            {/* Right Side - Price Calculator */}
            <FadeIn direction="right" className="flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-3xl md:text-4xl font-bold text-[#39BFDF] mb-2">
                  Mau Ke Tujuan Lain?
                </h3>
                <h4 className="text-lg md:text-xl font-semibold text-[#39BFDF]/70">
                  CEK RUTEMU DISINI
                </h4>
              </div>

              {/* Service Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">
                  Pilih Layanan
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="service"
                      value="antar-jemput"
                      checked={serviceType === "antar-jemput"}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-5 h-5 text-[#39BFDF] focus:ring-[#39BFDF]"
                    />
                    <span className="text-black">Anjem (Antar Jemput)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="service"
                      value="jastip"
                      checked={serviceType === "jastip"}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-5 h-5 text-[#39BFDF] focus:ring-[#39BFDF]"
                    />
                    <span className="text-black">Jastip (Jasa Titip)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  {serviceDescriptions[serviceType]}
                </p>
              </div>

              {/* Distance Input */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">
                  Jarak (Meter)
                </h4>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39BFDF] focus:border-transparent"
                />
              </div>

              {/* Optional Conditions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">
                  Kondisi Opsional
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsRainy(!isRainy)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors ${
                      isRainy
                        ? "bg-[#39BFDF] text-white border-[#39BFDF]"
                        : "bg-white text-black border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Cloud className="w-5 h-5" />
                    <span className="text-sm font-medium">Hujan</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setIsEarlyMorning(!isEarlyMorning)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors ${
                      isEarlyMorning
                        ? "bg-[#39BFDF] text-white border-[#39BFDF]"
                        : "bg-white text-black border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Dini Hari (Jam &gt;22:00)
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Estimated Price */}
              <div className="bg-[#39BFDF] rounded-lg p-4 space-y-2 max-w-md">
                <div>
                  <span className="text-sm text-white/90 font-semibold">
                    Estimasi Biaya
                  </span>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    Rp. {estimatedPrice.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed ">
                  Harga ini berupa estimasi. Faktor cuaca, waktu, dan kondisi
                  lain dapat mempengaruhi perubahan harga. Silakan tanyakan ke
                  driver untuk detail pastinya.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section id="review" className="py-16 md:py-24 bg-[#FFFFFF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <FadeIn direction="up">
              <h3 className="text-lg md:text-xl font-semibold text-[#39BFDF] mb-2">
                REVIEWS
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-[#39BFDF]">
                Our Customer
              </h2>
            </FadeIn>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Review 1 - Zaskia Sakeena */}
            <FadeIn direction="up" delay={0.1}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative rounded-2xl overflow-visible h-[500px]"
              >
                {/* Background Image - Full visible */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/review1.png"
                    alt="Review Background"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* White Card - Floating on top */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative">
                      <Image
                        src="/images/pp-woman.png"
                        alt="Zaskia Sakeena"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <h4 className="text-lg font-bold text-[#39BFDF] text-center mb-1">
                    Zaskia Sakeena
                  </h4>
                  {/* Affiliation */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Mahasiswa FIB 22
                  </p>
                  {/* Review Text */}
                  <p className="text-sm text-black leading-relaxed mb-4 flex-grow text-center h-[90px] flex items-center justify-center">
                    Buat aku anjem ga cuma anter sana-sini, tapi kalian bantu
                    beberapa kebutuhan mahasiswa untuk survive di dunia
                    perkuliahan. Sukses terus!
                  </p>
                  {/* Rating */}
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Review 2 - Rahmat */}
            <FadeIn direction="up" delay={0.2}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative rounded-2xl overflow-visible h-[500px]"
              >
                {/* Background Image - Full visible */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/review2.png"
                    alt="Review Background"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* White Card - Floating on top */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative">
                      <Image
                        src="/images/pp-man.png"
                        alt="Rahmat"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <h4 className="text-lg font-bold text-[#39BFDF] text-center mb-1">
                    Rahmat
                  </h4>
                  {/* Affiliation */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Mahasiswa FT 24
                  </p>
                  {/* Review Text */}
                  <p className="text-sm text-black leading-relaxed mb-4 flex-grow text-center h-[90px] flex items-center justify-center">
                    Anjem udah kayak daily use buat aku yang gaada kendaraan di
                    Solo, good job buat Anjem UNS
                  </p>
                  {/* Rating */}
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Review 3 - Firda Zamarin */}
            <FadeIn direction="up" delay={0.3}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative rounded-2xl overflow-visible h-[500px]"
              >
                {/* Background Image - Full visible */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/review3.png"
                    alt="Review Background"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* White Card - Floating on top */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative">
                      <Image
                        src="/images/pp-woman.png"
                        alt="Firda Zamarin"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <h4 className="text-lg font-bold text-[#39BFDF] text-center mb-1">
                    Firda Zamarin
                  </h4>
                  {/* Affiliation */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Mahasiswa SV 21 (Mitra Driver)
                  </p>
                  {/* Review Text */}
                  <p className="text-sm text-black leading-relaxed mb-4 flex-grow text-center h-[90px] flex items-center justify-center">
                    Makasih banyak udah kasih ruang buat nambah penghasilan
                    lewat sini, jujur ngebantu banget buat sehari-hari.
                  </p>
                  {/* Rating */}
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Join Driver Section */}
      <section id="join-driver" className="py-16 md:py-24 bg-[#FFFFFF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-[#39BFDF] mb-4">
                Bergabung Sebagai Driver
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Dapatkan kesempatan untuk menghasilkan uang dengan fleksibel.
                Bergabunglah dengan komunitas driver kami yang profesional dan
                terpercaya.
              </p>
            </FadeIn>

            {/* Requirements */}
            <FadeIn direction="up" delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#39BFDF] mb-4">
                  Syarat:
                </h3>
                <ul className="space-y-3">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[#39BFDF] font-bold mt-1">•</span>
                    <span className="text-gray-700">Mahasiswa UNS</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[#39BFDF] font-bold mt-1">•</span>
                    <span className="text-gray-700">
                      Memiliki kendaraan bersurat lengkap
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[#39BFDF] font-bold mt-1">•</span>
                    <span className="text-gray-700">
                      Komitmen dan banyak waktu luang
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <motion.a
                href="https://docs.google.com/forms/d/e/1FAIpQLScYtE_jGuboPeuGGW0PfmFyxo3CSzCuCDJIq0AvEOg8Y71UBw/viewform"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#39BFDF] text-white rounded-lg font-semibold text-lg hover:bg-[#2da3c4] transition-colors shadow-lg hover:shadow-xl"
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

      {/* Footer - Gojek Style */}
      <footer id="contact-us" className="bg-[#FAFAFA] py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* Company */}
            <FadeIn direction="up" delay={0.15}>
              <div>
                <h4 className="text-base font-bold text-[#39BFDF] mb-4">
                  Company
                </h4>
                <ul className="space-y-3">
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#why-us"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      About
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#services"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Products
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#review"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Blog
                    </motion.a>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Services */}
            <FadeIn direction="up" delay={0.2}>
              <div>
                <h4 className="text-base font-bold text-[#39BFDF] mb-4">
                  Services
                </h4>
                <ul className="space-y-3">
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#services"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Antar Jemput
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#services"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Jasa Titip
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#services"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Survei Kost
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#services"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Urus Berkas
                    </motion.a>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Quick Links */}
            <FadeIn direction="up" delay={0.25}>
              <div>
                <h4 className="text-base font-bold text-[#39BFDF] mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#tutorial"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Tutorial
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#pricelist"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Pricelist
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#join-driver"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Join Driver
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#review"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Review
                    </motion.a>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Get in touch */}
            <FadeIn direction="up" delay={0.3}>
              <div>
                <h4 className="text-base font-bold text-[#39BFDF] mb-4">
                  Get in touch
                </h4>
                <ul className="space-y-3">
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="http://wa.me/6289506606948?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UNS%20dong"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Help Center
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      href="#home"
                      className="text-sm text-gray-600 hover:text-[#39BFDF] transition-colors inline-block"
                    >
                      Our Location
                    </motion.a>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>

          {/* Connect with Us - Social Media */}
          <FadeIn direction="up" delay={0.35}>
            <div className="border-t border-gray-300 pt-8">
              <h4 className="text-base font-bold text-[#39BFDF] mb-6">
                Connect with Us
              </h4>
              <div className="flex items-center gap-4">
                {/* WhatsApp */}
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.2 }}
                  href="http://wa.me/6289506606948?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UNS%20dong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-[#39BFDF] transition-colors group"
                >
                  <Image
                    src="/images/logo-wa.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 group-hover:opacity-100"
                  />
                </motion.a>

                {/* Instagram */}
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.2 }}
                  href="https://www.instagram.com/uns_anjem?igsh=MTRqdDA5bmd3N3hjZA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-[#39BFDF] transition-colors group"
                >
                  <Image
                    src="/images/logo-instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 group-hover:opacity-100"
                  />
                </motion.a>

                {/* TikTok */}
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.2 }}
                  href="https://www.tiktok.com/@unsanjem?_r=1&_t=ZS-91iIlD9vRNX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-[#39BFDF] transition-colors group"
                >
                  <Image
                    src="/images/logo-tiktok.png"
                    alt="TikTok"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 group-hover:opacity-100"
                  />
                </motion.a>

                {/* Twitter */}
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.2 }}
                  href="https://x.com/uns_anjem?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-[#39BFDF] transition-colors group"
                >
                  <Image
                    src="/images/logo-twitter.png"
                    alt="Twitter"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 group-hover:opacity-100"
                  />
                </motion.a>
              </div>
            </div>
          </FadeIn>

          {/* Copyright */}
          <FadeIn direction="up" delay={0.4}>
            <div className="border-t border-gray-300 mt-8 pt-8">
              <p className="text-sm text-gray-500 text-center">
                © 2025 UNS Anjem. All rights reserved.
              </p>
            </div>
          </FadeIn>
        </div>
      </footer>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-xl md:max-w-xl max-h-[100vh] w-full cursor-default"
              >
                <Image
                  src={lightboxImage}
                  alt="Pricelist Fullscreen"
                  width={600}
                  height={800}
                  className="w-full h-full object-contain rounded-lg"
                  priority
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
