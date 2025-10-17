-- Migration 006: Platform Navigation Enhancement
-- Purpose: Add tables and columns for improved navigation, tracking, and user features
-- Date: 2025-10-15

-- ============================================================================
-- 1. ADD COLUMNS TO EXISTING FICHES TABLE
-- ============================================================================

-- Add metadata columns for better organization
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3);
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS estimated_duration INTEGER; -- in minutes
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS frequency_rating INTEGER CHECK (frequency_rating BETWEEN 1 AND 5);
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS times_viewed INTEGER DEFAULT 0;
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS avg_completion_time INTEGER; -- in seconds
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS avg_score DECIMAL(5,2);

COMMENT ON COLUMN fiches.difficulty_level IS '1=Débutant, 2=Intermédiaire, 3=Avancé';
COMMENT ON COLUMN fiches.estimated_duration IS 'Estimated time to complete in minutes';
COMMENT ON COLUMN fiches.frequency_rating IS 'How frequently this appears in ECOS: 1-5 stars';
COMMENT ON COLUMN fiches.times_viewed IS 'Total number of times this fiche has been viewed';
COMMENT ON COLUMN fiches.avg_completion_time IS 'Average time users take to complete this fiche (seconds)';
COMMENT ON COLUMN fiches.avg_score IS 'Average score achieved by users on this fiche';

-- ============================================================================
-- 2. CREATE FICHE CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fiche_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_de VARCHAR(100), -- German translation
    parent_id UUID REFERENCES fiche_categories(id) ON DELETE CASCADE,
    icon VARCHAR(50), -- emoji or icon name
    color VARCHAR(20), -- color code for UI
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE fiche_categories IS 'Hierarchical categories for organizing fiches (Anamnèse, Examen, etc.)';

-- Create index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_fiche_categories_parent_id ON fiche_categories(parent_id);

-- ============================================================================
-- 3. CREATE FICHE-CATEGORY MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fiche_category_mapping (
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE CASCADE,
    category_id UUID REFERENCES fiche_categories(id) ON DELETE CASCADE,
    PRIMARY KEY(fiche_id, category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE fiche_category_mapping IS 'Maps fiches to categories (many-to-many relationship)';

-- ============================================================================
-- 4. CREATE USER PROGRESS TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score DECIMAL(5,2), -- percentage score (0-100)
    time_spent INTEGER DEFAULT 0, -- seconds
    last_accessed TIMESTAMP,
    completion_date TIMESTAMP,
    notes TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fiche_id)
);

COMMENT ON TABLE user_progress IS 'Tracks individual user progress on each fiche';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_fiche_id ON user_progress(fiche_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_bookmarked ON user_progress(is_bookmarked) WHERE is_bookmarked = true;

-- ============================================================================
-- 5. CREATE CIRCUITS (COLLECTIONS) TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS circuits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_predefined BOOLEAN DEFAULT FALSE, -- System-created circuits
    total_duration INTEGER, -- total estimated minutes
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),
    times_used INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE circuits IS 'Collections of fiches organized into study circuits';
COMMENT ON COLUMN circuits.is_predefined IS 'True for system-created circuits (Urgences, Pédiatrie, etc.)';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_circuits_user_id ON circuits(user_id);
CREATE INDEX IF NOT EXISTS idx_circuits_public ON circuits(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_circuits_predefined ON circuits(is_predefined) WHERE is_predefined = true;

-- ============================================================================
-- 6. CREATE CIRCUIT-FICHE MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS circuit_fiches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    notes TEXT, -- Circuit-specific notes for this fiche
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(circuit_id, fiche_id)
);

