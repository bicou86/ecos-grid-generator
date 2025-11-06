#!/usr/bin/env python3
"""
Import ECOS JSON Cases to clinical_cases table
Simplified importer for json_files/ directory structure
"""

import os
import re
import json
import sys
import psycopg2
from pathlib import Path
from datetime import datetime

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
    'German': 'Cases allemands',
    'RESCOS': 'RESCOS',
    'Thieme': 'Thieme',
    'USMLE': 'USMLE',
    'USMLE Mini': 'USMLE Mini',
    'USMLE Triage': 'USMLE Triage',
    'Vignettes': 'Vignettes',
}

def get_db_connection():
    """Get PostgreSQL connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        sys.exit(1)

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    # Replace accented characters
    replacements = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a', 'ä': 'a',
        'ô': 'o', 'ö': 'o',
        'û': 'u', 'ü': 'u', 'ù': 'u',
        'ç': 'c',
        'î': 'i', 'ï': 'i',
        'ÿ': 'y'
    }
    for old, new in replacements.items():
        slug = slug.replace(old, new)

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
        difficulty_level = 'intermediate'
        if 'Mini' in source:
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
                    difficulty_level = %s, is_published = %s,
                    updated_at = %s
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
                source, difficulty_level, True,
                datetime.now(),
                case_id
            ))
            print(f"  🔄 Updated: {title}")
        else:
            # Insert
            cur.execute("""
                INSERT INTO clinical_cases (
                    title, slug, setting, patient_description,
                    vitals, anamnese_section, examen_section,
                    management_section, cloture_section,
                    annexes, images, source, difficulty_level,
                    is_published, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                title, slug, setting, patient_description,
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

    except json.JSONDecodeError as e:
        print(f"  ⚠️  JSON Error in {json_path.name}: {str(e)[:80]}")
        return False
    except Exception as e:
        print(f"  ❌ Error importing {json_path.name}: {str(e)[:100]}")
        conn.rollback()
        return False

def import_from_directory(base_dir, source_filter=None):
    """Import all JSON files from json_files/"""
    print("\n" + "="*60)
    print("🚀 ECOS JSON Cases Import to clinical_cases")
    print("="*60 + "\n")

    base_path = Path(base_dir)
    if not base_path.exists():
        print(f"❌ Error: Directory not found: {base_path}")
        sys.exit(1)

    print(f"📂 Scanning: {base_path}")

    conn = get_db_connection()
    print("✅ Connected to database\n")

    total_imported = 0
    total_updated = 0
    total_errors = 0
    total_skipped = 0

    # Directories to process
    source_dirs = ['AMBOSS', 'RESCOS', 'USMLE', 'German', 'Thieme', 'Vignettes']

    if source_filter:
        source_dirs = [d for d in source_dirs if d.lower() == source_filter.lower()]

    # First, process root-level USMLE Triage files
    print(f"\n📁 Processing: USMLE Triage (root level)")
    print("-" * 60)
    root_usmle_files = list(base_path.glob('USMLE Triage*.json'))
    if root_usmle_files:
        print(f"  Found {len(root_usmle_files)} USMLE Triage JSON files")
        for i, json_file in enumerate(root_usmle_files, 1):
            if i % 10 == 0:
                print(f"  Progress: {i}/{len(root_usmle_files)}")

            success = import_json_case(conn, json_file, 'USMLE Triage')
            if success:
                total_imported += 1
            else:
                total_errors += 1
    else:
        print(f"  ⚠️  No USMLE Triage files found in root")

    for source_name in source_dirs:
        source_dir = base_path / source_name

        if not source_dir.exists():
            print(f"⏭️  Skipping: {source_name} (directory not found)")
            total_skipped += 1
            continue

        source_label = SOURCE_MAP.get(source_name, source_name)
        print(f"\n📁 Processing: {source_label}")
        print("-" * 60)

        json_files = list(source_dir.glob('*.json'))

        if not json_files:
            print(f"  ⚠️  No JSON files found in {source_name}")
            continue

        print(f"  Found {len(json_files)} JSON files")

        for i, json_file in enumerate(json_files, 1):
            if i % 10 == 0:
                print(f"  Progress: {i}/{len(json_files)}")

            success = import_json_case(conn, json_file, source_label)
            if success:
                total_imported += 1
            else:
                total_errors += 1

    conn.close()

    print("\n" + "="*60)
    print("✅ Import Complete!")
    print(f"📊 Total processed: {total_imported}")
    print(f"❌ Total errors: {total_errors}")
    print(f"⏭️  Total skipped: {total_skipped} directories")
    print("="*60 + "\n")

    return total_imported, total_errors

if __name__ == '__main__':
    # Get arguments
    if len(sys.argv) > 1:
        json_base_dir = sys.argv[1]
    else:
        # Default: look for json_files/ in project root
        json_base_dir = Path(__file__).parent.parent.parent / 'json_files'

    source_filter = sys.argv[2] if len(sys.argv) > 2 else None

    if not Path(json_base_dir).exists():
        print(f"❌ Error: Directory not found: {json_base_dir}")
        print("Usage: python3 import_json_files.py [json_directory] [source_name]")
        sys.exit(1)

    print(f"📂 JSON Directory: {json_base_dir}")
    if source_filter:
        print(f"🔍 Filter: {source_filter}")

    import_from_directory(json_base_dir, source_filter)
