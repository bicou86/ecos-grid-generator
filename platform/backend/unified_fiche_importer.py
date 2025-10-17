#!/usr/bin/env python3
"""
Unified Fiche Importer for ECOS Platform
Handles Reference, Skills, and Resumes HTML files
"""

import os
import re
import json
import shutil
import psycopg2
import html as html_lib
from pathlib import Path
from datetime import datetime

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# File type patterns and their metadata
FILE_PATTERNS = {
    'reference': {
        'pattern': r'^ref_(.+)\.html$',
        'fiche_type': 'skills',
        'source': 'Référence',
        'prefix': 'Référence - '
    },
    'skills': {
        'pattern': r'^Skills_(.+)\.html$',
        'fiche_type': 'skills',
        'source': 'Skills ECOS',
        'prefix': 'Skills - '
    },
    'resumes': {
        'pattern': r'^(.+)\.html$',
        'fiche_type': 'resume',
        'source': 'Résumé ECOS',
        'prefix': ''
    },
    'ssp': {
        'pattern': r'^SSP_(.+)\.html$',
        'fiche_type': 'ssp',
        'source': 'SSP - Station Standardisée',
        'prefix': 'SSP - '
    },
    'ssp_synthese': {
        'pattern': r'^Synthese_(.+)\.html$',
        'fiche_type': 'ssp',
        'source': 'SSP - Synthèse',
        'prefix': 'SSP Synthèse - '
    }
}

# Discipline mapping based on keywords
DISCIPLINE_MAP = {
    'cardiologie': ['cardiologique', 'cardiovasculaire', 'cardiaque', 'cv', 'coeur'],
    'pneumologie': ['pulmonaire', 'respiratoire', 'thorax', 'pulmo'],
    'gastro-entérologie': ['abdominal', 'abdo', 'digestif', 'intestin'],
    'orthopédie/rhumatologie': ['epaule', 'coude', 'main', 'poignet', 'hanche', 'genou',
                                  'cheville', 'pied', 'rachis', 'gals', 'musculosquelettique', 'msq'],
    'neurologie': ['neurologique', 'neuro', 'mental', 'craniens', 'nc', 'mmse', 'moca', 'glasgow'],
    'psychiatrie': ['psychiatrique', 'psy', 'suicidaire', 'bbn'],
    'pédiatrie': ['pediatrique', 'pediatrie', 'enfant', 'nouveau-ne', 'nn'],
    'gynéco-obstétrique': ['gyneco', 'gynecologique', 'obstetrique', 'gonio'],
    'dermatologie': ['dermatologique', 'dermatologie', 'peau'],
    'orl/ophtalmologie': ['orl', 'ophtalmo', 'ophtalmologique', 'oeil', 'weber', 'rinne', 'fond'],
    'néphrologie/urologie': ['nephrologique', 'urologique', 'renal', 'urinaire'],
    'médecine d\'urgence': ['urgence', 'reanimation', 'bls', 'life support', 'polytraumatisme',
                            'hypothermie', 'hyperthermie', 'intoxication', 'red flags'],
    'médecine générale': ['general', 'generale', 'consultation', 'communication', 'medicale',
                          'nutritionnelle', 'chute', 'perinee', 'rectal', 'tete', 'cou'],
    'pharmacologie': ['prescription', 'vasopresseur', 'inotrope', 'medicament'],
    'santé sexuelle': ['sexuelle', 'sexuel']
}

