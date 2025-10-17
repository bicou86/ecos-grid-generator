#!/usr/bin/env python3
"""
Script d'import des cas cliniques ECOS vers PostgreSQL
Lit tous les fichiers JSON et les importe dans la base de données
"""

import os
import json
import psycopg2
from psycopg2.extras import Json
from pathlib import Path
import re
from datetime import datetime
import hashlib

# Configuration de connexion PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'ecos_platform'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

# Mapping des catégories
CATEGORY_MAPPING = {
    'AMBOSS': 'amboss',
    'ChatGPT_AMBOSS': 'amboss-chatgpt',
    'German': 'german',
    'RESCOS': 'rescos',
    'Thieme': 'thieme',
    'USMLE': 'usmle',
    'USMLE Triage': 'usmle-triage',
    'USMLE Mini': 'usmle',  # Regroupé avec USMLE
    'Vignettes': 'vignettes'
}

# Mapping des spécialités basé sur le contenu
SPECIALTY_KEYWORDS = {
    'pediatrie': ['pédiatrie', 'enfant', 'bébé', 'garçon', 'fille', 'nourrisson', 'nouveau-né'],
    'chirurgie': ['chirurgie', 'opération', 'post-opératoire', 'laparoscopie'],
    'gynecologie-obstetrique': ['gynécologie', 'grossesse', 'enceinte', 'accouchement', 'obstétrique', 'menstruel'],
    'cardiologie': ['cardiaque', 'cœur', 'infarctus', 'coronaire', 'ECG', 'arythmie'],
    'pneumologie': ['respiratoire', 'poumon', 'dyspnée', 'toux', 'asthme', 'BPCO'],
    'gastro-enterologie': ['abdominale', 'digestif', 'intestin', 'gastro', 'foie', 'hépatique'],
    'neurologie': ['neurologique', 'céphalée', 'AVC', 'vertige', 'paralysie', 'convulsion'],
    'psychiatrie': ['dépression', 'anxiété', 'psychiatrique', 'psychose', 'troubles du sommeil'],
    'dermatologie': ['cutané', 'peau', 'éruption', 'dermatite', 'prurit'],
    'orl': ['ORL', 'otite', 'rhinite', 'pharyngite', 'surdité'],
    'ophtalmologie': ['œil', 'vision', 'ophtalmologique', 'rétine'],
    'urgences': ['urgence', 'traumatisme', 'accident', 'chute', 'fracture'],
    'rhumatologie': ['articulaire', 'arthrite', 'rhumatisme', 'douleur articulaire'],
    'endocrinologie': ['diabète', 'thyroïde', 'hormonal', 'endocrinien']
}


