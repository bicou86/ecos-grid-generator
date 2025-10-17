#!/usr/bin/env python3
"""
Import ECOS Revision Fiches to Database
Imports SSP, Skills, and Dx fiches from ecos-skills-summary project
"""
import psycopg2
import os
import re
import json
from pathlib import Path

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'ecos_platform'),
        user=os.getenv('DB_USER', 'ecos_user'),
        password=os.getenv('DB_PASSWORD', 'ecos_secure_password_2025')
    )

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[àáâãäå]', 'a', slug)
    slug = re.sub(r'[èéêë]', 'e', slug)
    slug = re.sub(r'[ìíîï]', 'i', slug)
    slug = re.sub(r'[òóôõö]', 'o', slug)
    slug = re.sub(r'[ùúûü]', 'u', slug)
    slug = re.sub(r'[ç]', 'c', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:200]

def extract_metadata_from_markdown(content):
    """Extract metadata from markdown content"""
    metadata = {
        'discipline': None,
        'frequency_rating': None,
        'is_urgent': False,
        'red_flags': []
    }

    # Extract discipline
    discipline_match = re.search(r'\*\*Discipline\*\*\s*:?\s*([^\n]+)', content)
    if discipline_match:
        metadata['discipline'] = discipline_match.group(1).strip()

    # Extract frequency rating (stars)
    freq_match = re.search(r'\*\*Fréquence.*ECOS\*\*\s*:?\s*([⭐]+)', content)
    if freq_match:
        metadata['frequency_rating'] = len(freq_match.group(1))

    # Check if urgent
    if 'urgence' in content.lower() or '🚨' in content or 'red flag' in content.lower():
        metadata['is_urgent'] = True

    # Extract red flags
    red_flag_pattern = r'(?:🚨|⚠️|Red Flag|RED FLAG)[^\n]*([^\n]+)'
    red_flags = re.findall(red_flag_pattern, content, re.IGNORECASE)
    metadata['red_flags'] = red_flags[:5]  # Limit to 5

    return metadata

def extract_sections_from_markdown(content):
    """Extract structured sections from markdown"""
    sections = []

    # Common section patterns
    section_patterns = {
        'anamnese': r'##\s*(?:📋\s*)?ANAMN[ÈE]SE',
        'examen': r'##\s*(?:🩺\s*)?EXAMEN CLINIQUE',
        'management': r'##\s*(?:💊\s*)?(?:PRISE EN CHARGE|TRAITEMENT)',
        'red_flags': r'##\s*(?:🚨|⚠️\s*)?(?:RED FLAGS?|URGENCES?)',
        'diagnostics': r'##\s*(?:🔍\s*)?DIAGNOSTICS DIFF[ÉE]RENTIELS',
        'points_cles': r'##\s*(?:📌|🎯\s*)?POINTS CL[ÉE]S',
        'algorithme': r'##\s*(?:📊\s*)?ALGORITHME',
    }

    for section_type, pattern in section_patterns.items():
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            # Extract section content until next ## or end
            start_pos = match.end()
            next_section = re.search(r'\n##\s', content[start_pos:])
            end_pos = start_pos + next_section.start() if next_section else len(content)
            section_content = content[start_pos:end_pos].strip()

            if section_content:
                sections.append({
                    'type': section_type,
                    'title': match.group(0).strip('#').strip(),
                    'content': section_content
                })

    return sections

def extract_tags_from_content(content, title):
    """Extract relevant tags from content"""
    tags = set()

    # Add from title
    title_words = re.findall(r'\b[A-ZÀ-Ö][a-zà-ö]+\b', title)
    tags.update([w.lower() for w in title_words if len(w) > 3])

    # Common medical terms
    medical_terms = [
        'urgence', 'avc', 'infarctus', 'insuffisance', 'syndrome',
        'douleur', 'dyspn[ée]e', 'céphalée', 'vertiges', 'fièvre',
        'anamnèse', 'examen', 'traitement', 'diagnostic',
        'cardiologie', 'neurologie', 'pneumologie', 'gastro'
    ]

    for term in medical_terms:
        if re.search(term, content, re.IGNORECASE):
            tags.add(term.replace('[ée]', 'e'))

    return list(tags)[:20]  # Limit to 20 tags

