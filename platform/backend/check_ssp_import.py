#!/usr/bin/env python3
"""
Check SSP Import Results
"""
import os
import psycopg2

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432))
}

def main():
    print("🔍 SSP Import Verification Report")
    print("=" * 60)

    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Total fiches count
    cursor.execute("SELECT COUNT(*) FROM fiches")
    total = cursor.fetchone()[0]
    print(f"\n📊 Total Fiches in Platform: {total}")

    # Count by fiche type
    print(f"\n📁 Fiches by Type:")
    cursor.execute("""
        SELECT fiche_type, COUNT(*) as count
        FROM fiches
        GROUP BY fiche_type
        ORDER BY count DESC
    """)
    for fiche_type, count in cursor.fetchall():
        print(f"   {fiche_type}: {count} fiches")

    # SSP fiches specifically
    print(f"\n🏥 SSP Fiches Details:")
    cursor.execute("""
        SELECT metadata->>'source' as source, COUNT(*) as count
        FROM fiches
        WHERE fiche_type = 'ssp'
        GROUP BY metadata->>'source'
        ORDER BY count DESC
    """)
    for source, count in cursor.fetchall():
        print(f"   {source}: {count} fiches")

    # Total SSP count
    cursor.execute("SELECT COUNT(*) FROM fiches WHERE fiche_type = 'ssp'")
    ssp_total = cursor.fetchone()[0]
    print(f"\n   Total SSP: {ssp_total} fiches")

    # Disciplines distribution
    print(f"\n🎯 Top 10 Disciplines:")
    cursor.execute("""
        SELECT discipline, COUNT(*) as count
        FROM fiches
        WHERE discipline IS NOT NULL
        GROUP BY discipline
        ORDER BY count DESC
        LIMIT 10
    """)
    for discipline, count in cursor.fetchall():
        print(f"   {discipline}: {count} fiches")

    # Recent imports (last 10)
    print(f"\n🆕 Most Recent SSP Imports:")
    cursor.execute("""
        SELECT id, title, discipline
        FROM fiches
        WHERE fiche_type = 'ssp'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    for fiche_id, title, discipline in cursor.fetchall():
        print(f"   [{fiche_id}] {title[:60]}... ({discipline})")

    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