def create_slug(text):
    """Crée un slug à partir du texte"""
    text = text.lower()
    text = re.sub(r'[àâä]', 'a', text)
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[îï]', 'i', text)
    text = re.sub(r'[ôö]', 'o', text)
    text = re.sub(r'[ùûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def detect_specialties(case_data):
    """Détecte les spécialités basées sur le contenu du cas"""
    specialties = []
    search_text = json.dumps(case_data).lower()

    for specialty, keywords in SPECIALTY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in search_text:
                specialties.append(specialty)
                break

    # Par défaut, ajouter médecine générale si aucune spécialité détectée
    if not specialties:
        specialties.append('medecine-generale')

    return list(set(specialties))


def extract_tags(case_data):
    """Extrait les tags pertinents du cas"""
    tags = []

    # Extraire des sections JSON
    if 'sections' in case_data:
        for section_name, section_data in case_data['sections'].items():
            if isinstance(section_data, dict) and 'criteria' in section_data:
                for criterion in section_data['criteria']:
                    if 'text' in criterion:
                        # Extraire mots-clés du texte
                        words = re.findall(r'\b[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[a-zà-ÿ]+)*\b', criterion['text'])
                        tags.extend(words[:3])  # Limite à 3 mots par critère

    return list(set(tags))[:20]  # Limite à 20 tags


def determine_difficulty(case_data):
    """Détermine le niveau de difficulté basé sur la complexité"""
    complexity_score = 0

    # Compter les critères
    if 'sections' in case_data:
        total_criteria = 0
        for section_name, section_data in case_data['sections'].items():
            if isinstance(section_data, dict) and 'criteria' in section_data:
                total_criteria += len(section_data['criteria'])

        if total_criteria > 30:
            complexity_score += 2
        elif total_criteria > 20:
            complexity_score += 1

    # Vérifier la présence d'annexes complexes
    if 'annexes' in case_data:
        annexes = case_data['annexes']
        if 'theoriePratique' in annexes:
            complexity_score += 1
        if 'informationsExpert' in annexes:
            complexity_score += 1

    # Déterminer le niveau
    if complexity_score >= 3:
        return 'advanced'
    elif complexity_score >= 1:
        return 'intermediate'
    else:
        return 'beginner'


def get_category_id(conn, category_slug):
    """Récupère l'ID de la catégorie"""
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM categories WHERE slug = %s", (category_slug,))
        result = cur.fetchone()
        return result[0] if result else None


def get_specialty_ids(conn, specialty_slugs):
    """Récupère les IDs des spécialités"""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM specialties WHERE slug = ANY(%s)",
            (specialty_slugs,)
        )
        return [row[0] for row in cur.fetchall()]


def get_or_create_tag(conn, tag_name, category='general'):
    """Récupère ou crée un tag"""
    tag_slug = create_slug(tag_name)

    with conn.cursor() as cur:
        # Vérifier si le tag existe
        cur.execute("SELECT id FROM tags WHERE slug = %s", (tag_slug,))
        result = cur.fetchone()

        if result:
            # Incrémenter le compteur d'utilisation
            cur.execute(
                "UPDATE tags SET usage_count = usage_count + 1 WHERE id = %s",
                (result[0],)
            )
            return result[0]
        else:
            # Créer le tag
            cur.execute(
                """
                INSERT INTO tags (name, slug, category)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (tag_name, tag_slug, category)
            )
            return cur.fetchone()[0]


def import_case(conn, json_file_path, category_name):
    """Importe un cas clinique dans la base de données"""
    try:
        # Lire le fichier JSON
        with open(json_file_path, 'r', encoding='utf-8') as f:
            case_data = json.load(f)

        # Extraire les données de base
        title = case_data.get('title', 'Sans titre')
        # Tronquer le titre s'il est trop long (limite base de données: 500 caractères)
        if len(title) > 450:
            title = title[:447] + '...'
        slug = create_slug(title)

        # Vérifier si le cas existe déjà
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM clinical_cases WHERE slug = %s", (slug,))
            if cur.fetchone():
                print(f"  ⚠️  Cas déjà existant: {title}")
                return None

        # Récupérer la catégorie
        category_slug = CATEGORY_MAPPING.get(category_name, 'vignettes')
        category_id = get_category_id(conn, category_slug)

        # Extraire le contexte
        context = case_data.get('context', {})
        setting = context.get('setting', '')
        patient_description = context.get('patient', '')
        vitals = context.get('vitals', {})

        # Extraire les sections
        sections = case_data.get('sections', {})
        anamnese_section = sections.get('anamnese', {})
        examen_section = sections.get('examen', {})
        management_section = sections.get('management', {})
        cloture_section = sections.get('cloture', {})

        # Extraire les annexes
        annexes = case_data.get('annexes', {})
        images = case_data.get('images', [])

        # Déterminer les métadonnées
        difficulty = determine_difficulty(case_data)
        # Tronquer le nom de la source si trop long (limite: 100 caractères)
        source = category_name[:97] + '...' if len(category_name) > 100 else category_name

        # Détecter les spécialités
        specialty_slugs = detect_specialties(case_data)
        specialty_ids = get_specialty_ids(conn, specialty_slugs)

        # Extraire les tags
        tag_names = extract_tags(case_data)

        # Insérer le cas clinique
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO clinical_cases (
                    title, slug, category_id, setting, patient_description,
                    vitals, anamnese_section, examen_section, management_section,
                    cloture_section, annexes, images, difficulty_level, source,
                    original_file_path, is_published, is_premium, published_at
                )
                VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                RETURNING id
                """,
                (
                    title, slug, category_id, setting, patient_description,
                    Json(vitals), Json(anamnese_section), Json(examen_section),
                    Json(management_section), Json(cloture_section), Json(annexes),
                    Json(images), difficulty, source, str(json_file_path),
                    True, False, datetime.now()
                )
            )
            case_id = cur.fetchone()[0]

        # Associer les spécialités
        if specialty_ids:
            with conn.cursor() as cur:
                for specialty_id in specialty_ids:
                    cur.execute(
                        """
                        INSERT INTO case_specialties (case_id, specialty_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                        """,
                        (case_id, specialty_id)
                    )

        # Associer les tags
        for tag_name in tag_names:
            tag_id = get_or_create_tag(conn, tag_name)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO case_tags (case_id, tag_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (case_id, tag_id)
                )

        print(f"  ✓ Importé: {title}")
        return case_id

    except Exception as e:
        print(f"  ✗ Erreur lors de l'import de {json_file_path}: {str(e)}")
        return None