COMMENT ON TABLE circuit_fiches IS 'Maps fiches to circuits with ordering';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_circuit_fiches_circuit_id ON circuit_fiches(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_fiches_fiche_id ON circuit_fiches(fiche_id);

-- ============================================================================
-- 7. CREATE STUDY SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE SET NULL,
    circuit_id UUID REFERENCES circuits(id) ON DELETE SET NULL,
    session_type VARCHAR(50), -- 'single_fiche', 'circuit', 'mock_exam'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    time_spent INTEGER, -- seconds
    score DECIMAL(5,2),
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE study_sessions IS 'Tracks individual study sessions for analytics';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON study_sessions(completed);

-- ============================================================================
-- 8. CREATE USER NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_notes IS 'User-created notes on fiches';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_fiche_id ON user_notes(fiche_id);

-- ============================================================================
-- 9. CREATE USER NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'new_content', 'recommendation', 'reminder', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255), -- URL to relevant content
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

COMMENT ON TABLE user_notifications IS 'User notifications for new content, reminders, etc.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(is_read) WHERE is_read = false;

-- ============================================================================
-- 10. CREATE INDEXES ON FICHES TABLE FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fiches_difficulty ON fiches(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_fiches_frequency ON fiches(frequency_rating);
CREATE INDEX IF NOT EXISTS idx_fiches_times_viewed ON fiches(times_viewed);

-- ============================================================================
-- 11. INSERT DEFAULT CATEGORIES
-- ============================================================================

-- Top-level categories (based on ECOS structure)
INSERT INTO fiche_categories (name, name_de, icon, color, display_order, description) VALUES
('Anamnèse', 'Anamnese', '💬', '#3B82F6', 1, 'History taking and patient interviews'),
('Examen Clinique', 'Klinische Untersuchung', '🔍', '#10B981', 2, 'Physical examination techniques'),
('Management', 'Management', '🏥', '#8B5CF6', 3, 'Treatment planning and patient management'),
('Communication', 'Kommunikation', '🗣️', '#F59E0B', 4, 'Patient communication and counseling'),
('Urgences', 'Notfall', '🚨', '#EF4444', 5, 'Emergency and critical care situations'),
('Procédures', 'Verfahren', '💉', '#EC4899', 6, 'Clinical procedures and interventions'),
('Interprétation', 'Interpretation', '📊', '#6366F1', 7, 'Interpretation of tests and results'),
('Pédiatrie', 'Pädiatrie', '👶', '#14B8A6', 8, 'Pediatric cases and examinations'),
('Psychiatrie', 'Psychiatrie', '🧠', '#A855F7', 9, 'Psychiatric assessments and cases'),
('Gynéco-Obstétrique', 'Gynäkologie-Geburtshilfe', '🤰', '#F97316', 10, 'Gynecology and obstetrics')
ON CONFLICT DO NOTHING;

-- Get category IDs for subcategories (we'll add these manually after)
-- Example subcategories under Anamnèse:
-- - Anamnèse Générale, Anamnèse Cardiologique, etc.

-- ============================================================================
-- 12. INSERT PREDEFINED CIRCUITS
-- ============================================================================

-- Insert system-created circuits
INSERT INTO circuits (title, description, is_public, is_predefined, difficulty_level, display_order)
SELECT * FROM (VALUES
    ('Circuit Urgences', 'Stations ECOS pour les situations d''urgence et soins critiques', true, true, 3, 1),
    ('Circuit Médecine Interne', 'Cas cliniques essentiels de médecine interne', true, true, 2, 2),
    ('Circuit Pédiatrie', 'Stations pédiatriques complètes', true, true, 2, 3),
    ('Circuit Psychiatrie', 'Évaluations psychiatriques essentielles', true, true, 2, 4),
    ('Circuit Examen Blanc', 'Simulation d''examen ECOS complet (13 stations)', true, true, 3, 5),
    ('Circuit Anamnèse Complète', 'Maîtriser toutes les techniques d''anamnèse', true, true, 1, 6),
    ('Circuit Examen Musculo-squelettique', 'Examens orthopédiques et rhumatologiques', true, true, 2, 7),
    ('Circuit Communication', 'Compétences en communication et annonces difficiles', true, true, 1, 8)
) AS v(title, description, is_public, is_predefined, difficulty_level, display_order)
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE is_predefined = true);

-- ============================================================================
-- 13. UPDATE EXISTING FICHES WITH METADATA
-- ============================================================================

-- Set default difficulty levels based on fiche type
UPDATE fiches SET difficulty_level = 1 WHERE fiche_type = 'skills' AND difficulty_level IS NULL;
UPDATE fiches SET difficulty_level = 2 WHERE fiche_type = 'ssp' AND difficulty_level IS NULL;
UPDATE fiches SET difficulty_level = 2 WHERE fiche_type = 'dx' AND difficulty_level IS NULL;
UPDATE fiches SET difficulty_level = 1 WHERE fiche_type = 'resume' AND difficulty_level IS NULL;

-- Set default estimated durations based on fiche type
UPDATE fiches SET estimated_duration = 13 WHERE fiche_type = 'ssp' AND estimated_duration IS NULL; -- ECOS standard
UPDATE fiches SET estimated_duration = 10 WHERE fiche_type = 'skills' AND estimated_duration IS NULL;
UPDATE fiches SET estimated_duration = 15 WHERE fiche_type = 'dx' AND estimated_duration IS NULL;
UPDATE fiches SET estimated_duration = 20 WHERE fiche_type = 'resume' AND estimated_duration IS NULL;

-- Set frequency ratings for urgent/common conditions
UPDATE fiches SET frequency_rating = 5 WHERE is_urgent = true AND frequency_rating IS NULL;
UPDATE fiches SET frequency_rating = 3 WHERE frequency_rating IS NULL; -- default medium frequency

-- ============================================================================
-- 14. CREATE VIEW FOR USER STATISTICS
-- ============================================================================

CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.id as user_id,
    u.email,
    COUNT(DISTINCT up.fiche_id) as total_fiches_viewed,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.fiche_id END) as fiches_completed,
    COUNT(DISTINCT CASE WHEN up.is_bookmarked = true THEN up.fiche_id END) as fiches_bookmarked,
    SUM(up.time_spent) as total_time_spent_seconds,
    AVG(up.score) as avg_score,
    COUNT(DISTINCT ss.id) as total_study_sessions,
    MAX(ss.started_at) as last_study_session,
    COUNT(DISTINCT c.id) as circuits_created
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN study_sessions ss ON u.id = ss.user_id
LEFT JOIN circuits c ON u.id = c.user_id AND c.is_predefined = false
GROUP BY u.id, u.email;

