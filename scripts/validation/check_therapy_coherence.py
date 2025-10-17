#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour vérifier et corriger la cohérence des treatments dans les therapySection
"""

import json
import os
import re
from pathlib import Path

def is_incoherent_treatment(treatment):
    """Vérifie si un treatment est incohérent"""
    if not treatment or not isinstance(treatment, str):
        return False
    
    # Patterns incohérents : lettres isolées, mots tronqués, etc.
    incoherent_patterns = [
        r'^[A-Z]$',  # Une seule lettre majuscule
        r'^[A-Z]{1,2}$',  # Une ou deux lettres majuscules
        r'^[a-z]$',  # Une seule lettre minuscule
        r'^\w{1,2}$',  # Un ou deux caractères alphanumériques seulement
    ]
    
    for pattern in incoherent_patterns:
        if re.match(pattern, treatment.strip()):
            return True
    
    return False

def infer_treatment_from_details(details):
    """Tente de déduire le treatment à partir des details"""
    if not details:
        return None
    
    # Mappings basés sur les patterns observés
    if "Excision" in details or "excision" in details:
        return "Excision chirurgicale"
    elif "FIV" in details or "fécondation" in details.lower():
        return "FIV (Fécondation In Vitro)"
    elif "ERCP" in details:
        return "ERCP avec sphinctérotomie"
    elif "rtPA" in details or "rt-PA" in details:
        return "Thrombolyse IV (rtPA)"
    elif "Nimodipine" in details or "nimodipine" in details:
        return "Nimodipine IV"
    elif "AAS" in details:
        return "Antiagrégation plaquettaire"
    elif "O2" in details or "oxygène" in details.lower():
        return "Oxygénothérapie"
    elif "Morphine" in details or "morphine" in details:
        return "Analgésie morphinique"
    elif "Héparine" in details or "héparine" in details:
        return "Anticoagulation"
    elif "Repos" in details or "repos" in details:
        return "Repos et observation"
    elif "Drainage" in details or "drainage" in details:
        return "Drainage thoracique"
    elif "Surveillance" in details or "surveillance" in details:
        return "Surveillance clinique"
    elif "Réanimation" in details or "réanimation" in details:
        return "Réanimation liquidienne"
    elif "Nutrition" in details or "nutrition" in details:
        return "Support nutritionnel"
    elif "Réhydratation" in details or "réhydratation" in details:
        return "Réhydratation orale"
    
    # Si on ne peut pas déduire, retourner None
    return None

def infer_treatment_from_duration(duration):
    """Tente de déduire le treatment à partir de la duration si elle contient des infos"""
    if not duration:
        return None
    
    # Parfois la duration contient en fait le treatment
    if len(duration) > 50 and not duration.startswith("Selon"):
        # C'est probablement le treatment qui a été mis dans duration
        return duration.split(".")[0] if "." in duration else duration[:50] + "..."
    
    return None

def fix_therapy_item(item, file_name, category_title):
    """Corrige un item de therapySection"""
    changes = []
    
    if 'treatment' not in item:
        changes.append(f"    ⚠️  Pas de treatment dans {category_title}")
        return item, changes
    
    treatment = item.get('treatment', '')
    details = item.get('details', '')
    duration = item.get('duration', '')
    
    if is_incoherent_treatment(treatment):
        original_treatment = treatment
        
        # Essayer de déduire le treatment correct
        new_treatment = None
        
        # D'abord essayer depuis les details
        if details:
            new_treatment = infer_treatment_from_details(details)
        
        # Si pas trouvé, essayer depuis duration
        if not new_treatment and duration:
            new_treatment = infer_treatment_from_duration(duration)
        
        # Corrections spécifiques basées sur les patterns observés
        if original_treatment == "E" and "Excision" in details:
            new_treatment = "Excision chirurgicale"
        elif original_treatment == "F" and "FIV" in details:
            new_treatment = "FIV (Fécondation In Vitro)"
        elif original_treatment == "F" and "FIV" in duration:
            new_treatment = "FIV"
            # Déplacer duration vers details si elle contient plus d'info
            if len(duration) > 20:
                item['details'] = duration
                item['duration'] = "Selon réponse clinique"
        
        if new_treatment:
            item['treatment'] = new_treatment
            changes.append(f"    ✓ '{original_treatment}' → '{new_treatment}'")
        else:
            changes.append(f"    ⚠️  Treatment incohérent '{original_treatment}' - correction manuelle nécessaire")
            changes.append(f"       Details: {details[:50]}..." if len(details) > 50 else f"       Details: {details}")
    
    return item, changes

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
                            category_title = category.get('title', 'Sans titre')
                            if 'items' in category and category['items']:
                                category_changes = []
                                
                                for i, item in enumerate(category['items']):
                                    fixed_item, changes = fix_therapy_item(item, filepath.name, category_title)
                                    category['items'][i] = fixed_item
                                    
                                    if changes:
                                        category_changes.extend(changes)
                                        modified = True
                                
                                if category_changes:
                                    all_changes.append(f"  Catégorie '{category_title}':")
                                    all_changes.extend(category_changes)
    
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
    total_corrections = 0
    manual_fixes_needed = 0
    
    print("Vérification de la cohérence des treatments dans les therapySection...")
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
                if "✓" in change:
                    total_corrections += 1
                elif "⚠️" in change and "correction manuelle" in change:
                    manual_fixes_needed += 1
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ DE LA VÉRIFICATION")
    print("=" * 70)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    print(f"✅ Corrections automatiques : {total_corrections}")
    print(f"⚠️  Corrections manuelles nécessaires : {manual_fixes_needed}")
    
    if modified_files == 0:
        print("\n✅ Tous les treatments sont cohérents !")
    else:
        print(f"\n✅ Vérification terminée !")
        if manual_fixes_needed > 0:
            print(f"⚠️  {manual_fixes_needed} corrections nécessitent une vérification manuelle")

if __name__ == "__main__":
    main()