#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger AMBOSS-6 - Prise en charge de l'infertilité
"""

import json
from pathlib import Path

def fix_amboss_6():
    filepath = Path("json_files/AMBOSS/AMBOSS-6 - Douleurs pelviennes - Femme 30 ans.json")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Restructurer correctement la section infertilité
    # Garder les deux premières catégories qui sont correctes
    # Corriger la troisième qui a été mal découpée
    
    if 'sections' in data and 'management' in data['sections']:
        for criterion in data['sections']['management']['criteria']:
            if 'therapySection' in criterion:
                current = criterion['therapySection']
                
                # Reconstruire correctement
                new_categories = [
                    current['categories'][0],  # Traitement des léiomyomes - OK
                    current['categories'][1],  # Traitement de l'endométriose - OK
                    {
                        "title": "Prise en charge de l'infertilité associée",
                        "items": [
                            {
                                "treatment": "Bilan couple complet",
                                "details": "Spermogramme, réserve ovarienne (AMH)"
                            },
                            {
                                "treatment": "Hystérosalpingographie",
                                "details": "Perméabilité tubaire"
                            },
                            {
                                "treatment": "Myomectomie",
                                "details": "Si fibromes sous-muqueux ou > 4cm"
                            },
                            {
                                "treatment": "Stimulation ovarienne",
                                "details": "Clomifène ou gonadotrophines"
                            },
                            {
                                "treatment": "FIV",
                                "details": "Si échec traitement conservateur après 6-12 mois"
                            },
                            {
                                "treatment": "Support psychologique",
                                "details": "Counseling fertilité, groupes de soutien"
                            }
                        ]
                    }
                ]
                
                criterion['therapySection'] = {'categories': new_categories}
                break
    
    # Sauvegarder
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ AMBOSS-6 corrigé avec succès !")
    print("\nStructure corrigée :")
    for cat in new_categories:
        print(f"  • {cat['title']}: {len(cat['items'])} traitement(s)")

if __name__ == "__main__":
    fix_amboss_6()