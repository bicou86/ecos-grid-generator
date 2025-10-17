-- Migration 007: Navigation Enhancement V2 (Revised)
-- Purpose: Add navigation features working with existing schema
-- Date: 2025-10-15

-- ============================================================================
-- 1. ENHANCE FICHES TABLE WITH METADATA
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fiches_difficulty ON fiches(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_fiches_frequency ON fiches(frequency_rating);
CREATE INDEX IF NOT EXISTS idx_fiches_times_viewed ON fiches(times_viewed);

-- ============================================================================
-- 2. ENHANCE USER_FICHE_PROGRESS TABLE
-- ============================================================================

-- Add missing columns to existing table
ALTER TABLE user_fiche_progress ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE user_fiche_progress ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);
ALTER TABLE user_fiche_progress ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP;
ALTER TABLE user_fiche_progress ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add constraint for status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_fiche_progress_status_check'
    ) THEN
        ALTER TABLE user_fiche_progress
        ADD CONSTRAINT user_fiche_progress_status_check
        CHECK (status IN ('not_started', 'in_progress', 'completed'));
    END IF;
END $$;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_user_fiche_progress_status ON user_fiche_progress(status);

-- ============================================================================
-- 3. CREATE FICHE CATEGORIES TABLE
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

CREATE INDEX IF NOT EXISTS idx_fiche_categories_parent_id ON fiche_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_fiche_categories_display_order ON fiche_categories(display_order);