def import_all_cases():
    """Importe tous les cas depuis le dossier json_files"""
    # Connexion à la base de données
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True  # Activer autocommit pour éviter les transactions bloquées
        print("✓ Connexion à la base de données établie")
    except Exception as e:
        print(f"✗ Erreur de connexion à la base de données: {e}")
        return

    # Chemin du dossier json_files
    base_path = Path(__file__).parent / 'json_files'

    if not base_path.exists():
        print(f"✗ Le dossier {base_path} n'existe pas")
        return

    # Statistiques
    stats = {
        'total': 0,
        'imported': 0,
        'skipped': 0,
        'errors': 0,
        'by_category': {}
    }

    # Parcourir les catégories
    for category_dir in base_path.iterdir():
        if not category_dir.is_dir():
            continue

        category_name = category_dir.name

        # Ignorer certains dossiers
        if category_name in ['json_feuille-porte', '__pycache__']:
            continue

        print(f"\n📂 Catégorie: {category_name}")
        stats['by_category'][category_name] = {'imported': 0, 'skipped': 0, 'errors': 0}

        # Parcourir les fichiers JSON
        json_files = list(category_dir.glob('*.json'))

        for json_file in json_files:
            stats['total'] += 1

            case_id = import_case(conn, json_file, category_name)

            if case_id:
                stats['imported'] += 1
                stats['by_category'][category_name]['imported'] += 1
            elif case_id is None:
                stats['skipped'] += 1
                stats['by_category'][category_name]['skipped'] += 1
            else:
                stats['errors'] += 1
                stats['by_category'][category_name]['errors'] += 1

    # Fermer la connexion
    conn.close()

    # Afficher le résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ DE L'IMPORT")
    print("="*60)
    print(f"Total de fichiers traités: {stats['total']}")
    print(f"✓ Importés: {stats['imported']}")
    print(f"⚠️  Ignorés (déjà existants): {stats['skipped']}")
    print(f"✗ Erreurs: {stats['errors']}")
    print("\n📈 Par catégorie:")
    for category, cat_stats in stats['by_category'].items():
        print(f"  {category}: {cat_stats['imported']} importés, "
              f"{cat_stats['skipped']} ignorés, {cat_stats['errors']} erreurs")
    print("="*60)


if __name__ == '__main__':
    print("="*60)
    print("🏥 IMPORT DES CAS CLINIQUES ECOS")
    print("="*60)
    import_all_cases()
