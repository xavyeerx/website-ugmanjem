// Navigation Types
export interface NavSection {
  name: string;
  id: string;
}

// Service Types
export interface Service {
  id: number;
  title: string;
  image: string;
  rating: number;
  trips: string;
  price: string;
  category: ServiceCategory;
}

export type ServiceCategory = string;

export interface ServiceTab {
  id: string;
  name: string;
}

// Review Types
export interface Review {
  id: number;
  name: string;
  affiliation: string;
  review: string;
  rating: number;
  avatar: string;
  backgroundImage: string;
}

// Social Link Types
export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

// Footer Link Types
export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

// Stats Types
export interface Stat {
  value: string;
  label: string;
}

// Feature Types
export interface Feature {
  title: string;
  description: string;
}

// Tutorial Step Types
export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
}

// Chat Types
export type RatingValue = "very_helpful" | "helpful" | "not_helpful" | "very_not_helpful";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  rating?: RatingValue;
}

export interface ChatSource {
  source: string;
  section: string;
}

// Price Calculator Types
export type ServiceType = "antar-jemput" | "jastip";

export type { VehicleType, WeatherCondition } from "@/utils/pricing";

export interface PricingConfig {
  price_per_km: number;
  minimum_price: number;
  jastip_fee: number;
  rainy_fee: number;
  early_morning_fee: number;
}

export interface PriceCalculatorState {
  vehicleType: import("@/utils/pricing").VehicleType;
  serviceType: ServiceType;
  distance: string;
  isRainy: boolean;
  weatherCondition: import("@/utils/pricing").WeatherCondition;
}

