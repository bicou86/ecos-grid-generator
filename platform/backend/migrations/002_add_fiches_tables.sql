-- Migration: Add fiches (revision sheets) tables
-- Description: Integrates ECOS revision sheets from ecos-skills-summary project

-- Main fiches table
CREATE TABLE IF NOT EXISTS fiches (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    fiche_type VARCHAR(50) NOT NULL, -- 'ssp', 'skills', 'dx'
    subtitle VARCHAR(500),
    description TEXT,
    discipline VARCHAR(200),
    frequency_rating INTEGER, -- 1-5 stars for ECOS frequency
    is_urgent BOOLEAN DEFAULT false,
    content_markdown TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Additional structured data
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_fiches_type ON fiches(fiche_type);
CREATE INDEX idx_fiches_discipline ON fiches(discipline);
CREATE INDEX idx_fiches_slug ON fiches(slug);
CREATE INDEX idx_fiches_published ON fiches(is_published);

-- Fiche sections table (for structured content like anamnesis, exam, management)
CREATE TABLE IF NOT EXISTS fiche_sections (
    id SERIAL PRIMARY KEY,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    section_type VARCHAR(100) NOT NULL, -- 'anamnese', 'examen', 'management', 'red_flags', etc.
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fiche_sections_fiche ON fiche_sections(fiche_id);
CREATE INDEX idx_fiche_sections_type ON fiche_sections(section_type);

-- Fiche tags table (for keywords and search)
CREATE TABLE IF NOT EXISTS fiche_tags (
    id SERIAL PRIMARY KEY,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fiche_id, tag)
);

CREATE INDEX idx_fiche_tags_fiche ON fiche_tags(fiche_id);
CREATE INDEX idx_fiche_tags_tag ON fiche_tags(tag);

-- Junction table: Link fiches to clinical cases
CREATE TABLE IF NOT EXISTS case_fiches (
    id SERIAL PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, fiche_id)
);

CREATE INDEX idx_case_fiches_case ON case_fiches(case_id);
CREATE INDEX idx_case_fiches_fiche ON case_fiches(fiche_id);

-- User bookmarks for fiches
CREATE TABLE IF NOT EXISTS user_fiche_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fiche_id)
);

CREATE INDEX idx_user_fiche_bookmarks_user ON user_fiche_bookmarks(user_id);
CREATE INDEX idx_user_fiche_bookmarks_fiche ON user_fiche_bookmarks(fiche_id);

-- User progress tracking for fiches
CREATE TABLE IF NOT EXISTS user_fiche_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fiche_id)
);

CREATE INDEX idx_user_fiche_progress_user ON user_fiche_progress(user_id);
CREATE INDEX idx_user_fiche_progress_fiche ON user_fiche_progress(fiche_id);

-- Comments
COMMENT ON TABLE fiches IS 'ECOS revision sheets (SSP, Skills, Diagnosis)';
COMMENT ON COLUMN fiches.fiche_type IS 'Type: ssp (clinical scenario), skills (technique), dx (diagnosis)';
COMMENT ON COLUMN fiches.frequency_rating IS 'ECOS frequency: 1-5 stars';
COMMENT ON TABLE fiche_sections IS 'Structured sections within each fiche';
COMMENT ON TABLE case_fiches IS 'Links fiches to related clinical cases';
