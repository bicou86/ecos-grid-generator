#!/usr/bin/env python3
"""
Populate Categories and Circuits
Maps all 562 fiches to appropriate categories and populates predefined circuits
"""
import os
import psycopg2
from psycopg2.extras import execute_values

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# Category keywords mapping
CATEGORY_KEYWORDS = {
    'Anamnèse': [
        'anamnèse', 'anamnese', 'history', 'interrogatoire', 'entretien',
        'mmse', 'moca', 'interview', 'questioning'
    ],
    'Examen Clinique': [
        'examen', 'status', 'examination', 'inspection', 'palpation',
        'percussion', 'auscultation', 'clinical examination'
    ],
    'Management': [
        'management', 'traitement', 'treatment', 'prise en charge',
        'thérapie', 'therapy', 'prescription', 'suivi'
    ],
    'Communication': [
        'communication', 'annonce', 'breaking bad news', 'counseling',
        'entretien motivationnel', 'motivational', 'bad news'
    ],
    'Urgences': [
        'urgence', 'emergency', 'urgences', 'arrêt', 'choc', 'trauma',
        'réanimation', 'resuscitation', 'bls', 'acls', 'détresse'
    ],
    'Procédures': [
        'procédure', 'procedure', 'technique', 'geste', 'intervention',
        'ponction', 'cathéter', 'intubation'
    ],
    'Interprétation': [
        'ecg', 'électrocardiogramme', 'radiographie', 'interprétation',
        'interpretation', 'analyse', 'lecture', 'fond d\'œil'
    ],
    'Pédiatrie': [
        'pédiatrie', 'pediatrie', 'pediatric', 'enfant', 'nourrisson',
        'nouveau-né', 'néonatal', 'child'
    ],
    'Psychiatrie': [
        'psychiatrie', 'psychiatr', 'mental', 'dépression', 'anxiété',
        'psychose', 'schizophrénie', 'bipolaire', 'suicidaire'
    ],
    'Gynéco-Obstétrique': [
        'gynéco', 'gyneco', 'gynecolog', 'obstét', 'obstet',
        'grossesse', 'pregnancy', 'accouchement', 'ménopaus'
    ]
}

# Circuit definitions with keywords for automatic population
CIRCUIT_DEFINITIONS = {
    'Circuit Urgences': {
        'keywords': [
            'arrêt', 'choc', 'trauma', 'urgence', 'réanimation', 'détresse',
            'accident', 'emergency', 'coma', 'intoxication'
        ],
        'min_fiches': 8,
        'max_fiches': 15
    },
    'Circuit Médecine Interne': {
        'keywords': [
            'cardiovasculaire', 'pulmonaire', 'abdominal', 'cardiaque',
            'thoracique', 'hypertension', 'diabète', 'fibrillation'
        ],
        'min_fiches': 10,
        'max_fiches': 15
    },
    'Circuit Pédiatrie Complète': {
        'keywords': [
            'pédiatrie', 'enfant', 'nourrisson', 'néonatal', 'fièvre chez',
            'pediatric', 'child', 'nouveau-né'
        ],
        'min_fiches': 8,
        'max_fiches': 12
    },
    'Circuit Psychiatrie Essentielle': {
        'keywords': [
            'psychiatrie', 'dépression', 'anxiété', 'suicidaire', 'mental',
            'psychose', 'agitation', 'confusion'
        ],
        'min_fiches': 6,
        'max_fiches': 10
    },
    'Circuit Examen Blanc': {
        'keywords': [],  # Will manually select diverse cases
        'min_fiches': 13,
        'max_fiches': 13
    },
    'Circuit Anamnèse Complète': {
        'keywords': [
            'anamnèse', 'anamnese', 'history', 'interrogatoire'
        ],
        'fiche_type': 'skills',
        'min_fiches': 6,
        'max_fiches': 10
    },
    'Circuit Examen Musculo-squelettique': {
        'keywords': [
            'épaule', 'genou', 'hanche', 'coude', 'cheville', 'pied',
            'rachis', 'main', 'poignet', 'gals', 'musculo'
        ],
        'min_fiches': 8,
        'max_fiches': 12
    },
    'Circuit Communication': {
        'keywords': [
            'communication', 'annonce', 'breaking bad news', 'motivationnel',
            'contraception', 'sevrage', 'alcool', 'tabac'
        ],
        'min_fiches': 5,
        'max_fiches': 8
    }
}


