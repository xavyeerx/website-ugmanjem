-- ============================================
-- Pricing Configuration Table
-- Allows admin to edit price calculator params
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE pricing_config (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key         TEXT NOT NULL UNIQUE,
    value       NUMERIC NOT NULL,
    label       TEXT NOT NULL,
    description TEXT,
    unit        TEXT NOT NULL DEFAULT 'Rp',
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pricing_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing_config" ON pricing_config FOR SELECT USING (true);
CREATE POLICY "Admin full access pricing_config" ON pricing_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed with current hardcoded values
INSERT INTO pricing_config (key, value, label, description, unit, sort_order) VALUES
('price_per_km',      2500, 'Tarif per KM',        'Tarif dasar per kilometer',                     'Rp/km', 0),
('minimum_price',     5000, 'Tarif Minimum',        'Harga minimum untuk semua layanan',             'Rp',    1),
('jastip_fee',        1000, 'Biaya Jastip',         'Biaya tambahan untuk layanan Jasa Titip',       'Rp',    2),
('rainy_fee',         2000, 'Biaya Hujan',          'Tambahan biaya saat kondisi hujan',             'Rp',    3),
('early_morning_fee', 1000, 'Biaya Dini Hari',      'Tambahan biaya untuk jam >22:00',               'Rp',    4);
