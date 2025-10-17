#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour convertir TOUTES les therapySection des fichiers AMBOSS
au format 'content' avec bullets, structuré par pathologie
"""

import json
import re
from pathlib import Path

def items_to_content(items):
    """Convertit une liste d'items en string content avec bullets"""
    lines = []
    for item in items:
        treatment = item.get('treatment', '')
        details = item.get('details', '')
        duration = item.get('duration', '')
        
        # Construire la ligne
        line = f"• {treatment}"
        
        # Ajouter les détails si pertinents
        if details and details != treatment and details != duration:
            # Si les détails sont courts, les ajouter sur la même ligne
            if len(details) < 50:
                line += f" : {details}"
            else:
                # Si longs, potentiellement les découper
                line += f" : {details}"
        
        # Ajouter la durée si pertinente et différente de "Selon réponse clinique"
        if duration and duration != "Selon réponse clinique" and duration != details and duration != treatment:
            if len(duration) < 30:
                line += f" × {duration}"
        
        lines.append(line)
    
    return '\n'.join(lines)

def detect_categories_in_items(items):
    """Détecte les catégories cachées dans les items"""
    categories = []
    current_category = None
    current_items = []
    
    category_patterns = [
        r'^Si\s+(.+?)(?:\s+confirmée?)?(?:\s*:)?$',
        r'^Traitement\s+(?:de\s+)?(?:la\s+)?(.+?)(?:\s*:)?$',
        r'^Prise en charge\s+(?:de\s+)?(?:la\s+)?(.+?)(?:\s*:)?$',
        r'^Mesures?\s+(.+?)(?:\s*:)?$',
        r'^Antibiothérapie\s+(.+?)(?:\s*:)?$',
        r'^Prophylaxie\s+(.+?)(?:\s*:)?$',
        r'^Stabilisation\s+(.+?)(?:\s*:)?$',
        r'^Prévention\s+(.+?)(?:\s*:)?$',
    ]
    
    for item in items:
        treatment = item.get('treatment', '')
        
        # Vérifier si c'est un header de catégorie
        is_category = False
        for pattern in category_patterns:
            if re.match(pattern, treatment, re.IGNORECASE):
                is_category = True
                break
        
        if is_category:
            # Sauvegarder la catégorie précédente
            if current_category and current_items:
                categories.append({
                    'title': current_category,
                    'items': current_items
                })
            current_category = treatment.rstrip(':')
            current_items = []
        else:
            # Ajouter à la catégorie courante
            current_items.append(item)
    
    # Ajouter la dernière catégorie
    if current_category and current_items:
        categories.append({
            'title': current_category,
            'items': current_items
        })
    
    return categories if categories else None

def convert_therapy_section(therapy_section):
    """Convertit une therapySection au format content"""
    if not therapy_section or 'categories' not in therapy_section:
        return therapy_section
    
    new_categories = []
    
    for category in therapy_section['categories']:
        # Si la catégorie a déjà du content, la garder
        if 'content' in category and category['content']:
            new_categories.append(category)
            continue
        
        # Si elle a des items, les convertir
        if 'items' in category and category['items']:
            # D'abord vérifier s'il y a des sous-catégories cachées
            detected_cats = detect_categories_in_items(category['items'])
            
            if detected_cats:
                # Convertir chaque sous-catégorie
                for subcat in detected_cats:
                    new_categories.append({
                        'title': subcat['title'],
                        'content': items_to_content(subcat['items'])
                    })
            else:
                # Convertir directement
                new_categories.append({
                    'title': category.get('title', 'Prise en charge thérapeutique'),
                    'content': items_to_content(category['items'])
                })
    
    return {'categories': new_categories}

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    changes = []
    
    # Parcourir les sections pour trouver les therapySection
    if 'sections' in data:
        for section_name, section in data['sections'].items():
            if 'criteria' in section:
                for criterion in section['criteria']:
                    if 'therapySection' in criterion:
                        original = criterion['therapySection']
                        converted = convert_therapy_section(original)
                        
                        if converted != original:
                            criterion['therapySection'] = converted
                            modified = True
                            
                            changes.append(f"  Section '{section_name}', critère '{criterion.get('text', 'N/A')}':")
                            for cat in converted['categories']:
                                lines = len(cat.get('content', '').split('\n'))
                                changes.append(f"    • {cat['title']}: {lines} traitement(s)")
    
    return data, modified, changes

def main():
    # Dossier contenant les fichiers JSON AMBOSS
    json_dir = Path("json_files/AMBOSS")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    modified_files = 0
    
    print("Conversion des therapySection au format 'content' avec bullets...")
    print("=" * 70)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, changes = process_file(json_file)
        
        if modified:
            modified_files += 1
            print(f"\n📝 {json_file.name}")
            for change in changes:
                print(change)
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ DE LA CONVERSION")
    print("=" * 70)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    
    print(f"\n✅ Conversion terminée ! Format 'content' avec bullets appliqué.")
    print("Les pathologies sont maintenant en 'title' avec leurs traitements listés en bullets.")

if __name__ == "__main__":
    main()