def get_category_id(cursor, category_name):
    """Get category ID by name"""
    cursor.execute("SELECT id FROM fiche_categories WHERE name = %s", (category_name,))
    result = cursor.fetchone()
    return result[0] if result else None


def categorize_fiche(fiche_title, fiche_slug, fiche_type):
    """
    Determine which categories a fiche belongs to based on keywords
    Returns list of category names
    """
    categories = []
    title_lower = fiche_title.lower()
    slug_lower = fiche_slug.lower()
    combined = f"{title_lower} {slug_lower}"

    for category_name, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in combined:
                if category_name not in categories:
                    categories.append(category_name)
                break

    # Default category based on fiche type if no match found
    if not categories:
        if fiche_type == 'skills':
            if 'anamnese' in combined or 'anamnèse' in combined:
                categories.append('Anamnèse')
            elif 'status' in combined or 'examen' in combined:
                categories.append('Examen Clinique')
        elif fiche_type == 'ssp':
            # SSP fiches often combine multiple categories
            categories.append('Examen Clinique')

    return categories if categories else ['Examen Clinique']  # Default fallback


def populate_categories(cursor):
    """Map all fiches to appropriate categories"""
    print("📋 Categorizing fiches...")

    # Get all fiches
    cursor.execute("SELECT id, title, slug, fiche_type FROM fiches ORDER BY id")
    fiches = cursor.fetchall()

    # Get all categories
    categories_map = {}
    cursor.execute("SELECT id, name FROM fiche_categories")
    for cat_id, cat_name in cursor.fetchall():
        categories_map[cat_name] = cat_id

    mappings = []
    category_counts = {cat: 0 for cat in categories_map.keys()}

    for fiche_id, title, slug, fiche_type in fiches:
        # Determine categories for this fiche
        categories = categorize_fiche(title, slug, fiche_type)

        for category_name in categories:
            if category_name in categories_map:
                mappings.append((fiche_id, categories_map[category_name]))
                category_counts[category_name] += 1

    # Insert mappings
    if mappings:
        execute_values(
            cursor,
            "INSERT INTO fiche_category_mapping (fiche_id, category_id) VALUES %s ON CONFLICT DO NOTHING",
            mappings
        )

    print(f"✅ Mapped {len(mappings)} fiche-category relationships")
    print(f"\n📊 Fiches per category:")
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {category}: {count} fiches")

    return category_counts


def find_fiches_for_circuit(cursor, circuit_def):
    """Find appropriate fiches for a circuit based on definition"""
    keywords = circuit_def['keywords']
    min_fiches = circuit_def.get('min_fiches', 5)
    max_fiches = circuit_def.get('max_fiches', 10)
    fiche_type = circuit_def.get('fiche_type')

    if not keywords:
        return []  # Will be manually populated

    # Build query
    conditions = []
    params = []

    for keyword in keywords:
        conditions.append("(LOWER(title) LIKE %s OR LOWER(slug) LIKE %s)")
        params.extend([f"%{keyword.lower()}%", f"%{keyword.lower()}%"])

    where_clause = " OR ".join(conditions)

    if fiche_type:
        where_clause = f"({where_clause}) AND fiche_type = %s"
        params.append(fiche_type)

    query = f"""
        SELECT id, title, estimated_duration
        FROM fiches
        WHERE {where_clause}
        ORDER BY frequency_rating DESC NULLS LAST, times_viewed DESC
        LIMIT %s
    """
    params.append(max_fiches)

    cursor.execute(query, params)
    return cursor.fetchall()


