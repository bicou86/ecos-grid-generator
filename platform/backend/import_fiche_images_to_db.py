#!/usr/bin/env python3
"""
Import images for fiches into the database
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

def parse_fiche_image_filename(filename):
    """
    Parse fiche image filename to extract topic and image number.
    Format: SSP {topic}_page{pageNum}_img{imgNum}.{ext}
    """
    # Remove extension
    name_without_ext = os.path.splitext(filename)[0]

    # Try different patterns
    patterns = [
        r'^SSP\s+(.+?)_page(\d+)_img(\d+)$',  # SSP Topic_page1_img2
        r'^SSP-(.+?)_page(\d+)_img(\d+)$',     # SSP-Topic_page1_img2
    ]

    for pattern in patterns:
        match = re.match(pattern, name_without_ext, re.IGNORECASE)
        if match:
            topic = match.group(1).strip()
            page_num = int(match.group(2))
            img_num = int(match.group(3))

            # Calculate order: page*10 + img_num for proper ordering
            image_order = page_num * 10 + img_num

            return {
                'topic': topic,
                'page_num': page_num,
                'img_num': img_num,
                'image_order': image_order,
                'filename': filename
            }

    return None

def get_fiche_id_by_topic(cur, topic):
    """Get fiche ID by matching topic in title or slug"""
    # Normalize topic for matching
    topic_normalized = topic.lower().replace(' ', '-').replace('œ', 'oe')

    # Try exact match first
    cur.execute(
        """
        SELECT id, title FROM fiches
        WHERE LOWER(title) LIKE %s
           OR LOWER(slug) LIKE %s
        ORDER BY
            CASE
                WHEN LOWER(title) = %s THEN 1
                WHEN LOWER(title) LIKE %s THEN 2
                WHEN LOWER(slug) LIKE %s THEN 3
                ELSE 4
            END
        LIMIT 1
        """,
        (
            f'%{topic}%',
            f'%{topic_normalized}%',
            topic.lower(),
            f'%{topic.lower()}%',
            f'%{topic_normalized}%'
        )
    )
    result = cur.fetchone()
    return result if result else None

def import_fiche_images():
    """Import all fiche images into the database"""
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    cur = conn.cursor()

    # Get list of image files
    images_dir = '../frontend/public/images/fiches'
    if not os.path.exists(images_dir):
        images_dir = 'frontend/public/images/fiches'

    if not os.path.exists(images_dir):
        print(f"❌ Images directory not found: {images_dir}")
        return

    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]

    print(f"📁 Found {len(image_files)} fiche image files")

    imported_count = 0
    skipped_count = 0
    error_count = 0

    for filename in sorted(image_files):
        try:
            # Parse filename
            image_info = parse_fiche_image_filename(filename)
            if not image_info:
                print(f"⚠️  Skipping {filename} - couldn't parse filename")
                skipped_count += 1
                continue

            # Get fiche ID
            fiche_result = get_fiche_id_by_topic(cur, image_info['topic'])
            if not fiche_result:
                print(f"⚠️  Skipping {filename} - fiche for topic '{image_info['topic']}' not found")
                skipped_count += 1
                continue

            fiche_id, fiche_title = fiche_result
            description = f"Page {image_info['page_num']}, Image {image_info['img_num']}"

            # Check if image already exists
            cur.execute(
                "SELECT id FROM fiche_images WHERE fiche_id = %s AND filename = %s",
                (fiche_id, filename)
            )
            if cur.fetchone():
                # Update existing
                cur.execute(
                    """
                    UPDATE fiche_images
                    SET description = %s, image_order = %s
                    WHERE fiche_id = %s AND filename = %s
                    """,
                    (description, image_info['image_order'], fiche_id, filename)
                )
                print(f"✓ Updated {filename} → {fiche_title}")
            else:
                # Insert new
                cur.execute(
                    """
                    INSERT INTO fiche_images (fiche_id, filename, description, image_order)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (fiche_id, filename, description, image_info['image_order'])
                )
                print(f"✓ Imported {filename} → {fiche_title}")

            imported_count += 1

        except Exception as e:
            print(f"❌ Error importing {filename}: {e}")
            error_count += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"✅ Successfully imported: {imported_count} images")
    print(f"⚠️  Skipped: {skipped_count} images")
    print(f"❌ Errors: {error_count} images")

    # Show fiches with images
    cur.execute(
        """
        SELECT
            f.slug,
            f.title,
            COUNT(fi.id) as image_count
        FROM fiches f
        JOIN fiche_images fi ON f.id = fi.fiche_id
        GROUP BY f.id, f.slug, f.title
        ORDER BY image_count DESC
        LIMIT 10
        """
    )

    print(f"\n📊 Fiches with images:")
    for slug, title, count in cur.fetchall():
        print(f"  {count:2d} images - {title}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    print("🚀 Starting fiche images import...\n")
    import_fiche_images()
    print("\n✨ Fiche images import complete!")
