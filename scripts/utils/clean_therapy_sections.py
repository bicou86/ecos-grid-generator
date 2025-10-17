#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour nettoyer les therapySection dans les fichiers JSON AMBOSS :
1. Capitaliser la première lettre de chaque valeur
2. Supprimer les doublons entre treatment/details et details/duration
"""

import json
import os
from pathlib import Path

def capitalize_first_letter(text):
    """Capitalise la première lettre d'une chaîne si nécessaire"""
    if not text or not isinstance(text, str):
        return text
    
    # Si le texte commence déjà par une majuscule ou un caractère spécial, ne pas modifier
    if text[0].isupper() or not text[0].isalpha():
        return text
    
    return text[0].upper() + text[1:] if len(text) > 1 else text.upper()

def clean_therapy_item(item):
    """Nettoie un item de therapySection"""
    cleaned = {}
    changes = []
    
    # Capitaliser les premières lettres
    for key in ['treatment', 'details', 'duration']:
        if key in item and item[key]:
            original = item[key]
            capitalized = capitalize_first_letter(original)
            if original != capitalized:
                changes.append(f"    - {key}: '{original[:50]}...' → Capitalisé")
            cleaned[key] = capitalized
    
    # Supprimer les doublons
    # 1. Si details == treatment, supprimer details
    if 'treatment' in cleaned and 'details' in cleaned:
        if cleaned['details'] == cleaned['treatment']:
            del cleaned['details']
            changes.append(f"    - Suppression details (doublon de treatment)")
    
    # 2. Si duration == details, supprimer duration
    if 'details' in cleaned and 'duration' in cleaned:
        if cleaned['duration'] == cleaned['details']:
            del cleaned['duration']
            changes.append(f"    - Suppression duration (doublon de details)")
    
    # 3. Si duration == treatment (cas où details a été supprimé), supprimer duration
    if 'treatment' in cleaned and 'duration' in cleaned and 'details' not in cleaned:
        if cleaned['duration'] == cleaned['treatment']:
            del cleaned['duration']
            changes.append(f"    - Suppression duration (doublon de treatment)")
    
    return cleaned, changes

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    all_changes = []
    
    # Parcourir les sections pour trouver les therapySection
    if 'sections' in data:
        for section_name, section in data['sections'].items():
            if 'criteria' in section:
                for criterion in section['criteria']:
                    if 'therapySection' in criterion:
                        for category in criterion['therapySection'].get('categories', []):
                            if 'items' in category and category['items']:
                                category_changes = []
                                cleaned_items = []
                                
                                for i, item in enumerate(category['items']):
                                    cleaned_item, changes = clean_therapy_item(item)
                                    cleaned_items.append(cleaned_item)
                                    
                                    if changes:
                                        category_changes.extend(changes)
                                        modified = True
                                
                                if category_changes:
                                    all_changes.append(f"  Catégorie '{category.get('title', 'Sans titre')}':")
                                    all_changes.extend(category_changes)
                                
                                category['items'] = cleaned_items
    
    return data, modified, all_changes

def main():
    # Dossier contenant les fichiers JSON AMBOSS
    json_dir = Path("json_files/AMBOSS")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    modified_files = 0
    total_capitalizations = 0
    total_duplicates_removed = 0
    
    print("Nettoyage des therapySection dans les fichiers AMBOSS...")
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
                if "Capitalisé" in change:
                    total_capitalizations += 1
                elif "Suppression" in change:
                    total_duplicates_removed += 1
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ DU NETTOYAGE")
    print("=" * 70)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    print(f"🔤 Capitalisations effectuées : {total_capitalizations}")
    print(f"🗑️  Doublons supprimés : {total_duplicates_removed}")
    
    if modified_files == 0:
        print("\n✅ Tous les fichiers sont déjà propres !")
    else:
        print(f"\n✅ Nettoyage terminé avec succès !")

if __name__ == "__main__":
    main()