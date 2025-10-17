-- ================================================================
-- ECOS Platform - Database Schema
-- Système de gestion centralisée des cas cliniques ECOS
-- Version: 1.0 - PostgreSQL
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE: users (Gestion des utilisateurs)
-- ================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'contributor')),
    subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'monthly', 'yearly', 'lifetime')),
    subscription_status VARCHAR(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    CONSTRAINT valid_subscription CHECK (
        (subscription_status = 'active' AND subscription_start_date IS NOT NULL) OR
        (subscription_status != 'active')
    )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_status, subscription_end_date);

-- ================================================================
-- TABLE: categories (Catégories de cas cliniques)
-- ================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ================================================================
-- TABLE: specialties (Spécialités médicales)
-- ================================================================
CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specialties_slug ON specialties(slug);

-- ================================================================
-- TABLE: clinical_cases (Cas cliniques ECOS)
-- ================================================================
CREATE TABLE clinical_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Context
    setting TEXT,
    patient_description TEXT,

    -- Vital signs (JSON for flexibility)
    vitals JSONB,

    -- Sections (JSON structure)
    anamnese_section JSONB NOT NULL,
    examen_section JSONB NOT NULL,
    management_section JSONB NOT NULL,
    cloture_section JSONB,

    -- Annexes
    annexes JSONB,

    -- Images
    images JSONB, -- Array of image objects

    -- Metadata
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_time_minutes INTEGER DEFAULT 13,
    source VARCHAR(100), -- AMBOSS, USMLE, RESCOS, etc.
    original_file_path TEXT,

    -- Publishing
    is_published BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,

    -- Stats
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,

    -- Full-text search
    search_vector tsvector,

    CONSTRAINT valid_score CHECK (average_score IS NULL OR (average_score >= 0 AND average_score <= 100))
);

CREATE INDEX idx_cases_category ON clinical_cases(category_id);
CREATE INDEX idx_cases_slug ON clinical_cases(slug);
CREATE INDEX idx_cases_published ON clinical_cases(is_published, is_premium);
CREATE INDEX idx_cases_source ON clinical_cases(source);
CREATE INDEX idx_cases_difficulty ON clinical_cases(difficulty_level);
CREATE INDEX idx_cases_search ON clinical_cases USING GIN(search_vector);

-- ================================================================
-- TABLE: case_specialties (Relation many-to-many)
-- ================================================================
CREATE TABLE case_specialties (
    case_id UUID REFERENCES clinical_cases(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (case_id, specialty_id)
);

CREATE INDEX idx_case_specialties_case ON case_specialties(case_id);
CREATE INDEX idx_case_specialties_specialty ON case_specialties(specialty_id);

-- ================================================================
-- TABLE: case_tags (Tags pour recherche avancée)
-- ================================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'symptom', 'diagnosis', 'exam', 'treatment'
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_category ON tags(category);

CREATE TABLE case_tags (
    case_id UUID REFERENCES clinical_cases(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (case_id, tag_id)
);

CREATE INDEX idx_case_tags_case ON case_tags(case_id);
CREATE INDEX idx_case_tags_tag ON case_tags(tag_id);

-- ================================================================
-- TABLE: user_progress (Progression des utilisateurs)
-- ================================================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES clinical_cases(id) ON DELETE CASCADE,

    -- Progress tracking
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),

    -- Scores (JSON for detailed section scores)
    scores JSONB,
    total_score DECIMAL(5,2),
    grade VARCHAR(1) CHECK (grade IN ('A', 'B', 'C', 'D', 'E')),

    -- Attempts
    attempt_number INTEGER DEFAULT 1,
    time_spent_seconds INTEGER,

    -- Feedback
    user_notes TEXT,
    bookmarked BOOLEAN DEFAULT FALSE,

    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, case_id, attempt_number)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_case ON user_progress(case_id);
CREATE INDEX idx_user_progress_status ON user_progress(user_id, status);
CREATE INDEX idx_user_progress_bookmarked ON user_progress(user_id, bookmarked);

