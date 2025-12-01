"use client";

import { Navbar, MobileMenu, Footer } from "@/components/layout";
import {
  HeroSection,
  WhyUsSection,
  TutorialSection,
  ServicesSection,
  PricelistSection,
  ReviewSection,
  JoinDriverSection,
} from "@/components/sections";
import { ImageLightbox } from "@/components/shared";
import { useScrollSection, useMobileMenu, useLightbox } from "@/hooks";

export default function Home() {
  // Custom hooks for managing state
  const { activeSection, handleNavClick } = useScrollSection();
  const mobileMenu = useMobileMenu();
  const lightbox = useLightbox();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary">
      {/* Navigation Header */}
      <Navbar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onMobileMenuToggle={mobileMenu.toggle}
        isMobileMenuOpen={mobileMenu.isOpen}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={mobileMenu.isOpen}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onClose={mobileMenu.close}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Why Us Section */}
      <WhyUsSection />

      {/* Tutorial Section */}
      <TutorialSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Pricelist Section */}
      <PricelistSection onImageClick={lightbox.open} />

      {/* Review Section */}
      <ReviewSection />

      {/* Join Driver Section */}
      <JoinDriverSection />

      {/* Footer */}
      <Footer />

      {/* Image Lightbox Modal */}
      <ImageLightbox
        isOpen={lightbox.isOpen}
        images={lightbox.images}
        initialIndex={lightbox.initialIndex}
        onClose={lightbox.close}
      />
    </div>
  );
}
