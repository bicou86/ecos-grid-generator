#!/usr/bin/env python3
"""
Import SSP (Situations de Santé Prioritaires) fiches from JSON to fiches table
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

def import_ssp_fiche(conn, case_data, index):
    """Import a single SSP fiche"""
    try:
        # Extract data
        ssp_name = case_data.get('ssp', '').strip()
        if not ssp_name or ssp_name == 'NaN':
            return False

        # Create title
        annee = case_data.get('année', '')
        sujet = case_data.get('sujet', '')
        title = f"SSP - {ssp_name}"
        if annee:
            title += f" ({annee})"

        slug = create_slug(f"ssp-{ssp_name}-{index}")

        plainte = case_data.get('plainte', '')
        diagnostic = case_data.get('diagnostic', '')

        # Handle NaN values
        if plainte == 'NaN' or not plainte:
            plainte = None
        if diagnostic == 'NaN' or not diagnostic:
            diagnostic = None
        if annee == 'NaN':
            annee = None
        if sujet == 'NaN' or not sujet:
            sujet = None

        # Check if already exists
        cur = conn.cursor()
        cur.execute("SELECT id FROM fiches WHERE slug = %s", (slug,))
        existing = cur.fetchone()

        if existing:
            # Update
            cur.execute("""
                UPDATE fiches
                SET title = %s, ssp_name = %s, plainte = %s, diagnostic = %s,
                    annee = %s, sujet = %s, type = 'ssp', is_published = %s,
                    updated_at = %s
                WHERE id = %s
            """, (
                title, ssp_name, plainte, diagnostic,
                annee, sujet, True,
                datetime.now(),
                existing[0]
            ))
            result = "Updated"
        else:
            # Insert
            cur.execute("""
                INSERT INTO fiches (
                    title, slug, type, ssp_name, plainte, diagnostic,
                    annee, sujet, is_published, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                title, slug, 'ssp', ssp_name, plainte, diagnostic,
                annee, sujet, True, datetime.now(), datetime.now()
            ))
            result = "Inserted"

        conn.commit()
        cur.close()
        return result

    except Exception as e:
        print(f"  ❌ Error importing: {str(e)[:100]}")
        conn.rollback()
        return False

def import_from_json(json_path):
    """Import all SSP fiches from JSON file"""
    print("\n" + "="*60)
    print("🚀 ECOS SSP Fiches Import")
    print("="*60 + "\n")

    if not Path(json_path).exists():
        print(f"❌ Error: File not found: {json_path}")
        sys.exit(1)

    print(f"📂 Reading: {json_path}")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cases = data.get('cases', [])
    total_cases = len(cases)

    print(f"  Found {total_cases} cases in JSON\n")

    conn = get_db_connection()
    print("✅ Connected to database\n")

    inserted = 0
    updated = 0
    skipped = 0

    for idx, case_data in enumerate(cases, 1):
        if idx % 50 == 0:
            print(f"  Progress: {idx}/{total_cases}")

        result = import_ssp_fiche(conn, case_data, idx)
        if result == "Inserted":
            inserted += 1
        elif result == "Updated":
            updated += 1
        else:
            skipped += 1

    conn.close()

    print("\n" + "="*60)
    print("✅ Import Complete!")
    print(f"📊 Inserted: {inserted}")
    print(f"🔄 Updated: {updated}")
    print(f"⏭️  Skipped: {skipped}")
    print("="*60 + "\n")

    return inserted, updated, skipped

if __name__ == '__main__':
    json_file = '/app/../source-data/html/raw/ssp_complete_all_cases.json'

    if len(sys.argv) > 1:
        json_file = sys.argv[1]

    if not Path(json_file).exists():
        print(f"❌ Error: File not found: {json_file}")
        print("Usage: python3 import_fiches.py [json_file_path]")
        sys.exit(1)

    import_from_json(json_file)