-- ================================================================
-- TABLE: user_statistics (Statistiques agrégées)
-- ================================================================
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Global stats
    total_cases_viewed INTEGER DEFAULT 0,
    total_cases_completed INTEGER DEFAULT 0,
    total_study_time_hours DECIMAL(10,2) DEFAULT 0,

    -- Performance
    average_score DECIMAL(5,2),
    best_score DECIMAL(5,2),

    -- Streaks
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,

    -- By difficulty
    beginner_completed INTEGER DEFAULT 0,
    intermediate_completed INTEGER DEFAULT 0,
    advanced_completed INTEGER DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_statistics_user ON user_statistics(user_id);

-- ================================================================
-- TABLE: user_sessions (Sessions utilisateur)
-- ================================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- ================================================================
-- TABLE: payments (Paiements)
-- ================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stripe_payment_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CHF',

    subscription_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

    payment_method VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ================================================================
-- TABLE: audit_logs (Logs d'audit)
-- ================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ================================================================
-- TABLE: generated_cases (Cas générés via l'interface)
-- ================================================================
CREATE TABLE generated_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Original file info
    original_filename VARCHAR(500),
    file_size_bytes INTEGER,
    file_type VARCHAR(50),

    -- Processing status
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    error_message TEXT,

    -- Generated data
    extracted_text TEXT,
    generated_json JSONB,
    clinical_case_id UUID REFERENCES clinical_cases(id) ON DELETE SET NULL,

    -- Processing times
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_duration_seconds INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_cases_user ON generated_cases(user_id);
CREATE INDEX idx_generated_cases_status ON generated_cases(status);
CREATE INDEX idx_generated_cases_clinical_case ON generated_cases(clinical_case_id);

-- ================================================================
-- TABLE: feedback (Feedback utilisateurs)
-- ================================================================
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES clinical_cases(id) ON DELETE CASCADE,

    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type VARCHAR(50) CHECK (feedback_type IN ('bug', 'improvement', 'content', 'general')),

    is_resolved BOOLEAN DEFAULT FALSE,
    admin_response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_case ON feedback(case_id);
CREATE INDEX idx_feedback_resolved ON feedback(is_resolved);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_cases_updated_at BEFORE UPDATE ON clinical_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_case_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.patient_description, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(NEW.setting, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_case_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, patient_description, setting
    ON clinical_cases
    FOR EACH ROW EXECUTE FUNCTION update_case_search_vector();

-- ================================================================
-- INITIAL DATA: Categories
-- ================================================================
INSERT INTO categories (name, slug, description, color, display_order) VALUES
    ('AMBOSS', 'amboss', 'Cas cliniques de la plateforme AMBOSS', '#667eea', 1),
    ('AMBOSS-ChatGPT', 'amboss-chatgpt', 'Cas AMBOSS enrichis par IA', '#764ba2', 2),
    ('German', 'german', 'Cas allemands traduits en français', '#f093fb', 3),
    ('RESCOS', 'rescos', 'Cas cliniques suisses RESCOS', '#f5576c', 4),
    ('Thieme', 'thieme', 'Cas de l''éditeur Thieme', '#4facfe', 5),
    ('USMLE', 'usmle', 'Cas style examen américain USMLE', '#00f2fe', 6),
    ('USMLE Triage', 'usmle-triage', 'Cas USMLE catégorie triage', '#fa709a', 7),
    ('Vignettes', 'vignettes', 'Vignettes cliniques courtes', '#fee140', 8);

-- ================================================================
-- INITIAL DATA: Specialties
-- ================================================================
INSERT INTO specialties (name, slug, description, color, display_order) VALUES
    ('Médecine Générale', 'medecine-generale', 'Médecine de premier recours', '#3498db', 1),
    ('Pédiatrie', 'pediatrie', 'Médecine des enfants et adolescents', '#e74c3c', 2),
    ('Chirurgie', 'chirurgie', 'Chirurgie générale et spécialisée', '#9b59b6', 3),
    ('Gynécologie-Obstétrique', 'gynecologie-obstetrique', 'Santé de la femme', '#e91e63', 4),
    ('Cardiologie', 'cardiologie', 'Pathologies cardiovasculaires', '#f44336', 5),
    ('Pneumologie', 'pneumologie', 'Pathologies respiratoires', '#2196f3', 6),
    ('Gastro-entérologie', 'gastro-enterologie', 'Pathologies digestives', '#ff9800', 7),
    ('Neurologie', 'neurologie', 'Pathologies neurologiques', '#673ab7', 8),
    ('Psychiatrie', 'psychiatrie', 'Santé mentale', '#9c27b0', 9),
    ('Dermatologie', 'dermatologie', 'Pathologies cutanées', '#ff5722', 10),
    ('ORL', 'orl', 'Oto-rhino-laryngologie', '#00bcd4', 11),
    ('Ophtalmologie', 'ophtalmologie', 'Pathologies oculaires', '#4caf50', 12),
    ('Urgences', 'urgences', 'Médecine d''urgence', '#f44336', 13),
    ('Rhumatologie', 'rhumatologie', 'Pathologies ostéo-articulaires', '#795548', 14),
    ('Endocrinologie', 'endocrinologie', 'Pathologies hormonales', '#607d8b', 15);

-- ================================================================
-- VIEWS: Useful queries
-- ================================================================

-- View: Complete case info with category and specialties
CREATE VIEW v_cases_complete AS
SELECT
    cc.id,
    cc.title,
    cc.slug,
    cc.setting,
    cc.patient_description,
    cc.vitals,
    cc.difficulty_level,
    cc.estimated_time_minutes,
    cc.source,
    cc.is_published,
    cc.is_premium,
    cc.view_count,
    cc.completion_count,
    cc.average_score,
    cat.name as category_name,
    cat.slug as category_slug,
    cat.color as category_color,
    ARRAY_AGG(DISTINCT s.name) as specialties,
    ARRAY_AGG(DISTINCT t.name) as tags,
    cc.created_at,
    cc.published_at
FROM clinical_cases cc
LEFT JOIN categories cat ON cc.category_id = cat.id
LEFT JOIN case_specialties cs ON cc.id = cs.case_id
LEFT JOIN specialties s ON cs.specialty_id = s.id
LEFT JOIN case_tags ct ON cc.id = ct.case_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY cc.id, cat.name, cat.slug, cat.color;

-- View: User dashboard stats
CREATE VIEW v_user_dashboard AS
SELECT
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.subscription_type,
    u.subscription_status,
    us.total_cases_completed,
    us.average_score,
    us.current_streak_days,
    us.total_study_time_hours,
    COUNT(DISTINCT up.case_id) FILTER (WHERE up.status = 'completed') as completed_this_month,
    COUNT(DISTINCT up.case_id) FILTER (WHERE up.bookmarked = TRUE) as bookmarked_count
FROM users u
LEFT JOIN user_statistics us ON u.id = us.user_id
LEFT JOIN user_progress up ON u.id = up.user_id
    AND up.completed_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.email, u.first_name, u.last_name, u.subscription_type,
         u.subscription_status, us.total_cases_completed, us.average_score,
         us.current_streak_days, us.total_study_time_hours;

-- ================================================================
-- COMMENTS
-- ================================================================
COMMENT ON TABLE clinical_cases IS 'Cas cliniques ECOS avec structure JSON complète';
COMMENT ON TABLE users IS 'Utilisateurs avec gestion d''abonnements';
COMMENT ON TABLE user_progress IS 'Suivi de progression individuel par cas';
COMMENT ON TABLE payments IS 'Historique des paiements Stripe';
COMMENT ON COLUMN clinical_cases.search_vector IS 'Vecteur de recherche full-text';
COMMENT ON COLUMN clinical_cases.anamnese_section IS 'Section anamnèse au format JSON standardisé';
COMMENT ON COLUMN clinical_cases.vitals IS 'Signes vitaux: ta, fc, fr, temperature';
