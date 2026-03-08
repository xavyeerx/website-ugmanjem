-- ============================================
-- Remove hardcoded category constraint
-- Allow any category value for services
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the old CHECK constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;

-- Add a simple NOT EMPTY check instead
ALTER TABLE services ADD CONSTRAINT services_category_check CHECK (category <> '');
