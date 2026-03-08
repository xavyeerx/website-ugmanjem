-- ============================================
-- UGM Anjem Website - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Services
CREATE TABLE services (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       TEXT NOT NULL,
    image_url   TEXT NOT NULL,
    rating      SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    trips       TEXT NOT NULL DEFAULT '0',
    price       TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category <> ''),
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_tabs (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tab_id     TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE service_descriptions (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- Reviews
CREATE TABLE reviews (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          TEXT NOT NULL,
    affiliation   TEXT NOT NULL,
    review_text   TEXT NOT NULL,
    rating        SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    avatar_url    TEXT NOT NULL DEFAULT '/images/pp-man.png',
    bg_image_url  TEXT,
    is_visible    BOOLEAN NOT NULL DEFAULT true,
    sort_order    SMALLINT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stats
CREATE TABLE stats (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key        TEXT NOT NULL UNIQUE,
    value      TEXT NOT NULL,
    label      TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Features (Why Us section)
CREATE TABLE features (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- Tutorial Steps
CREATE TABLE tutorial_steps (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    step_number SMALLINT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    link_text   TEXT,
    link_url    TEXT
);

-- Pricelist images
CREATE TABLE pricelist (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_url  TEXT NOT NULL,
    alt_text   TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Navigation
CREATE TABLE navigation (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       TEXT NOT NULL,
    section_id TEXT NOT NULL UNIQUE,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Footer sections
CREATE TABLE footer_sections (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title      TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Footer links
CREATE TABLE footer_links (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    section_id  BIGINT NOT NULL REFERENCES footer_sections(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    href        TEXT NOT NULL,
    is_external BOOLEAN NOT NULL DEFAULT false,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- Social links
CREATE TABLE social_links (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    platform   TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    url        TEXT NOT NULL,
    icon_url   TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Driver requirements
CREATE TABLE driver_requirements (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requirement TEXT NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- Site config (key-value for misc settings like URLs)
CREATE TABLE site_config (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key        TEXT NOT NULL UNIQUE,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Anyone can read service_tabs" ON service_tabs FOR SELECT USING (true);
CREATE POLICY "Anyone can read service_descriptions" ON service_descriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can read visible reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Anyone can read stats" ON stats FOR SELECT USING (true);
CREATE POLICY "Anyone can read features" ON features FOR SELECT USING (true);
CREATE POLICY "Anyone can read tutorial_steps" ON tutorial_steps FOR SELECT USING (true);
CREATE POLICY "Anyone can read pricelist" ON pricelist FOR SELECT USING (true);
CREATE POLICY "Anyone can read navigation" ON navigation FOR SELECT USING (true);
CREATE POLICY "Anyone can read footer_sections" ON footer_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can read footer_links" ON footer_links FOR SELECT USING (true);
CREATE POLICY "Anyone can read social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Anyone can read driver_requirements" ON driver_requirements FOR SELECT USING (true);
CREATE POLICY "Anyone can read site_config" ON site_config FOR SELECT USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access service_tabs" ON service_tabs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access service_descriptions" ON service_descriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access stats" ON stats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access features" ON features FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access tutorial_steps" ON tutorial_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access pricelist" ON pricelist FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access navigation" ON navigation FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access footer_sections" ON footer_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access footer_links" ON footer_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access social_links" ON social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access driver_requirements" ON driver_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access site_config" ON site_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
