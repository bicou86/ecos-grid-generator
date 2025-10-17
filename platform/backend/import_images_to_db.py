#!/usr/bin/env python3
"""
Import images for clinical cases and fiches into the database
"""

import os
import re
import psycopg2
from psycopg2 import sql

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

def parse_image_filename(filename):
    """
    Parse image filename to extract case number, image number, and description.
    Format: AMBOSS-{caseNum}-img{imgNum}-{description}.jpg
    """
    pattern = r'^AMBOSS-(\d+)-img(\d+)-(.+)\.(jpg|jpeg|png|gif)$'
    match = re.match(pattern, filename, re.IGNORECASE)

    if match:
        case_num = int(match.group(1))
        img_num = int(match.group(2))
        description = match.group(3).replace('-', ' ').strip()
        ext = match.group(4)
        return {
            'case_num': case_num,
            'img_num': img_num,
            'description': description,
            'filename': filename
        }
    return None

def get_case_id_by_amboss_number(cur, amboss_num):
    """Get case UUID by AMBOSS number"""
    cur.execute(
        """
        SELECT id FROM clinical_cases
        WHERE slug LIKE %s OR slug LIKE %s
        LIMIT 1
        """,
        (f'amboss-{amboss_num}%', f'amboss{amboss_num}%')
    )
    result = cur.fetchone()
    return result[0] if result else None

def import_case_images():
    """Import all case images into the database"""
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    cur = conn.cursor()

    # Get list of image files
    images_dir = '../frontend/public/images/cases'
    if not os.path.exists(images_dir):
        images_dir = 'frontend/public/images/cases'

    if not os.path.exists(images_dir):
        print(f"❌ Images directory not found: {images_dir}")
        return

    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]

    print(f"📁 Found {len(image_files)} image files")

    imported_count = 0
    skipped_count = 0
    error_count = 0

    for filename in sorted(image_files):
        try:
            # Parse filename
            image_info = parse_image_filename(filename)
            if not image_info:
                print(f"⚠️  Skipping {filename} - couldn't parse filename")
                skipped_count += 1
                continue

            # Get case ID
            case_id = get_case_id_by_amboss_number(cur, image_info['case_num'])
            if not case_id:
                print(f"⚠️  Skipping {filename} - case AMBOSS-{image_info['case_num']} not found")
                skipped_count += 1
                continue

            # Check if image already exists
            cur.execute(
                "SELECT id FROM case_images WHERE case_id = %s AND filename = %s",
                (case_id, filename)
            )
            if cur.fetchone():
                # Update existing
                cur.execute(
                    """
                    UPDATE case_images
                    SET description = %s, image_order = %s
                    WHERE case_id = %s AND filename = %s
                    """,
                    (image_info['description'], image_info['img_num'], case_id, filename)
                )
            else:
                # Insert new
                cur.execute(
                    """
                    INSERT INTO case_images (case_id, filename, description, image_order)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (case_id, filename, image_info['description'], image_info['img_num'])
                )

            imported_count += 1
            if imported_count % 50 == 0:
                print(f"  Imported {imported_count} images...")

        except Exception as e:
            print(f"❌ Error importing {filename}: {e}")
            error_count += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"✅ Successfully imported: {imported_count} images")
    print(f"⚠️  Skipped: {skipped_count} images")
    print(f"❌ Errors: {error_count} images")

    # Show cases with images
    cur.execute(
        """
        SELECT
            c.slug,
            c.title,
            COUNT(ci.id) as image_count
        FROM clinical_cases c
        JOIN case_images ci ON c.id = ci.case_id
        GROUP BY c.id, c.slug, c.title
        ORDER BY image_count DESC
        LIMIT 10
        """
    )

    print(f"\n📊 Top 10 cases by image count:")
    for slug, title, count in cur.fetchall():
        print(f"  {count:2d} images - {title}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    print("🚀 Starting image import...\n")
    import_case_images()
    print("\n✨ Image import complete!")
