-- Migration: Add user notes table
-- Created: 2025-10-14

-- User notes for fiches
CREATE TABLE IF NOT EXISTS user_fiche_notes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fiche_id INTEGER NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fiche_id, id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_fiche_notes_user ON user_fiche_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fiche_notes_fiche ON user_fiche_notes(fiche_id);
CREATE INDEX IF NOT EXISTS idx_user_fiche_notes_created ON user_fiche_notes(created_at DESC);
