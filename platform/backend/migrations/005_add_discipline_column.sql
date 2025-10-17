-- Migration 005: Add discipline column to fiches table for medical categorization

-- Add discipline column
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS discipline VARCHAR(100);

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_fiches_discipline ON fiches(discipline);

-- Update existing RMS fiches with disciplines
UPDATE fiches SET discipline = 'Gastro-entérologie'
WHERE title LIKE '%Abdominal%' OR title LIKE '%Abdo%';

UPDATE fiches SET discipline = 'Cardiologie'
WHERE title LIKE '%Cardiovasculaire%' OR title LIKE '%CV%' OR title LIKE '%cardiaque%';

UPDATE fiches SET discipline = 'Pneumologie'
WHERE title LIKE '%Pulmonaire%' OR title LIKE '%Respiratoire%' OR title LIKE '%Thorax%';

UPDATE fiches SET discipline = 'Neurologie'
WHERE title LIKE '%Neurologique%' OR title LIKE '%Neuro %' OR title LIKE '%mental%';

UPDATE fiches SET discipline = 'Orthopédie/Rhumatologie'
WHERE title LIKE '%coude%' OR title LIKE '%épaule%' OR title LIKE '%genou%'
   OR title LIKE '%hanche%' OR title LIKE '%main%' OR title LIKE '%poignet%'
   OR title LIKE '%pied%' OR title LIKE '%cheville%' OR title LIKE '%rachis%'
   OR title LIKE '%GALS%' OR title LIKE '%musculosquelettique%';

UPDATE fiches SET discipline = 'Dermatologie'
WHERE title LIKE '%dermatologique%' OR title LIKE '%Dermat%';

UPDATE fiches SET discipline = 'Néphrologie/Urologie'
WHERE title LIKE '%néphrologique%' OR title LIKE '%urologique%' OR title LIKE '%Urol%';

UPDATE fiches SET discipline = 'Psychiatrie'
WHERE title LIKE '%psychiatrique%' OR title LIKE '%Psych%' AND discipline IS NULL;

UPDATE fiches SET discipline = 'Pédiatrie'
WHERE title LIKE '%pédiatrique%' OR title LIKE '%nouveau-né%' OR title LIKE '%enfant%';

UPDATE fiches SET discipline = 'Gynéco-Obstétrique'
WHERE title LIKE '%gynéco%' OR title LIKE '%obstétrique%';

UPDATE fiches SET discipline = 'ORL/Ophtalmologie'
WHERE title LIKE '%ORL%' OR title LIKE '%ophtalmologique%' OR title LIKE '%œil%';

UPDATE fiches SET discipline = 'Médecine d''urgence'
WHERE title LIKE '%urgence%' OR title LIKE '%polytraumatisme%'
   OR title LIKE '%intoxication%' OR title LIKE '%réanimation%';

-- Comment on column
COMMENT ON COLUMN fiches.discipline IS 'Medical specialty/discipline category for organizing fiches';
