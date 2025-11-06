#!/usr/bin/env python3
"""
Link existing images to clinical cases and fiches in database
"""

import os
import re
import json
import sys
import psycopg2
from pathlib import Path

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

def link_case_images(conn, images_dir):
    """Link images to clinical cases"""
    print("\n📁 Linking case images...")

    images_path = Path(images_dir) / 'cases'
    if not images_path.exists():
        print(f"⚠️  Cases images directory not found: {images_path}")
        return 0

    # Get all image files
    image_files = list(images_path.glob('*.png')) + list(images_path.glob('*.jpg')) + list(images_path.glob('*.jpeg'))
    print(f"  Found {len(image_files)} case images")

    cur = conn.cursor()
    linked = 0

    # Group images by case (assuming format: AMBOSS-1-img1.png, etc.)
    image_groups = {}
    for img_file in image_files:
        # Extract case identifier from filename
        match = re.match(r'(AMBOSS|RESCOS|USMLE|USMLE Triage)[-\s](\d+)', img_file.stem)
        if match:
            source = match.group(1)
            number = match.group(2)
            key = f"{source}-{number}"

            if key not in image_groups:
                image_groups[key] = []

            image_groups[key].append({
                'filename': img_file.name,
                'path': f'/images/cases/{img_file.name}'
            })

    # Update cases with their images
    for case_key, images in image_groups.items():
        # Find the case in database
        source, number = case_key.split('-', 1)

        # Try to find matching case by title pattern
        cur.execute("""
            SELECT id, title FROM clinical_cases
            WHERE source = %s AND title LIKE %s
            LIMIT 1
        """, (source, f"%{number}%"))

        case = cur.fetchone()
        if case:
            case_id, title = case
            images_json = json.dumps(images)

            cur.execute("""
                UPDATE clinical_cases
                SET images = %s
                WHERE id = %s
            """, (images_json, case_id))

            linked += 1
            if linked % 10 == 0:
                print(f"  Linked: {linked}/{len(image_groups)}")

    conn.commit()
    cur.close()

    print(f"✅ Linked images to {linked} cases")
    return linked

def link_fiche_images(conn, images_dir):
    """Link images to fiches"""
    print("\n📁 Linking fiche images...")

    images_path = Path(images_dir) / 'fiches'
    if not images_path.exists():
        print(f"⚠️  Fiches images directory not found: {images_path}")
        return 0

    # Get all image files
    image_files = list(images_path.glob('*.png')) + list(images_path.glob('*.jpg')) + list(images_path.glob('*.jpeg'))
    print(f"  Found {len(image_files)} fiche images")

    # For now, we'll just count them - fiches structure in JSON doesn't support images yet
    # This would require updating the fiches table schema
    print(f"  ℹ️  Fiche images are available at /images/fiches/ but not yet linked to database entries")
    print(f"  ℹ️  Future enhancement: Add images JSONB column to fiches table")

    return 0

def main(images_dir):
    """Main function"""
    print("\n" + "="*60)
    print("🖼️  ECOS Images Linking")
    print("="*60)

    conn = get_db_connection()
    print("✅ Connected to database")

    case_linked = link_case_images(conn, images_dir)
    fiche_linked = link_fiche_images(conn, images_dir)

    conn.close()

    print("\n" + "="*60)
    print("✅ Linking Complete!")
    print(f"📊 Cases: {case_linked} linked")
    print(f"📊 Fiches: {fiche_linked} linked (feature pending)")
    print("="*60 + "\n")

if __name__ == '__main__':
    # Default images directory
    images_dir = '/app/../frontend/public/images'

    if len(sys.argv) > 1:
        images_dir = sys.argv[1]

    if not Path(images_dir).exists():
        print(f"❌ Error: Images directory not found: {images_dir}")
        print("Usage: python3 link_images.py [images_directory]")
        sys.exit(1)

    main(images_dir)