def populate_circuits(cursor):
    """Populate predefined circuits with fiches"""
    print("\n🔄 Populating predefined circuits...")

    # Get all circuits
    cursor.execute("SELECT id, title FROM circuits WHERE is_predefined = true")
    circuits = cursor.fetchall()

    populated_count = 0

    for circuit_id, circuit_title in circuits:
        if circuit_title not in CIRCUIT_DEFINITIONS:
            print(f"   ⚠️  No definition for: {circuit_title}")
            continue

        circuit_def = CIRCUIT_DEFINITIONS[circuit_title]
        fiches = find_fiches_for_circuit(cursor, circuit_def)

        if not fiches:
            print(f"   ⚠️  No fiches found for: {circuit_title}")
            continue

        # Insert circuit-fiche mappings
        mappings = [
            (circuit_id, fiche_id, i, '')
            for i, (fiche_id, _, _) in enumerate(fiches)
        ]

        execute_values(
            cursor,
            """
            INSERT INTO circuit_fiches (circuit_id, fiche_id, display_order, notes)
            VALUES %s
            ON CONFLICT (circuit_id, fiche_id) DO NOTHING
            """,
            mappings
        )

        # Update circuit total duration
        total_duration = sum(duration or 0 for _, _, duration in fiches)
        cursor.execute(
            "UPDATE circuits SET total_duration = %s WHERE id = %s",
            (total_duration, circuit_id)
        )

        print(f"   ✓ {circuit_title}: {len(fiches)} fiches ({total_duration} min)")
        populated_count += 1

    print(f"\n✅ Populated {populated_count} circuits")


def add_exam_blanc_fiches(cursor):
    """Manually curate diverse fiches for Examen Blanc circuit"""
    print("\n🎯 Curating Examen Blanc circuit...")

    # Get Examen Blanc circuit ID
    cursor.execute("SELECT id FROM circuits WHERE title = 'Circuit Examen Blanc'")
    result = cursor.fetchone()
    if not result:
        print("   ⚠️  Examen Blanc circuit not found")
        return

    circuit_id = result[0]

    # Select diverse, high-frequency SSP stations
    cursor.execute("""
        SELECT id, title
        FROM fiches
        WHERE fiche_type = 'ssp'
        AND frequency_rating >= 4
        ORDER BY RANDOM()
        LIMIT 13
    """)

    fiches = cursor.fetchall()

    if len(fiches) < 13:
        print(f"   ⚠️  Only found {len(fiches)} fiches (need 13)")
        return

    # Insert mappings
    mappings = [
        (circuit_id, fiche_id, i, '')
        for i, (fiche_id, _) in enumerate(fiches)
    ]

    execute_values(
        cursor,
        """
        INSERT INTO circuit_fiches (circuit_id, fiche_id, display_order, notes)
        VALUES %s
        ON CONFLICT (circuit_id, fiche_id) DO UPDATE SET display_order = EXCLUDED.display_order
        """,
        mappings
    )

    # Update total duration (13 stations × 13 min)
    cursor.execute("UPDATE circuits SET total_duration = 169 WHERE id = %s", (circuit_id,))

    print(f"   ✓ Added 13 diverse stations to Examen Blanc")


def main():
    """Main population function"""
    print("🚀 Starting Category and Circuit Population\n")
    print("=" * 60)

    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Populate categories
        category_counts = populate_categories(cursor)

        # Populate circuits
        populate_circuits(cursor)

        # Add Examen Blanc fiches
        add_exam_blanc_fiches(cursor)

        # Commit all changes
        conn.commit()

        # Summary statistics
        print("\n" + "=" * 60)
        print("✨ Population Complete!\n")

        cursor.execute("SELECT COUNT(*) FROM fiche_category_mapping")
        total_mappings = cursor.fetchone()[0]
        print(f"📊 Total category mappings: {total_mappings}")

        cursor.execute("""
            SELECT c.title, COUNT(cf.fiche_id) as fiche_count, c.total_duration
            FROM circuits c
            LEFT JOIN circuit_fiches cf ON c.id = cf.circuit_id
            WHERE c.is_predefined = true
            GROUP BY c.id, c.title, c.total_duration
            ORDER BY c.title
        """)

        print(f"\n🔄 Circuit Summary:")
        for title, count, duration in cursor.fetchall():
            duration_str = f"{duration} min" if duration else "TBD"
            print(f"   {title}: {count} fiches ({duration_str})")

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