COMMENT ON VIEW user_statistics IS 'Aggregated statistics for each user';

-- ============================================================================
-- 15. CREATE VIEW FOR POPULAR FICHES
-- ============================================================================

CREATE OR REPLACE VIEW popular_fiches AS
SELECT
    f.id,
    f.slug,
    f.title,
    f.fiche_type,
    f.discipline,
    f.difficulty_level,
    f.times_viewed,
    f.avg_score,
    COUNT(DISTINCT up.user_id) as unique_users,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.user_id END) as completion_count,
    AVG(up.score) as user_avg_score,
    AVG(up.time_spent) as avg_time_spent
FROM fiches f
LEFT JOIN user_progress up ON f.id = up.fiche_id
GROUP BY f.id, f.slug, f.title, f.fiche_type, f.discipline, f.difficulty_level, f.times_viewed, f.avg_score
ORDER BY f.times_viewed DESC;

COMMENT ON VIEW popular_fiches IS 'Most viewed and popular fiches with aggregated stats';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 006: Platform Navigation Enhancement - COMPLETED';
    RAISE NOTICE 'Added: user_progress, circuits, study_sessions, categories tables';
    RAISE NOTICE 'Enhanced: fiches table with metadata columns';
    RAISE NOTICE 'Created: views for statistics and analytics';
END $$;