def detect_discipline(filename, title):
    """Auto-detect discipline from filename and title"""
    text = (filename + ' ' + title).lower()

    for discipline, keywords in DISCIPLINE_MAP.items():
        if any(keyword in text for keyword in keywords):
            return discipline.title()

    return 'Médecine générale'

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    # Remove prefix words
    slug = re.sub(r'^(référence|skills|résumé|rms)\s*[-–—:]\s*', '', slug, flags=re.IGNORECASE)
    # French characters
    slug = slug.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    slug = slug.replace('à', 'a').replace('â', 'a')
    slug = slug.replace('ô', 'o').replace('ö', 'o')
    slug = slug.replace('û', 'u').replace('ü', 'u')
    slug = slug.replace('ç', 'c')
    slug = slug.replace('œ', 'oe')
    slug = slug.replace('\'', '-')
    # Remove special characters
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def html_to_markdown(html_content):
    """Convert HTML to markdown using regex"""
    content = html_content

    # Remove script, style, and meta tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<meta[^>]*>', '', content, flags=re.IGNORECASE)

    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)

    # Extract main content if exists
    main_match = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL | re.IGNORECASE)
    if main_match:
        content = main_match.group(1)

    # Convert headings
    content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n# \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'\n#### \1\n', content, flags=re.DOTALL | re.IGNORECASE)

    # Convert lists
    content = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '- ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n',
                     content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'</?[uo]l[^>]*>', '', content, flags=re.IGNORECASE)

    # Convert paragraphs
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', content, flags=re.DOTALL | re.IGNORECASE)

    # Convert strong/bold
    content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', content, flags=re.DOTALL | re.IGNORECASE)

    # Convert emphasis/italic
    content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', content, flags=re.DOTALL | re.IGNORECASE)

    # Convert links
    content = re.sub(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r'[\2](\1)',
                     content, flags=re.DOTALL | re.IGNORECASE)

    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)

    # Decode HTML entities
    content = html_lib.unescape(content)

    # Clean up whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = re.sub(r' {2,}', ' ', content)
    content = content.strip()

    return content

def extract_title_from_html(html_content, filename):
    """Extract title from HTML file"""
    # Try <title> tag
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
    if title_match:
        title = title_match.group(1).strip()
        # Clean up
        title = re.sub(r'\s+', ' ', title)
        title = html_lib.unescape(title)
        if title and len(title) > 5 and len(title) < 200:
            return title

    # Try <h1> tag
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.IGNORECASE | re.DOTALL)
    if h1_match:
        title = h1_match.group(1).strip()
        title = re.sub(r'<[^>]+>', '', title)
        title = html_lib.unescape(title)
        if title and len(title) > 5:
            return title

    # Fallback: generate from filename
    title = filename.replace('.html', '')
    title = title.replace('_', ' ').replace('-', ' ')
    return title.title()

def import_fiche(cursor, filepath, file_type_info):
    """Import a single fiche from HTML file"""
    filename = os.path.basename(filepath)

    # Read HTML file
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"   ❌ Failed to read {filename}: {e}")
        return False

    # Extract title
    title = extract_title_from_html(html_content, filename)

    # Add prefix if specified
    if file_type_info['prefix'] and not title.startswith(file_type_info['prefix']):
        full_title = file_type_info['prefix'] + title
    else:
        full_title = title

    # Generate slug
    slug = create_slug(full_title)

    # Check if already exists
    cursor.execute("SELECT id, title FROM fiches WHERE slug = %s", (slug,))
    existing = cursor.fetchone()
    if existing:
        print(f"   ⏭️  Skipping: {full_title}")
        print(f"      Already exists as: {existing[1]} (ID: {existing[0]})")
        return False

    # Convert to markdown
    markdown_content = html_to_markdown(html_content)

    if len(markdown_content) < 50:
        print(f"   ⚠️  Warning: {filename} has very short content ({len(markdown_content)} chars)")

    # Detect discipline
    discipline = detect_discipline(filename, title)

    # Prepare metadata
    metadata = {
        'source': file_type_info['source'],
        'original_filename': filename
    }

    # Insert into database
    try:
        cursor.execute("""
            INSERT INTO fiches (
                title, slug, fiche_type, content_markdown,
                discipline, metadata, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s::jsonb, %s, %s
            )
            RETURNING id
        """, (
            full_title,
            slug,
            file_type_info['fiche_type'],
            markdown_content,
            discipline,
            json.dumps(metadata),
            datetime.now(),
            datetime.now()
        ))

        fiche_id = cursor.fetchone()[0]
        print(f"   ✅ Imported: {full_title}")
        print(f"      ID: {fiche_id} | Slug: {slug} | Discipline: {discipline}")
        return fiche_id
    except Exception as e:
        print(f"   ❌ Failed to import {filename}: {e}")
        return False

