import type { FooterSection, SocialLink } from "@/types";
import { WHATSAPP_ORDER_URL, SOCIAL_URLS } from "@/lib/constants";

export const footerSections: FooterSection[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#why-us" },
      { label: "Products", href: "#services" },
      { label: "Blog", href: "#review" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Antar Jemput", href: "#services" },
      { label: "Jasa Titip", href: "#services" },
      { label: "Survei Kost", href: "#services" },
      { label: "Urus Berkas", href: "#services" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Tutorial", href: "#tutorial" },
      { label: "Pricelist", href: "#pricelist" },
      { label: "Join Driver", href: "#join-driver" },
      { label: "Review", href: "#review" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { label: "Help Center", href: WHATSAPP_ORDER_URL, external: true },
      { label: "Our Location", href: "#home" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    url: SOCIAL_URLS.whatsapp,
    icon: "/images/logo-wa.png",
  },
  {
    id: "instagram",
    name: "Instagram",
    url: SOCIAL_URLS.instagram,
    icon: "/images/logo-instagram.png",
  },
  {
    id: "tiktok",
    name: "TikTok",
    url: SOCIAL_URLS.tiktok,
    icon: "/images/logo-tiktok.png",
  },
];
