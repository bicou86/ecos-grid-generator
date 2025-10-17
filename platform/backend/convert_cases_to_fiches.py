#!/usr/bin/env python3
"""
Convert clinical_cases to fiches for frontend compatibility
Quick script to populate fiches table from existing clinical_cases
"""

import os
import psycopg2
import json

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'ecos_secure_password_2025'),
    'port': int(os.getenv('DB_PORT', 5432))
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def convert_cases_to_fiches():
    print("\n" + "="*60)
    print("🔄 Converting clinical_cases to fiches")
    print("="*60 + "\n")

    conn = get_db_connection()
    cur = conn.cursor()

    # Get all clinical cases
    cur.execute("""
        SELECT id, title, slug, setting, patient_description,
               vitals, anamnese_section, examen_section,
               management_section, cloture_section, annexes,
               source, difficulty_level, created_at
        FROM clinical_cases
        ORDER BY created_at DESC
    """)

    cases = cur.fetchall()
    print(f"Found {len(cases)} clinical cases to convert\n")

    total_inserted = 0
    total_errors = 0

    for case in cases:
        try:
            case_id, title, slug, setting, patient_desc, vitals, \
            anamnese, examen, management, cloture, annexes, \
            source, difficulty, created_at = case

            # Build markdown content from sections
            content_parts = []

            # Header
            content_parts.append(f"# {title}\n")
            if setting:
                content_parts.append(f"**Contexte** : {setting}\n")
            if patient_desc:
                content_parts.append(f"**Patient** : {patient_desc}\n")

            # Vitals
            if vitals:
                vitals_data = vitals if isinstance(vitals, dict) else json.loads(vitals)
                content_parts.append("\n## Signes Vitaux\n")
                for key, value in vitals_data.items():
                    content_parts.append(f"- {key}: {value}\n")

            # Sections
            if anamnese:
                anamnese_data = anamnese if isinstance(anamnese, dict) else json.loads(anamnese)
                content_parts.append("\n## 📋 ANAMNÈSE\n")
                content_parts.append(f"*Poids: {anamnese_data.get('weight', 0.25)*100}%*\n")

            if examen:
                examen_data = examen if isinstance(examen, dict) else json.loads(examen)
                content_parts.append("\n## 🩺 EXAMEN CLINIQUE\n")
                content_parts.append(f"*Poids: {examen_data.get('weight', 0.25)*100}%*\n")

            if management:
                management_data = management if isinstance(management, dict) else json.loads(management)
                content_parts.append("\n## 💊 MANAGEMENT\n")
                content_parts.append(f"*Poids: {management_data.get('weight', 0.25)*100}%*\n")

            content_markdown = "\n".join(content_parts)

            # Metadata
            metadata = {
                'case_id': str(case_id),
                'difficulty': difficulty,
                'has_vitals': vitals is not None,
                'has_cloture': cloture is not None,
                'has_annexes': annexes is not None
            }

            # Insert into fiches
            cur.execute("""
                INSERT INTO fiches (
                    slug, title, fiche_type, discipline, content_markdown,
                    metadata, is_published, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (slug) DO UPDATE
                SET title = EXCLUDED.title,
                    content_markdown = EXCLUDED.content_markdown,
                    metadata = EXCLUDED.metadata,
                    updated_at = EXCLUDED.updated_at
                RETURNING id
            """, (
                slug,
                title,
                'ecos_case',  # fiche_type
                source,  # discipline (using source as discipline for now)
                content_markdown,
                json.dumps(metadata),
                True,  # is_published
                created_at,
                created_at
            ))

            fiche_id = cur.fetchone()[0]

            # Link fiche to clinical case
            cur.execute("""
                INSERT INTO case_fiches (case_id, fiche_id, relevance_score)
                VALUES (%s, %s, 1.0)
                ON CONFLICT (case_id, fiche_id) DO NOTHING
            """, (case_id, fiche_id))

            conn.commit()
            print(f"  ✅ {title[:60]}...")
            total_inserted += 1

        except Exception as e:
            print(f"  ❌ Error converting {title[:40]}: {str(e)[:80]}")
            conn.rollback()
            total_errors += 1

    cur.close()
    conn.close()

    print("\n" + "="*60)
    print("✅ Conversion Complete!")
    print(f"📊 Total converted: {total_inserted}")
    print(f"❌ Total errors: {total_errors}")
    print("="*60 + "\n")

if __name__ == '__main__':
    convert_cases_to_fiches()
