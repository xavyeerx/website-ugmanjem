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
import type { WebsiteData } from "@/lib/data-source";

interface HomePageProps {
  data: WebsiteData;
}

export default function HomePage({ data }: HomePageProps) {
  const { activeSection, handleNavClick } = useScrollSection(data.navigation);
  const mobileMenu = useMobileMenu();
  const lightbox = useLightbox();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary">
      <Navbar
        sections={data.navigation}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onMobileMenuToggle={mobileMenu.toggle}
        isMobileMenuOpen={mobileMenu.isOpen}
      />

      <MobileMenu
        sections={data.navigation}
        isOpen={mobileMenu.isOpen}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onClose={mobileMenu.close}
      />

      <HeroSection />

      <WhyUsSection stats={data.stats} features={data.features} />

      <TutorialSection steps={data.tutorialSteps} />

      <ServicesSection
        services={data.services}
        serviceTabs={data.serviceTabs}
      />

      <PricelistSection
        images={data.pricelist}
        serviceDescriptions={data.serviceDescriptions}
        pricingConfig={data.pricingConfig}
        onImageClick={lightbox.open}
      />

      <ReviewSection reviews={data.reviews} />

      <JoinDriverSection requirements={data.driverRequirements} />

      <Footer
        sections={data.footerSections}
        socialLinks={data.socialLinks}
      />

      <ImageLightbox
        isOpen={lightbox.isOpen}
        images={lightbox.images}
        initialIndex={lightbox.initialIndex}
        onClose={lightbox.close}
      />
    </div>
  );
}
