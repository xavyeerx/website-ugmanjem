"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { sections } from "@/data/navigation";
import { NAV_HEIGHT } from "@/lib/constants";

export function useScrollSection() {
  const [activeSection, setActiveSection] = useState("home");
  const isScrollingRef = useRef(false);

  // Handle navigation click with smooth scroll
  const handleNavClick = useCallback((sectionId: string) => {
    isScrollingRef.current = true;
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - NAV_HEIGHT;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  }, []);

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Detect active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Don't update during programmatic scrolling
      if (isScrollingRef.current) return;

      const viewportMiddle = window.scrollY + window.innerHeight / 3;

      let currentSection = "home";

      // Check each section from top to bottom
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          // If viewport middle is within this section
          if (viewportMiddle >= elementTop && viewportMiddle < elementBottom) {
            currentSection = section.id;
            break;
          }

          // If we've scrolled past the start of this section
          if (viewportMiddle >= elementTop) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check
    handleScroll();

    // Throttle scroll events
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  return {
    activeSection,
    setActiveSection,
    handleNavClick,
  };
}
