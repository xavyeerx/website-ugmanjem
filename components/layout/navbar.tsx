"use client";

import Image from "next/image";
import { sections } from "@/data/navigation";
import { LOGO_URL, WHATSAPP_ORDER_URL } from "@/lib/constants";

interface NavbarProps {
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Navbar({
  activeSection,
  onNavClick,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavClick("home")}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image
              src={LOGO_URL}
              alt="UGM Anjem Logo"
              width={140}
              height={56}
              className="h-9 md:h-10 w-auto object-contain"
              unoptimized
              priority
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onNavClick(section.id)}
                className={`px-4 lg:px-5 py-2.5 rounded-lg text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  activeSection === section.id
                    ? "text-primary bg-white"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Order Button */}
          <a
            href={WHATSAPP_ORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block px-6 py-2.5 rounded-full bg-white text-primary font-bold hover:bg-white/90 transition-colors duration-200 text-base"
          >
            Order Now
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
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
          </button>
        </div>
      </div>
    </nav>
  );
}
