#!/usr/bin/env python3
"""
Import Resume images and link them to Resume fiches
"""

import os
import re
import shutil
import psycopg2
from pathlib import Path

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# Resume directory mapping (folder name -> fiche slug keywords)
RESUME_DIRECTORIES = {
    'Resume-Abdo': ['abdomen', 'abdominal', 'gastro'],
    'Resume-Communication': ['communication', 'conseils'],
    'Resume-CV': ['cardiovasculaire', 'thorax', 'cardiologie'],
    'Resume-Epaule': ['epaule', 'musculo'],
    'Resume-GALS': ['gals', 'musculo'],
    'Resume-Gonio': ['gyneco', 'gynecologique', 'obstetrique'],
    'Resume-Gyneco': ['gyneco', 'gynecologique', 'obstetrique'],
    'Resume-Hanche-Genou': ['hanche', 'genou', 'musculo'],
    'Resume-Main': ['main', 'poignet', 'musculo'],
    'Resume-NC': ['craniens', 'nerf', 'neurologique'],
    'Resume-Neuro': ['neurologique', 'neurol'],
    'Resume-Ophtalmo': ['ophtalmo', 'oeil'],
    'Resume-ORL': ['orl', 'oreille'],
    'Resume-Pediatrie': ['pediatrique', 'pediatrie', 'enfant'],
    'Resume-Pied': ['pied', 'cheville', 'musculo'],
    'Resume-Psy': ['psychiatrique', 'psy'],
    'Resume-Pulmo': ['pulmonaire', 'respiratoire', 'thorax', 'pneumologie'],
    'Resume-Rachis': ['rachis', 'colonne', 'musculo'],
}

def get_fiches_by_keywords(cursor, keywords):
    """Find fiches matching any of the keywords"""
    fiches = []

    for keyword in keywords:
        cursor.execute("""
            SELECT id, slug, title, fiche_type
            FROM fiches
            WHERE (
                LOWER(title) LIKE %s
                OR LOWER(slug) LIKE %s
            )
            AND (fiche_type = 'resume' OR fiche_type = 'skills')
            ORDER BY id
        """, (f'%{keyword}%', f'%{keyword}%'))

        for row in cursor.fetchall():
            if row not in fiches:
                fiches.append(row)

    return fiches

def extract_image_order(filename):
    """
    Extract order number from filename
    Resume-XX-page-YY.jpg -> YY
    FIG X.jpg -> X
    """
    # Page number pattern
    page_match = re.search(r'page[-_]?(\d+)', filename, re.IGNORECASE)
    if page_match:
        return int(page_match.group(1))

    # Figure number pattern
    fig_match = re.search(r'FIG\s*(\d+)', filename, re.IGNORECASE)
    if fig_match:
        return int(fig_match.group(1))

    # Image number pattern
    img_match = re.search(r'img[-_]?(\d+)', filename, re.IGNORECASE)
    if img_match:
        return int(img_match.group(1))

    # Default
    return 999

def extract_description(filename, resume_name):
    """Extract description from filename"""
    name = os.path.splitext(filename)[0]

    # Page description
    if 'page' in name.lower():
        page_match = re.search(r'page[-_]?(\d+)', name, re.IGNORECASE)
        if page_match:
            return f"Page {page_match.group(1)}"

    # Figure description
    if 'fig' in name.lower():
        fig_match = re.search(r'FIG\s*(\d+)', name, re.IGNORECASE)
        if fig_match:
            return f"Figure {fig_match.group(1)}"

    return resume_name

def copy_image_to_frontend(source_path, filename, resume_dir):
    """Copy image to frontend public directory"""
    # Target: frontend/public/images/fiches/resumes/<resume-dir>/
    target_dir = Path('/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/frontend/public/images/fiches/resumes') / resume_dir.lower()
    target_dir.mkdir(parents=True, exist_ok=True)

    target_path = target_dir / filename

    # Copy file
    shutil.copy2(source_path, target_path)

    # Return relative path from /images/fiches/
    return f'resumes/{resume_dir.lower()}/{filename}'

def import_resume_images(cursor, resume_dir, keywords, source_base):
    """Import images for a specific Resume directory"""
    source_dir = os.path.join(source_base, resume_dir)

    if not os.path.exists(source_dir):
        print(f"⚠️  Directory not found: {source_dir}")
        return 0, 0

    # Get matching fiches
    fiches = get_fiches_by_keywords(cursor, keywords)

    if not fiches:
        print(f"⚠️  No fiches found for: {resume_dir} (keywords: {', '.join(keywords)})")
        return 0, 0

    print(f"\n📂 Processing {resume_dir}/ ({len(fiches)} fiche(s) matched)")
    for fiche_id, slug, title, ftype in fiches:
        print(f"   → {title} (id: {fiche_id}, type: {ftype})")

    # Find all images
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        image_files.extend(Path(source_dir).glob(ext))

    if not image_files:
        print(f"   No images found")
        return 0, 0

    imported = 0
    skipped = 0

    for image_path in sorted(image_files):
        filename = image_path.name

        # Copy to frontend
        try:
            relative_path = copy_image_to_frontend(str(image_path), filename, resume_dir)
        except Exception as e:
            print(f"   ❌ Failed to copy {filename}: {e}")
            skipped += 1
            continue

        # Extract metadata
        image_order = extract_image_order(filename)
        description = extract_description(filename, resume_dir)

        # Insert for each matching fiche
        for fiche_id, slug, title, ftype in fiches:
            # Check if already exists
            cursor.execute("""
                SELECT id FROM fiche_images
                WHERE fiche_id = %s AND filename = %s
            """, (fiche_id, relative_path))

            if cursor.fetchone():
                skipped += 1
                continue

            # Insert image record
            cursor.execute("""
                INSERT INTO fiche_images (
                    fiche_id, filename, description, image_order
                ) VALUES (%s, %s, %s, %s)
            """, (fiche_id, relative_path, description, image_order))

            imported += 1

    images_count = len(image_files)
    print(f"   ✅ Processed {images_count} images → {imported} records inserted, {skipped} skipped")

    return imported, skipped

def main():
    """Main import function"""
    source_base = '/Users/damienfulliquet/Documents/GitHub/ecos-skills-summary/Fiches/Résumés'

    print("🔄 Importing Resume Examination Images...")
    print(f"📁 Source: {source_base}\n")

    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        total_imported = 0
        total_skipped = 0

        for resume_dir, keywords in RESUME_DIRECTORIES.items():
            imported, skipped = import_resume_images(cursor, resume_dir, keywords, source_base)
            total_imported += imported
            total_skipped += skipped

        # Commit changes
        conn.commit()

        print(f"\n✨ Import complete!")
        print(f"   Total records inserted: {total_imported}")
        print(f"   Total skipped: {total_skipped}")

        # Summary by fiche
        print(f"\n📊 Images per Resume fiche:")
        cursor.execute("""
            SELECT f.id, f.title, COUNT(fi.id) as image_count
            FROM fiches f
            LEFT JOIN fiche_images fi ON f.id = fi.fiche_id
            WHERE f.fiche_type = 'resume' AND fi.id IS NOT NULL
            GROUP BY f.id, f.title
            HAVING COUNT(fi.id) > 0
            ORDER BY image_count DESC, f.title
        """)

        for fiche_id, title, count in cursor.fetchall():
            print(f"   {title}: {count} images")

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
