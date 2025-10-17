#!/usr/bin/env python3
"""
Import ECOS JSON Cases to Database
Imports ECOS grids from generated/json/ into PostgreSQL database
"""

import os
import re
import json
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
    'ChatGPT_AMBOSS': 'ChatGPT AMBOSS'
}

def get_db_connection():
    """Get PostgreSQL connection"""
    return psycopg2.connect(**DB_CONFIG)

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    # French characters
    slug = slug.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    slug = slug.replace('à', 'a').replace('â', 'a')
    slug = slug.replace('ô', 'o').replace('ö', 'o')
    slug = slug.replace('û', 'u').replace('ü', 'u').replace('ù', 'u')
    slug = slug.replace('ç', 'c')
    slug = slug.replace('î', 'i').replace('ï', 'i')
    # Remove special characters
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:200]

def extract_keywords_from_json(data):
    """Extract keywords from JSON content"""
    keywords = set()

    title = data.get('title', '')
    if title:
        keywords.update(title.lower().split())

    # From context
    context = data.get('context', {})
    if isinstance(context, dict):
        patient = context.get('patient', '')
        if patient:
            keywords.update(patient.lower().split())

    return [k for k in keywords if len(k) > 3][:10]

def detect_discipline(title, content_str):
    """Auto-detect discipline from title and content"""
    text = (title + ' ' + content_str).lower()

    discipline_keywords = {
        'Cardiologie': ['cardiologique', 'cardiovasculaire', 'cardiaque', 'coeur', 'thoracique'],
        'Pneumologie': ['pulmonaire', 'respiratoire', 'thorax', 'toux'],
        'Gastro-entérologie': ['abdominal', 'digestif', 'intestin', 'ictère', 'diarrhée'],
        'Orthopédie': ['épaule', 'genou', 'hanche', 'talon', 'cheville', 'pied'],
        'Neurologie': ['neurologique', 'céphalée', 'migraine', 'paresthésie', 'vertige'],
        'Psychiatrie': ['psychiatrique', 'dépression', 'anxiété', 'suicidaire'],
        'Pédiatrie': ['pédiatrique', 'enfant', 'nouveau-né', 'pleurs'],
        'Gynéco-obstétrique': ['gynécologique', 'saignement vaginal', 'grossesse'],
        'Dermatologie': ['dermatologique', 'peau', 'éruption'],
        'ORL': ['orl', 'oreille', 'gorge', 'nez'],
        'Néphrologie': ['rénal', 'urinaire', 'anurie'],
        'Médecine d\'urgence': ['urgence', 'trauma', 'polytraumatisme']
    }

    for discipline, keywords in discipline_keywords.items():
        if any(keyword in text for keyword in keywords):
            return discipline

    return 'Médecine générale'

def import_json_case(conn, json_path, source):
    """Import a single JSON case file"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        title = data.get('title', Path(json_path).stem)
        slug = create_slug(title)

        # Convert JSON to string for content search
        content_str = json.dumps(data, ensure_ascii=False)

        # Extract metadata
        discipline = detect_discipline(title, content_str)
        keywords = extract_keywords_from_json(data)

        # Prepare fiche data
        fiche_data = {
            'title': title,
            'slug': slug,
            'fiche_type': 'ecos_grid',
            'source': source,
            'discipline': discipline,
            'content_text': content_str[:5000],  # First 5000 chars for search
            'content_json': json.dumps(data, ensure_ascii=False),
            'keywords': keywords,
            'is_favorite': False,
            'view_count': 0,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        # Check if already exists
        cur = conn.cursor()
        cur.execute("SELECT id FROM fiches WHERE slug = %s", (slug,))
        existing = cur.fetchone()

        if existing:
            # Update
            fiche_id = existing[0]
            cur.execute("""
                UPDATE fiches
                SET title = %s, content_json = %s, content_text = %s,
                    keywords = %s, updated_at = %s, discipline = %s
                WHERE id = %s
            """, (
                fiche_data['title'],
                fiche_data['content_json'],
                fiche_data['content_text'],
                fiche_data['keywords'],
                fiche_data['updated_at'],
                fiche_data['discipline'],
                fiche_id
            ))
            print(f"  ✅ Updated: {title}")
        else:
            # Insert
            cur.execute("""
                INSERT INTO fiches (
                    title, slug, fiche_type, source, discipline,
                    content_text, content_json, keywords,
                    is_favorite, view_count, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                fiche_data['title'],
                fiche_data['slug'],
                fiche_data['fiche_type'],
                fiche_data['source'],
                fiche_data['discipline'],
                fiche_data['content_text'],
                fiche_data['content_json'],
                fiche_data['keywords'],
                fiche_data['is_favorite'],
                fiche_data['view_count'],
                fiche_data['created_at'],
                fiche_data['updated_at']
            ))
            fiche_id = cur.fetchone()[0]
            print(f"  ✅ Inserted: {title}")

        conn.commit()
        cur.close()
        return True

    except Exception as e:
        print(f"  ❌ Error importing {json_path}: {e}")
        conn.rollback()
        return False

def import_from_directory(base_dir):
    """Import all JSON files from generated/json/"""
    print("\n" + "="*60)
    print("🚀 ECOS JSON Cases Import to Database")
    print("="*60 + "\n")

    conn = get_db_connection()
    print("✅ Connected to database\n")

    total_imported = 0
    total_errors = 0

    # Iterate through source directories
    for source_dir in Path(base_dir).iterdir():
        if not source_dir.is_dir() or source_dir.name.startswith('.'):
            continue

        source_name = SOURCE_MAP.get(source_dir.name, source_dir.name)
        print(f"\n📁 Processing: {source_name}")
        print("-" * 60)

        json_files = list(source_dir.glob('*.json'))
        print(f"Found {len(json_files)} JSON files")

        for json_file in json_files:
            if import_json_case(conn, json_file, source_name):
                total_imported += 1
            else:
                total_errors += 1

    conn.close()

    print("\n" + "="*60)
    print("✅ Import Complete!")
    print(f"📊 Total imported: {total_imported}")
    print(f"❌ Total errors: {total_errors}")
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
