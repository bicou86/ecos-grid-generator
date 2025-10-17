#!/usr/bin/env python3
"""
Import RMS (Revue Médicale Suisse Étudiants) examination guide fiches
These are clinical examination guides with detailed content and images
"""

import os
import re
import json
import psycopg2
import psycopg2.extras
import html
from datetime import datetime

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# RMS HTML files mapping (filename -> clean title)
RMS_FILES = {
    'RMS-Abdominal.html': 'RMS - Examen Abdominal',
    'RMS-Abdo.html': 'RMS - Examen Abdominal (Court)',
    'RMS-CV.html': 'RMS - Examen Cardiovasculaire',
    'RMS-Coude.html': 'RMS - Examen Clinique du Coude',
    'RMS-Epaule.html': 'RMS - Examen Clinique de l\'Épaule',
    'RMS-GALS.html': 'RMS - GALS (Examen de Dépistage Musculosquelettique)',
    'RMS-Genou.html': 'RMS - Examen Clinique du Genou',
    'RMS-Hanche.html': 'RMS - Examen Clinique de la Hanche',
    'RMS-Main-Poignet.html': 'RMS - Examen Clinique de la Main et du Poignet',
    'RMS-Neuro.html': 'RMS - Examen Neurologique',
    'RMS-Pied-Cheville.html': 'RMS - Examen Clinique du Pied et de la Cheville',
    'RMS-Pulmo.html': 'RMS - Examen Pulmonaire/Respiratoire',
    'RMS-Rachis.html': 'RMS - Examen Clinique du Rachis',
}

def create_slug(title):
    """Create URL-friendly slug from title"""
    # Remove RMS prefix for slug
    slug = title.replace('RMS - ', '').lower()
    slug = slug.replace('\'', '-')
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def html_to_markdown(html_content):
    """
    Convert HTML content to markdown using regex
    Preserves structure while making it database-friendly
    """
    # Remove script and style tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)

    # Extract main content area
    main_match = re.search(r'<div class="main-content">(.*?)</div>\s*<!-- Sidebar', content, re.DOTALL)
    if main_match:
        content = main_match.group(1)
    else:
        # Fallback: extract from body
        body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
        if body_match:
            content = body_match.group(1)

    # Convert headings
    content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n# \1\n', content, flags=re.DOTALL)
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n', content, flags=re.DOTALL)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n', content, flags=re.DOTALL)
    content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'\n#### \1\n', content, flags=re.DOTALL)

    # Convert lists - handle nested structure
    # Convert list items to markdown bullets
    content = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '- ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n', content, flags=re.DOTALL)

    # Remove ul/ol tags
    content = re.sub(r'</?ul[^>]*>', '', content)
    content = re.sub(r'</?ol[^>]*>', '', content)

    # Convert paragraphs
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', content, flags=re.DOTALL)

    # Convert spans with pathology class to bold
    content = re.sub(r'<span class="pathology">(.*?)</span>', r'**\1**', content, flags=re.DOTALL)

    # Convert figure references to plain text
    content = re.sub(r'<span class="figure-ref"[^>]*>\(voir Fig\. \d+\)</span>', '', content, flags=re.DOTALL)

    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)

    # Decode HTML entities
    content = html.unescape(content)

    # Clean up whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = content.strip()

    return content

def extract_tags(title, content):
    """Extract relevant tags from title and content"""
    tags = ['RMS', 'examen clinique', 'skills']

    # Add body region tags
    if any(word in title.lower() for word in ['abdominal', 'abdo']):
        tags.extend(['abdomen', 'gastro-entérologie'])
    elif 'cardiovasculaire' in title.lower() or 'cv' in title.lower():
        tags.extend(['cœur', 'cardiologie'])
    elif 'pulmonaire' in title.lower() or 'respiratoire' in title.lower():
        tags.extend(['poumons', 'pneumologie'])
    elif 'neurologique' in title.lower() or 'neuro' in title.lower():
        tags.extend(['neurologie', 'système nerveux'])
    elif any(word in title.lower() for word in ['coude', 'épaule', 'genou', 'hanche', 'main', 'poignet', 'pied', 'cheville', 'rachis', 'gals']):
        tags.extend(['musculosquelettique', 'orthopédie'])

    return tags

def import_rms_fiche(cursor, filename, title, source_dir):
    """Import a single RMS fiche"""
    filepath = os.path.join(source_dir, filename)

    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return False

    # Read HTML file
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Convert to markdown
    markdown_content = html_to_markdown(html_content)

    # Generate metadata
    slug = create_slug(title)
    tags = extract_tags(title, markdown_content)

    # Check if already exists
    cursor.execute("SELECT id FROM fiches WHERE slug = %s", (slug,))
    existing = cursor.fetchone()

    if existing:
        print(f"⏭️  Skipping {title} - already exists (id: {existing[0]})")
        return False

    # Insert into database
    cursor.execute("""
        INSERT INTO fiches (
            title, slug, fiche_type, content_markdown,
            metadata, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s::jsonb, %s, %s
        )
        RETURNING id
    """, (
        title,
        slug,
        'skills',  # RMS fiches are clinical examination guides
        markdown_content,
        json.dumps({
            'source': 'Revue Médicale Suisse Étudiants',
            'tags': tags  # Store tags in metadata for now
        }),
        datetime.now(),
        datetime.now()
    ))

    fiche_id = cursor.fetchone()[0]
    print(f"✅ Imported: {title} (id: {fiche_id})")
    return True

def main():
    """Main import function"""
    source_dir = '/Users/damienfulliquet/Documents/GitHub/ecos-skills-summary/Fiches_HTML'

    print("🔄 Importing RMS Examination Guide Fiches...")
    print(f"📁 Source: {source_dir}\n")

    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        imported = 0
        skipped = 0

        for filename, title in RMS_FILES.items():
            if import_rms_fiche(cursor, filename, title, source_dir):
                imported += 1
            else:
                skipped += 1

        # Commit changes
        conn.commit()

        print(f"\n✨ Import complete!")
        print(f"   Imported: {imported}")
        print(f"   Skipped: {skipped}")
        print(f"   Total: {imported + skipped}")

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
