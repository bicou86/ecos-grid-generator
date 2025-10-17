#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger manuellement les treatments incohérents restants
"""

import json
from pathlib import Path

# Corrections manuelles basées sur l'analyse des détails
manual_fixes = {
    "AMBOSS-31 - Toux - Homme 58 ans.json": {
        "O": "Oxygénothérapie"  # Details: "Oxygénothérapie si hypoxémie"
    },
    "AMBOSS-33 - Céphalée - Femme 55 ans.json": {
        "De": "Dexaméthasone"  # Details: "10 mg IV avant/avec 1ère dose ATB"
    },
    "AMBOSS-34 - Perte de vision - Homme 66 ans.json": {
        "N": "NPO (nil per os)"  # Details: "NPO jusqu'à évaluation déglutition"
    },
    "AMBOSS-37 - Changements cutanés - Nouveau-née 4 jours.json": {
        "Ma": "Maximiser l'exposition cutanée"  # Details: "Maximiser surface exposée"
    }
}

def fix_file(filepath, fixes):
    """Applique les corrections manuelles à un fichier"""
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
                        for category in criterion['therapySection'].get('categories', []):
                            if 'items' in category and category['items']:
                                for item in category['items']:
                                    treatment = item.get('treatment', '')
                                    if treatment in fixes:
                                        old_treatment = treatment
                                        new_treatment = fixes[treatment]
                                        item['treatment'] = new_treatment
                                        changes.append(f"  ✓ '{old_treatment}' → '{new_treatment}'")
                                        modified = True
    
    return data, modified, changes

def main():
    print("Correction manuelle des treatments incohérents restants...")
    print("=" * 70)
    
    total_corrections = 0
    
    for filename, fixes in manual_fixes.items():
        filepath = Path(f"json_files/AMBOSS/{filename}")
        
        if not filepath.exists():
            print(f"⚠️  Fichier non trouvé : {filename}")
            continue
        
        data, modified, changes = fix_file(filepath, fixes)
        
        if modified:
            print(f"\n📝 {filename}")
            for change in changes:
                print(change)
                total_corrections += 1
            
            # Sauvegarder le fichier
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 70)
    print(f"✅ {total_corrections} corrections manuelles appliquées avec succès !")

if __name__ == "__main__":
    main()