#!/usr/bin/env python3
"""
Import RMS (Revue Médicale Suisse Étudiants) images and link them to fiches
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

# RMS directory mapping (folder name -> fiche slug pattern)
RMS_DIRECTORIES = {
    'Abdo': 'examen-abdominal',  # Will match both "examen-abdominal" and "examen-abdominal-court"
    'CV': 'examen-cardiovasculaire',
    'Coude': 'examen-clinique-du-coude',
    'Epaule': 'examen-clinique-de-l-épaule',
    'GALS': 'gals-examen-de-dépistage-musculosquelettique',
    'Genou': 'examen-clinique-du-genou',
    'Hanche': 'examen-clinique-de-la-hanche',
    'Main-Poignet': 'examen-clinique-de-la-main-et-du-poignet',
    'Neuro': 'examen-neurologique',
    'Pied-Cheville': 'examen-clinique-du-pied-et-de-la-cheville',
    'Pulmo': 'examen-pulmonairerespiratoire',
    'Rachis': 'examen-clinique-du-rachis',
}

def get_fiche_by_slug_pattern(cursor, slug_pattern):
    """Get fiche ID by slug pattern (can match multiple fiches)"""
    cursor.execute("""
        SELECT id, slug, title
        FROM fiches
        WHERE slug LIKE %s
        ORDER BY id
    """, (f'%{slug_pattern}%',))
    return cursor.fetchall()

def extract_image_order(filename):
    """
    Extract order number from filename
    FIG 1.jpg -> 1
    FIG 23.jpg -> 23
    Carte_page-0001.jpg -> 1001 (high number for cards)
    """
    # Check for figure number
    fig_match = re.search(r'FIG\s+(\d+)', filename, re.IGNORECASE)
    if fig_match:
        return int(fig_match.group(1))

    # Check for card/carte number
    card_match = re.search(r'carte.*page[-_](\d+)', filename, re.IGNORECASE)
    if card_match:
        return 1000 + int(card_match.group(1))  # Cards at the end

    # Default order
    return 999

def extract_description(filename):
    """Extract description from filename"""
    # Remove extension
    name = os.path.splitext(filename)[0]

    # Special cases
    if 'carte' in name.lower():
        return "Carte de révision"

    # FIG number
    fig_match = re.search(r'FIG\s+(\d+)', name, re.IGNORECASE)
    if fig_match:
        return f"Figure {fig_match.group(1)}"

    return name

def copy_image_to_frontend(source_path, filename, rms_subdir):
    """Copy image to frontend public directory"""
    # Target: frontend/public/images/fiches/rms/<subdir>/
    target_dir = Path('/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/frontend/public/images/fiches/rms') / rms_subdir.lower()
    target_dir.mkdir(parents=True, exist_ok=True)

    target_path = target_dir / filename

    # Copy file
    shutil.copy2(source_path, target_path)

    # Return relative path from /images/fiches/
    return f'rms/{rms_subdir.lower()}/{filename}'

def import_rms_images(cursor, rms_dir, slug_pattern, source_base):
    """Import images for a specific RMS examination"""
    source_dir = os.path.join(source_base, rms_dir)

    if not os.path.exists(source_dir):
        print(f"⚠️  Directory not found: {source_dir}")
        return 0, 0

    # Get matching fiches
    fiches = get_fiche_by_slug_pattern(cursor, slug_pattern)

    if not fiches:
        print(f"⚠️  No fiche found for slug pattern: {slug_pattern}")
        return 0, 0

    print(f"\n📂 Processing {rms_dir}/ ({len(fiches)} fiche(s) found)")
    for fiche_id, slug, title in fiches:
        print(f"   → {title} (id: {fiche_id})")

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
            relative_path = copy_image_to_frontend(str(image_path), filename, rms_dir)
        except Exception as e:
            print(f"   ❌ Failed to copy {filename}: {e}")
            skipped += 1
            continue

        # Extract metadata
        image_order = extract_image_order(filename)
        description = extract_description(filename)

        # Insert for each matching fiche
        for fiche_id, slug, title in fiches:
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
    source_base = '/Users/damienfulliquet/Documents/GitHub/ecos-skills-summary/Fiches/RMS'

    print("🔄 Importing RMS Examination Images...")
    print(f"📁 Source: {source_base}\n")

    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        total_imported = 0
        total_skipped = 0

        for rms_dir, slug_pattern in RMS_DIRECTORIES.items():
            imported, skipped = import_rms_images(cursor, rms_dir, slug_pattern, source_base)
            total_imported += imported
            total_skipped += skipped

        # Commit changes
        conn.commit()

        print(f"\n✨ Import complete!")
        print(f"   Total records inserted: {total_imported}")
        print(f"   Total skipped: {total_skipped}")

        # Summary by fiche
        print(f"\n📊 Images per fiche:")
        cursor.execute("""
            SELECT f.id, f.title, COUNT(fi.id) as image_count
            FROM fiches f
            LEFT JOIN fiche_images fi ON f.id = fi.fiche_id
            WHERE f.title LIKE 'RMS%'
            GROUP BY f.id, f.title
            ORDER BY image_count DESC, f.title
        """)

        for fiche_id, title, count in cursor.fetchall():
            if count > 0:
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
