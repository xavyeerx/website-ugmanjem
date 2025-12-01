"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FadeIn from "@/components/fade-in";
import { footerSections, socialLinks } from "@/data/footer";

export default function Footer() {
  return (
    <footer
      id="contact-us"
      className="bg-background py-12 md:py-16 border-t border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {footerSections.map((section, sectionIndex) => (
            <FadeIn
              key={section.title}
              direction="up"
              delay={0.15 + sectionIndex * 0.05}
            >
              <div>
                <h4 className="text-base font-bold text-accent mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <motion.a
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors inline-block"
                      >
                        {link.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Connect with Us - Social Media */}
        <FadeIn direction="up" delay={0.35}>
          <div className="border-t border-border pt-8">
            <h4 className="text-base font-bold text-accent mb-6">
              Connect with Us
            </h4>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.id}
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.2 }}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-accent transition-colors group"
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 group-hover:opacity-100"
                  />
                </motion.a>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 UGM Anjem. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
