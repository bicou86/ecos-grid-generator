-- Migration: Add images tables for cases and fiches
-- Created: 2025-10-14

-- Images for clinical cases
CREATE TABLE IF NOT EXISTS case_images (
    id SERIAL PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, filename)
);

-- Images for fiches
CREATE TABLE IF NOT EXISTS fiche_images (
    id SERIAL PRIMARY KEY,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fiche_id, filename)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_case_images_case ON case_images(case_id);
CREATE INDEX IF NOT EXISTS idx_case_images_order ON case_images(case_id, image_order);
CREATE INDEX IF NOT EXISTS idx_fiche_images_fiche ON fiche_images(fiche_id);
CREATE INDEX IF NOT EXISTS idx_fiche_images_order ON fiche_images(fiche_id, image_order);

-- Add helpful comments
COMMENT ON TABLE case_images IS 'Stores images associated with clinical cases';
COMMENT ON TABLE fiche_images IS 'Stores images associated with revision fiches';
COMMENT ON COLUMN case_images.image_order IS 'Display order of images (0 = first)';
COMMENT ON COLUMN fiche_images.image_order IS 'Display order of images (0 = first)';