def import_fiche_file(filepath, fiche_type, conn):
    """Import a single fiche file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract title from filename or first heading
        filename = filepath.stem
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else filename

        # Remove type prefix from title (e.g., "SSP_", "Dx_", "Skills_")
        title = re.sub(r'^(?:SSP|Dx|Skills)_', '', title)
        title = title.replace('_', ' ')

        # Truncate if too long
        if len(title) > 450:
            title = title[:447] + '...'

        slug = create_slug(title)

        # Extract metadata
        metadata = extract_metadata_from_markdown(content)

        # Extract subtitle/description from second heading or intro paragraph
        subtitle_match = re.search(r'##\s*(.+?)$', content, re.MULTILINE)
        subtitle = subtitle_match.group(1).strip() if subtitle_match else None

        desc_match = re.search(r'\*\*Description\*\*\s*:?\s*([^\n]+)', content)
        description = desc_match.group(1).strip() if desc_match else None

        # Insert fiche
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO fiches
            (slug, title, fiche_type, subtitle, description, discipline,
             frequency_rating, is_urgent, content_markdown, metadata, is_published)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                content_markdown = EXCLUDED.content_markdown,
                metadata = EXCLUDED.metadata,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """, (
            slug, title, fiche_type, subtitle, description,
            metadata['discipline'], metadata['frequency_rating'],
            metadata['is_urgent'], content, json.dumps(metadata)
        ))

        fiche_id = cur.fetchone()[0]

        # Extract and insert sections
        sections = extract_sections_from_markdown(content)
        for idx, section in enumerate(sections):
            cur.execute("""
                INSERT INTO fiche_sections
                (fiche_id, section_type, title, content, display_order)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                fiche_id, section['type'], section['title'],
                section['content'], idx
            ))

        # Extract and insert tags
        tags = extract_tags_from_content(content, title)
        for tag in tags:
            cur.execute("""
                INSERT INTO fiche_tags (fiche_id, tag)
                VALUES (%s, %s)
                ON CONFLICT (fiche_id, tag) DO NOTHING
            """, (fiche_id, tag))

        conn.commit()
        return True, title

    except Exception as e:
        conn.rollback()
        return False, str(e)

def main():
    """Main import function"""
    # Path to ecos-skills-summary project
    fiches_base_path = Path('/Users/damienfulliquet/Documents/GitHub/ecos-skills-summary/Fiches')

    if not fiches_base_path.exists():
        print(f"❌ Fiches directory not found: {fiches_base_path}")
        return

    conn = get_db_connection()
    conn.autocommit = False  # Use transactions

    stats = {'total': 0, 'success': 0, 'skipped': 0, 'errors': 0}

    # Define fiche types and their directories
    fiche_types = [
        ('ssp', 'SSP'),
        ('skills', 'Skills'),
        ('dx', 'Dx'),
    ]

    print("🚀 Starting fiches import...")
    print(f"📂 Source: {fiches_base_path}\n")

    for fiche_type, directory in fiche_types:
        dir_path = fiches_base_path / directory

        if not dir_path.exists():
            print(f"⚠️  Directory not found: {directory}")
            continue

        # Get all markdown files
        md_files = list(dir_path.glob('*.md'))
        print(f"\n{'='*60}")
        print(f"📁 Processing {directory} ({len(md_files)} files)")
        print(f"{'='*60}")

        for filepath in md_files:
            stats['total'] += 1
            success, result = import_fiche_file(filepath, fiche_type, conn)

            if success:
                stats['success'] += 1
                print(f"✅ {filepath.name:50} → {result}")
            else:
                stats['errors'] += 1
                print(f"❌ {filepath.name:50} → Error: {result}")

    conn.close()

    # Print summary
    print(f"\n{'='*60}")
    print("📊 IMPORT SUMMARY")
    print(f"{'='*60}")
    print(f"Total processed: {stats['total']}")
    print(f"✅ Success: {stats['success']}")
    print(f"❌ Errors: {stats['errors']}")
    print(f"⏭️  Skipped: {stats['skipped']}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
