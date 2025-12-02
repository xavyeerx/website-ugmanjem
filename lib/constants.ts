// External URLs
export const WHATSAPP_ORDER_URL =
  "https://chat.whatsapp.com/KsDOcqlQ5y6LBGKvoH792S";

export const WHATSAPP_ADMIN_URL =
  "https://api.whatsapp.com/send?phone=6282123035583&text=haloo%20min%2C%20mau%20link%20grup%20UGM%20Anjem%20dong!";

export const DRIVER_REGISTRATION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfOiP7z21-m6B42Xi2107Zq6mWJwvzFOD2a1uuNjEtfPcOK5g/viewform?usp=send_form";

export const LOGO_URL = "/images/logo-anjem-putih.png";

export const HERO_BACKGROUND_URL = "/images/background.png";

// Social Media URLs
export const SOCIAL_URLS = {
  whatsapp: WHATSAPP_ADMIN_URL,
  instagram: "https://instagram.com/ugm.anjem",
  tiktok: "https://tiktok.com/@ugm.anjem",
} as const;

// UI Constants
export const NAV_HEIGHT = 80;

// Price Calculator Constants
export const PRICE_PER_KM = 2500; // Rp per kilometer (2.5 per meter * 1000)
export const MINIMUM_PRICE = 5000;
export const JASTIP_FEE = 1000;
export const RAINY_FEE = 2000;
export const EARLY_MORNING_FEE = 1000;

// Animation Delays
export const ANIMATION_DELAYS = {
  preloader: 1.5,
  heroContent: 1.8,
  heroTitle: 2.0,
  heroSubtitle: 2.2,
  heroDescription: 2.4,
} as const;
