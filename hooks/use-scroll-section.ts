"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NAV_HEIGHT } from "@/lib/constants";
import type { NavSection } from "@/types";

export function useScrollSection(sections: NavSection[]) {
  const [activeSection, setActiveSection] = useState("home");
  const isScrollingRef = useRef(false);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

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

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const viewportMiddle = window.scrollY + window.innerHeight / 3;

      let currentSection = "home";

      for (const section of sectionsRef.current) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (viewportMiddle >= elementTop && viewportMiddle < elementBottom) {
            currentSection = section.id;
            break;
          }

          if (viewportMiddle >= elementTop) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();

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