-- ============================================================================
-- 4. CREATE FICHE-CATEGORY MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fiche_category_mapping (
    fiche_id INTEGER REFERENCES fiches(id) ON DELETE CASCADE,
    category_id UUID REFERENCES fiche_categories(id) ON DELETE CASCADE,
    PRIMARY KEY(fiche_id, category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE fiche_category_mapping IS 'Maps fiches to categories (many-to-many relationship)';

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

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON study_sessions(completed);

-- ============================================================================
-- 8. CREATE USER NOTIFICATIONS TABLE
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

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(is_read) WHERE is_read = false;

-- ============================================================================
-- 9. INSERT DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO fiche_categories (name, name_de, icon, color, display_order, description) VALUES
('Anamnèse', 'Anamnese', '💬', '#3B82F6', 1, 'Interrogatoire et entretiens avec les patients'),
('Examen Clinique', 'Klinische Untersuchung', '🔍', '#10B981', 2, 'Techniques d''examen physique'),
('Management', 'Management', '🏥', '#8B5CF6', 3, 'Planification thérapeutique et prise en charge'),
('Communication', 'Kommunikation', '🗣️', '#F59E0B', 4, 'Communication avec les patients et counseling'),
('Urgences', 'Notfall', '🚨', '#EF4444', 5, 'Situations d''urgence et soins critiques'),
('Procédures', 'Verfahren', '💉', '#EC4899', 6, 'Procédures cliniques et interventions'),
('Interprétation', 'Interpretation', '📊', '#6366F1', 7, 'Interprétation des examens et résultats'),
('Pédiatrie', 'Pädiatrie', '👶', '#14B8A6', 8, 'Cas et examens pédiatriques'),
('Psychiatrie', 'Psychiatrie', '🧠', '#A855F7', 9, 'Évaluations et cas psychiatriques'),
('Gynéco-Obstétrique', 'Gynäkologie-Geburtshilfe', '🤰', '#F97316', 10, 'Gynécologie et obstétrique')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. INSERT PREDEFINED CIRCUITS
-- ============================================================================

INSERT INTO circuits (title, description, is_public, is_predefined, difficulty_level) VALUES
('Circuit Urgences', 'Stations ECOS pour les situations d''urgence et soins critiques', true, true, 3),
('Circuit Médecine Interne', 'Cas cliniques essentiels de médecine interne', true, true, 2),
('Circuit Pédiatrie Complète', 'Stations pédiatriques complètes', true, true, 2),
('Circuit Psychiatrie Essentielle', 'Évaluations psychiatriques essentielles', true, true, 2),
('Circuit Examen Blanc', 'Simulation d''examen ECOS complet (13 stations)', true, true, 3),
('Circuit Anamnèse Complète', 'Maîtriser toutes les techniques d''anamnèse', true, true, 1),
('Circuit Examen Musculo-squelettique', 'Examens orthopédiques et rhumatologiques', true, true, 2),
('Circuit Communication', 'Compétences en communication et annonces difficiles', true, true, 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. UPDATE EXISTING FICHES WITH METADATA
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
-- 12. CREATE VIEWS FOR ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW v_user_fiche_statistics AS
SELECT
    u.id as user_id,
    u.email,
    COUNT(DISTINCT ufp.fiche_id) as total_fiches_viewed,
    COUNT(DISTINCT CASE WHEN ufp.is_completed = true THEN ufp.fiche_id END) as fiches_completed,
    COUNT(DISTINCT ufb.fiche_id) as fiches_bookmarked,
    SUM(ufp.time_spent_seconds) as total_time_spent_seconds,
    AVG(ufp.score) as avg_score,
    COUNT(DISTINCT ss.id) as total_study_sessions,
    MAX(ss.started_at) as last_study_session,
    COUNT(DISTINCT c.id) as circuits_created
FROM users u
LEFT JOIN user_fiche_progress ufp ON u.id = ufp.user_id
LEFT JOIN user_fiche_bookmarks ufb ON u.id = ufb.user_id
LEFT JOIN study_sessions ss ON u.id = ss.user_id
LEFT JOIN circuits c ON u.id = c.user_id AND c.is_predefined = false
GROUP BY u.id, u.email;

COMMENT ON VIEW v_user_fiche_statistics IS 'Aggregated statistics for each user';

CREATE OR REPLACE VIEW v_popular_fiches AS
SELECT
    f.id,
    f.slug,
    f.title,
    f.fiche_type,
    f.discipline,
    f.difficulty_level,
    f.estimated_duration,
    f.frequency_rating,
    f.times_viewed,
    COUNT(DISTINCT ufp.user_id) as unique_users,
    COUNT(DISTINCT CASE WHEN ufp.is_completed = true THEN ufp.user_id END) as completion_count,
    AVG(ufp.score) as user_avg_score,
    AVG(ufp.time_spent_seconds) as avg_time_spent,
    COUNT(DISTINCT ufb.user_id) as bookmark_count
FROM fiches f
LEFT JOIN user_fiche_progress ufp ON f.id = ufp.fiche_id
LEFT JOIN user_fiche_bookmarks ufb ON f.id = ufb.fiche_id
GROUP BY f.id, f.slug, f.title, f.fiche_type, f.discipline, f.difficulty_level,
         f.estimated_duration, f.frequency_rating, f.times_viewed
ORDER BY f.times_viewed DESC;

COMMENT ON VIEW v_popular_fiches IS 'Most viewed and popular fiches with aggregated stats';

CREATE OR REPLACE VIEW v_circuit_details AS
SELECT
    c.id,
    c.title,
    c.description,
    c.is_public,
    c.is_predefined,
    c.difficulty_level,
    c.times_used,
    c.created_at,
    COUNT(cf.fiche_id) as fiche_count,
    SUM(f.estimated_duration) as total_duration,
    COALESCE(c.user_id, u.id) as creator_id,
    u.email as creator_email
FROM circuits c
LEFT JOIN circuit_fiches cf ON c.id = cf.circuit_id
LEFT JOIN fiches f ON cf.fiche_id = f.id
LEFT JOIN users u ON c.user_id = u.id
GROUP BY c.id, c.title, c.description, c.is_public, c.is_predefined,
         c.difficulty_level, c.times_used, c.created_at, c.user_id, u.id, u.email;

COMMENT ON VIEW v_circuit_details IS 'Circuits with aggregated information';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 007: Navigation Enhancement V2 - COMPLETED';
    RAISE NOTICE 'Enhanced: fiches, user_fiche_progress tables';
    RAISE NOTICE 'Added: categories, circuits, study_sessions, notifications';
    RAISE NOTICE 'Created: analytics views';
END $$;
