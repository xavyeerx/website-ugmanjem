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

export type ServiceCategory = "anjem" | "jastip" | "survei" | "berkas";

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

// Price Calculator Types
export type ServiceType = "antar-jemput" | "jastip";

export interface PriceCalculatorState {
  serviceType: ServiceType;
  distance: string;
  isRainy: boolean;
  isEarlyMorning: boolean;
}

export interface PriceCalculatorResult {
  estimatedPrice: number;
  breakdown: {
    basePrice: number;
    serviceFee: number;
    weatherFee: number;
    timeFee: number;
  };
}

