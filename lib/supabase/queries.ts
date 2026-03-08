import { createClient } from "./server";
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

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");

  return (
    data?.map((s) => ({
      id: s.id,
      title: s.title,
      image: s.image_url,
      rating: s.rating,
      trips: s.trips,
      price: s.price,
      category: s.category,
    })) ?? []
  );
}

export async function getServiceTabs(): Promise<ServiceTab[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_tabs")
    .select("*")
    .order("sort_order");

  return data?.map((t) => ({ id: t.tab_id, name: t.name })) ?? [];
}

export async function getServiceDescriptions(): Promise<
  Record<string, string>
> {
  const supabase = await createClient();
  const { data } = await supabase.from("service_descriptions").select("*");

  const map: Record<string, string> = {};
  data?.forEach((d) => {
    map[d.slug] = d.description;
  });
  return map;
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order");

  return (
    data?.map((r) => ({
      id: r.id,
      name: r.name,
      affiliation: r.affiliation,
      review: r.review_text,
      rating: r.rating,
      avatar: r.avatar_url,
      backgroundImage: r.bg_image_url ?? "",
    })) ?? []
  );
}

export async function getStats(): Promise<Stat[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stats")
    .select("*")
    .order("sort_order");

  return data?.map((s) => ({ value: s.value, label: s.label })) ?? [];
}

export async function getFeatures(): Promise<Feature[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("features")
    .select("*")
    .order("sort_order");

  return (
    data?.map((f) => ({ title: f.title, description: f.description })) ?? []
  );
}

export async function getTutorialSteps(): Promise<TutorialStep[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutorial_steps")
    .select("*")
    .order("step_number");

  return (
    data?.map((t) => ({
      step: t.step_number,
      title: t.title,
      description: t.description,
      link:
        t.link_text && t.link_url
          ? { text: t.link_text, url: t.link_url }
          : undefined,
    })) ?? []
  );
}

export async function getNavigation(): Promise<NavSection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("navigation")
    .select("*")
    .order("sort_order");

  return data?.map((n) => ({ name: n.name, id: n.section_id })) ?? [];
}

export async function getPricelist(): Promise<
  { id: number; src: string; alt: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricelist")
    .select("*")
    .order("sort_order");

  return (
    data?.map((p) => ({ id: p.id, src: p.image_url, alt: p.alt_text })) ?? []
  );
}

export async function getFooterSections(): Promise<FooterSection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("footer_sections")
    .select("*, footer_links(*)")
    .order("sort_order");

  return (
    data?.map((s) => ({
      title: s.title,
      links: (s.footer_links as any[])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((l: any) => ({
          label: l.label,
          href: l.href,
          external: l.is_external,
        })),
    })) ?? []
  );
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order");

  return (
    data?.map((s) => ({
      id: s.platform,
      name: s.name,
      url: s.url,
      icon: s.icon_url,
    })) ?? []
  );
}

export async function getDriverRequirements(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("driver_requirements")
    .select("*")
    .order("sort_order");

  return data?.map((d) => d.requirement) ?? [];
}

export async function getSiteConfig(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_config").select("*");

  const config: Record<string, string> = {};
  data?.forEach((c) => {
    config[c.key] = c.value;
  });
  return config;
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_config").select("key, value");

  const defaults: PricingConfig = {
    price_per_km: 2500,
    minimum_price: 5000,
    jastip_fee: 1000,
    rainy_fee: 2000,
    early_morning_fee: 1000,
  };

  if (!data) return defaults;

  data.forEach((row) => {
    if (row.key in defaults) {
      (defaults as any)[row.key] = Number(row.value);
    }
  });

  return defaults;
}
