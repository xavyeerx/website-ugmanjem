import type {
  Service,
  ServiceTab,
  Review,
  Stat,
  Feature,
  TutorialStep,
  NavSection,
  FooterSection,
  SocialLink,
  PricingConfig,
} from "@/types";

import * as hardcoded from "@/data";
import { pricelistImages } from "@/data/pricelist";
import { serviceDescriptions as hardcodedServiceDescs } from "@/data/services";
import {
  tutorialSteps as hardcodedTutorialSteps,
  driverRequirements as hardcodedDriverReqs,
} from "@/data/stats";
import * as supabaseQueries from "@/lib/supabase/queries";

const USE_SUPABASE = process.env.USE_SUPABASE === "true";

async function withFallback<T>(
  supabaseFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!USE_SUPABASE) return fallback;
  try {
    const result = await supabaseFn();
    if (Array.isArray(result) && result.length === 0) return fallback;
    if (typeof result === "object" && Object.keys(result as any).length === 0)
      return fallback;
    return result;
  } catch {
    return fallback;
  }
}

export async function getServices(): Promise<Service[]> {
  return withFallback(supabaseQueries.getServices, hardcoded.services);
}

export async function getServiceTabs(): Promise<ServiceTab[]> {
  return withFallback(supabaseQueries.getServiceTabs, hardcoded.serviceTabs);
}

export async function getServiceDescriptions(): Promise<
  Record<string, string>
> {
  return withFallback(
    supabaseQueries.getServiceDescriptions,
    hardcodedServiceDescs
  );
}

export async function getReviews(): Promise<Review[]> {
  return withFallback(supabaseQueries.getReviews, hardcoded.reviews);
}

export async function getStats(): Promise<Stat[]> {
  return withFallback(supabaseQueries.getStats, hardcoded.stats);
}

export async function getFeatures(): Promise<Feature[]> {
  return withFallback(supabaseQueries.getFeatures, hardcoded.features);
}

export async function getTutorialSteps(): Promise<TutorialStep[]> {
  return withFallback(
    supabaseQueries.getTutorialSteps,
    hardcodedTutorialSteps
  );
}

export async function getNavigation(): Promise<NavSection[]> {
  return withFallback(supabaseQueries.getNavigation, hardcoded.sections);
}

export async function getPricelist(): Promise<
  { id: number; src: string; alt: string }[]
> {
  return withFallback(supabaseQueries.getPricelist, pricelistImages);
}

export async function getFooterSections(): Promise<FooterSection[]> {
  return withFallback(
    supabaseQueries.getFooterSections,
    hardcoded.footerSections
  );
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return withFallback(supabaseQueries.getSocialLinks, hardcoded.socialLinks);
}

export async function getDriverRequirements(): Promise<string[]> {
  return withFallback(
    supabaseQueries.getDriverRequirements,
    hardcodedDriverReqs
  );
}

export async function getSiteConfig(): Promise<Record<string, string>> {
  return withFallback(supabaseQueries.getSiteConfig, {});
}

const defaultPricing: PricingConfig = {
  price_per_km: 2500,
  minimum_price: 5000,
  jastip_fee: 1000,
  rainy_fee: 2000,
  early_morning_fee: 1000,
};

export async function getPricingConfig(): Promise<PricingConfig> {
  return withFallback(supabaseQueries.getPricingConfig, defaultPricing);
}

export interface WebsiteData {
  services: Service[];
  serviceTabs: ServiceTab[];
  serviceDescriptions: Record<string, string>;
  reviews: Review[];
  stats: Stat[];
  features: Feature[];
  tutorialSteps: TutorialStep[];
  navigation: NavSection[];
  pricelist: { id: number; src: string; alt: string }[];
  footerSections: FooterSection[];
  socialLinks: SocialLink[];
  driverRequirements: string[];
  siteConfig: Record<string, string>;
  pricingConfig: PricingConfig;
}

export async function getAllWebsiteData(): Promise<WebsiteData> {
  const [
    services,
    serviceTabs,
    serviceDescriptions,
    reviews,
    stats,
    features,
    tutorialSteps,
    navigation,
    pricelist,
    footerSections,
    socialLinks,
    driverRequirements,
    siteConfig,
    pricingConfig,
  ] = await Promise.all([
    getServices(),
    getServiceTabs(),
    getServiceDescriptions(),
    getReviews(),
    getStats(),
    getFeatures(),
    getTutorialSteps(),
    getNavigation(),
    getPricelist(),
    getFooterSections(),
    getSocialLinks(),
    getDriverRequirements(),
    getSiteConfig(),
    getPricingConfig(),
  ]);

  return {
    services,
    serviceTabs,
    serviceDescriptions,
    reviews,
    stats,
    features,
    tutorialSteps,
    navigation,
    pricelist,
    footerSections,
    socialLinks,
    driverRequirements,
    siteConfig,
    pricingConfig,
  };
}
