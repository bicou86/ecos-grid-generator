#!/usr/bin/env python3
"""
Import ECOS JSON Cases to clinical_cases table
Imports ECOS grids from generated/json/ into PostgreSQL database
"""

import os
import re
import json
import psycopg2
from pathlib import Path
from datetime import datetime
import uuid

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'ecos_secure_password_2025'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# Source mapping
SOURCE_MAP = {
    'AMBOSS': 'AMBOSS',
    'AMBOSS-ChatGPT': 'AMBOSS-ChatGPT',
    'ChatGPT_AMBOSS': 'AMBOSS-ChatGPT',
    'German': 'German',
    'RESCOS': 'RESCOS',
    'Thieme': 'Thieme',
    'USMLE': 'USMLE',
    'USMLE Mini': 'USMLE Mini',
    'USMLE Triage': 'USMLE Triage',
    'Vignettes': 'Vignettes'
}

def get_db_connection():
    """Get PostgreSQL connection"""
    return psycopg2.connect(**DB_CONFIG)

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = slug.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    slug = slug.replace('à', 'a').replace('â', 'a')
    slug = slug.replace('ô', 'o').replace('ö', 'o')
    slug = slug.replace('û', 'u').replace('ü', 'u').replace('ù', 'u')
    slug = slug.replace('ç', 'c')
    slug = slug.replace('î', 'i').replace('ï', 'i')
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:200]

def import_json_case(conn, json_path, source):
    """Import a single JSON case file"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        title = data.get('title', Path(json_path).stem)
        slug = create_slug(title)

        # Extract context
        context = data.get('context', {})
        setting = context.get('setting', '') if isinstance(context, dict) else ''
        patient_description = context.get('patient', '') if isinstance(context, dict) else ''
        vitals = context.get('vitals') if isinstance(context, dict) else None

        # Extract sections
        sections = data.get('sections', {})
        anamnese_section = sections.get('anamnese', {'weight': 0.25, 'criteria': []})
        examen_section = sections.get('examen', {'weight': 0.25, 'criteria': []})
        management_section = sections.get('management', {'weight': 0.25, 'criteria': []})
        cloture_section = sections.get('cloture', {'weight': 0, 'criteria': []})

        # Extract annexes
        annexes = data.get('annexes', {})
        images = annexes.get('images', [])

        # Determine difficulty
        difficulty_level = 'intermediate'  # Default
        if 'USMLE Mini' in source:
            difficulty_level = 'beginner'
        elif 'AMBOSS' in source:
            difficulty_level = 'advanced'

        # Check if already exists
        cur = conn.cursor()
        cur.execute("SELECT id FROM clinical_cases WHERE slug = %s", (slug,))
        existing = cur.fetchone()

        if existing:
            # Update
            case_id = existing[0]
            cur.execute("""
                UPDATE clinical_cases
                SET title = %s, setting = %s, patient_description = %s,
                    vitals = %s, anamnese_section = %s, examen_section = %s,
                    management_section = %s, cloture_section = %s,
                    annexes = %s, images = %s, source = %s,
                    difficulty_level = %s, updated_at = %s
                WHERE id = %s
            """, (
                title, setting, patient_description,
                json.dumps(vitals) if vitals else None,
                json.dumps(anamnese_section),
                json.dumps(examen_section),
                json.dumps(management_section),
                json.dumps(cloture_section) if cloture_section else None,
                json.dumps(annexes) if annexes else None,
                json.dumps(images) if images else None,
                source, difficulty_level,
                datetime.now(),
                case_id
            ))
            print(f"  ✅ Updated: {title}")
        else:
            # Insert
            case_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO clinical_cases (
                    id, title, slug, setting, patient_description,
                    vitals, anamnese_section, examen_section,
                    management_section, cloture_section,
                    annexes, images, source, difficulty_level,
                    is_published, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                case_id, title, slug, setting, patient_description,
                json.dumps(vitals) if vitals else None,
                json.dumps(anamnese_section),
                json.dumps(examen_section),
                json.dumps(management_section),
                json.dumps(cloture_section) if cloture_section else None,
                json.dumps(annexes) if annexes else None,
                json.dumps(images) if images else None,
                source, difficulty_level, True,
                datetime.now(), datetime.now()
            ))
            print(f"  ✅ Inserted: {title}")

        conn.commit()
        cur.close()
        return True

    except Exception as e:
        print(f"  ❌ Error importing {json_path.name}: {str(e)[:100]}")
        conn.rollback()
        return False

def import_from_directory(base_dir):
    """Import all JSON files from generated/json/"""
    print("\n" + "="*60)
    print("🚀 ECOS JSON Cases Import to clinical_cases")
    print("="*60 + "\n")

    conn = get_db_connection()
    print("✅ Connected to database\n")

    total_imported = 0
    total_errors = 0
    total_skipped = 0

    # Iterate through source directories
    for source_dir in sorted(Path(base_dir).iterdir()):
        if not source_dir.is_dir() or source_dir.name.startswith('.'):
            continue

        # Skip json_feuille-porte (not full cases)
        if source_dir.name == 'json_feuille-porte':
            print(f"⏭️  Skipping: {source_dir.name} (door sheets only)")
            total_skipped += 1
            continue

        source_name = SOURCE_MAP.get(source_dir.name, source_dir.name)
        print(f"\n📁 Processing: {source_name}")
        print("-" * 60)

        json_files = list(source_dir.glob('*.json'))
        print(f"Found {len(json_files)} JSON files")

        for json_file in sorted(json_files):
            if import_json_case(conn, json_file, source_name):
                total_imported += 1
            else:
                total_errors += 1

    conn.close()

    print("\n" + "="*60)
    print("✅ Import Complete!")
    print(f"📊 Total imported: {total_imported}")
    print(f"❌ Total errors: {total_errors}")
    print(f"⏭️  Total skipped: {total_skipped} directories")
    print("="*60 + "\n")

if __name__ == '__main__':
    # Path to generated/json/
    json_base_dir = Path(__file__).parent.parent.parent / 'generated' / 'json'

    if not json_base_dir.exists():
        print(f"❌ Error: Directory not found: {json_base_dir}")
        print("Make sure you're running from the correct location")
        exit(1)

    print(f"📂 Scanning: {json_base_dir}")
    import_from_directory(json_base_dir)