def import_batch(cursor, source_dir, file_pattern_info, pattern_type):
    """Import a batch of fiches"""
    pattern = file_pattern_info['pattern']
    imported = 0
    skipped = 0

    if not os.path.exists(source_dir):
        print(f"⚠️  Directory not found: {source_dir}")
        return imported, skipped

    # Find matching files
    files = []
    for filename in os.listdir(source_dir):
        if re.match(pattern, filename):
            files.append(filename)

    if not files:
        print(f"   No files matching pattern")
        return imported, skipped

    print(f"   Found {len(files)} files")

    for filename in sorted(files):
        filepath = os.path.join(source_dir, filename)
        result = import_fiche(cursor, filepath, file_pattern_info)
        if result:
            imported += 1
        else:
            skipped += 1

    return imported, skipped

def main():
    """Main import function"""
    base_dir = '/Users/damienfulliquet/Documents/GitHub/ecos-skills-summary/Fiches_HTML'

    print("🔄 Starting Unified Fiche Import...")
    print(f"📁 Source directory: {base_dir}\n")

    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        total_imported = 0
        total_skipped = 0

        # Import Reference fiches
        print("📚 REFERENCE FICHES (ref_*.html)")
        print("=" * 60)
        imported, skipped = import_batch(cursor, base_dir, FILE_PATTERNS['reference'], 'reference')
        total_imported += imported
        total_skipped += skipped
        print(f"   Imported: {imported}, Skipped: {skipped}\n")

        # Import Skills fiches
        print("🎯 SKILLS FICHES (Skills_*.html)")
        print("=" * 60)
        skills_dir = os.path.join(base_dir, 'Skills')
        imported, skipped = import_batch(cursor, skills_dir, FILE_PATTERNS['skills'], 'skills')
        total_imported += imported
        total_skipped += skipped
        print(f"   Imported: {imported}, Skipped: {skipped}\n")

        # Import Resumes fiches
        print("📝 RESUMES FICHES (Resumes/*.html)")
        print("=" * 60)
        resumes_dir = os.path.join(base_dir, 'Resumes')
        imported, skipped = import_batch(cursor, resumes_dir, FILE_PATTERNS['resumes'], 'resumes')
        total_imported += imported
        total_skipped += skipped
        print(f"   Imported: {imported}, Skipped: {skipped}\n")

        # Import SSP fiches
        print("🏥 SSP FICHES (SSP_*.html)")
        print("=" * 60)
        ssp_dir = os.path.join(base_dir, 'SSP')
        imported, skipped = import_batch(cursor, ssp_dir, FILE_PATTERNS['ssp'], 'ssp')
        total_imported += imported
        total_skipped += skipped
        print(f"   Imported: {imported}, Skipped: {skipped}\n")

        # Import SSP Synthese fiches
        print("📋 SSP SYNTHESE FICHES (Synthese_*.html)")
        print("=" * 60)
        ssp_synthese_dir = os.path.join(base_dir, 'SSP-Synthese')
        imported, skipped = import_batch(cursor, ssp_synthese_dir, FILE_PATTERNS['ssp_synthese'], 'ssp_synthese')
        total_imported += imported
        total_skipped += skipped
        print(f"   Imported: {imported}, Skipped: {skipped}\n")

        # Commit changes
        conn.commit()

        print("=" * 60)
        print(f"✨ Import Complete!")
        print(f"   Total Imported: {total_imported}")
        print(f"   Total Skipped: {total_skipped}")
        print(f"   Total Processed: {total_imported + total_skipped}")

        # Show summary by discipline
        print(f"\n📊 Summary by Discipline:")
        cursor.execute("""
            SELECT discipline, COUNT(*) as count
            FROM fiches
            WHERE discipline IS NOT NULL
            GROUP BY discipline
            ORDER BY count DESC
            LIMIT 15
        """)

        for discipline, count in cursor.fetchall():
            print(f"   {discipline}: {count} fiches")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == '__main__':
    main()
