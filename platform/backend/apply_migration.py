#!/usr/bin/env python3
"""Apply database migration"""
import psycopg2
import os
import sys

def apply_migration(migration_file):
    """Apply a SQL migration file"""
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'ecos_platform'),
        user=os.getenv('DB_USER', 'ecos_user'),
        password=os.getenv('DB_PASSWORD', 'ecos_secure_password_2025')
    )
    conn.autocommit = True
    cur = conn.cursor()

    print(f"📖 Reading migration: {migration_file}")
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    print("🚀 Applying migration...")
    try:
        cur.execute(sql)
        print("✅ Migration applied successfully!")
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migration_file = sys.argv[1] if len(sys.argv) > 1 else "migrations/002_add_fiches_tables.sql"
    apply_migration(migration_file)
