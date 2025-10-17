#!/usr/bin/env python3
"""
Script to assign categories to clinical cases based on their source field
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'ecos_secure_password_2025')
}

# Mapping between source names and category slugs
SOURCE_TO_CATEGORY = {
    'AMBOSS': 'amboss',
    'ChatGPT AMBOSS': 'amboss-chatgpt',
    'Cases allemands': 'german',
    'RESCOS': 'rescos',
    'Thieme': 'thieme',
    'USMLE': 'usmle',
    'USMLE Mini': 'usmle',
    'USMLE Triage': 'usmle-triage',
    'Vignettes': 'vignettes'
}

def assign_categories():
    """Assign categories to clinical cases based on their source"""

    conn = None
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Get all categories with their slugs and IDs
        print("📂 Fetching categories...")
        cur.execute("SELECT id, slug, name FROM categories")
        categories = {row['slug']: row for row in cur.fetchall()}
        print(f"   Found {len(categories)} categories")

        # Process each source type
        total_updated = 0
        for source, category_slug in SOURCE_TO_CATEGORY.items():
            if category_slug not in categories:
                print(f"⚠️  Category '{category_slug}' not found for source '{source}'")
                continue

            category = categories[category_slug]

            # Update cases with this source
            cur.execute("""
                UPDATE clinical_cases
                SET category_id = %s,
                    updated_at = NOW()
                WHERE source = %s
                  AND category_id IS NULL
                RETURNING id
            """, (category['id'], source))

            updated_count = cur.rowcount
            total_updated += updated_count

            if updated_count > 0:
                print(f"✅ Assigned {updated_count} cases from '{source}' to category '{category['name']}'")

        # Commit changes
        conn.commit()
        print(f"\n🎉 Successfully assigned categories to {total_updated} cases!")

        # Show summary
        print("\n📊 Updated category statistics:")
        cur.execute("""
            SELECT c.name, c.slug, COUNT(cc.id) as case_count
            FROM categories c
            LEFT JOIN clinical_cases cc ON c.id = cc.category_id AND cc.is_published = true
            GROUP BY c.id, c.name, c.slug
            ORDER BY case_count DESC, c.name
        """)

        for row in cur.fetchall():
            print(f"   {row['name']:20} ({row['slug']:15}): {row['case_count']:3} cases")

        # Check remaining uncategorized cases
        cur.execute("""
            SELECT COUNT(*) as count
            FROM clinical_cases
            WHERE category_id IS NULL AND is_published = true
        """)
        remaining = cur.fetchone()['count']

        if remaining > 0:
            print(f"\n⚠️  Warning: {remaining} published cases still have no category assigned")

            # Show sources of uncategorized cases
            cur.execute("""
                SELECT source, COUNT(*) as count
                FROM clinical_cases
                WHERE category_id IS NULL AND is_published = true
                GROUP BY source
                ORDER BY count DESC
            """)

            print("   Sources of uncategorized cases:")
            for row in cur.fetchall():
                print(f"   - {row['source']}: {row['count']} cases")

    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        if conn:
            conn.rollback()
        return 1

    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
        return 1

    finally:
        if conn:
            conn.close()
            print("\n🔌 Database connection closed")

    return 0

if __name__ == "__main__":
    import sys
    sys.exit(assign_categories())
