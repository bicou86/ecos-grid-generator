#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger spécifiquement AMBOSS-32 et montrer le modèle de restructuration
"""

import json
from pathlib import Path

def restructure_amboss_32():
    """Restructure correctement AMBOSS-32 comme exemple"""
    
    filepath = Path("json_files/AMBOSS/AMBOSS-32 - Lésion génitale - Femme 17 ans.json")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Structure correcte pour AMBOSS-32
    correct_therapy_section = {
        "categories": [
            {
                "title": "Si infection VPH (condylomes) confirmée",
                "items": [
                    {
                        "treatment": "Imiquimod 5% crème",
                        "details": "Application × 3/semaine × 16 semaines"
                    },
                    {
                        "treatment": "Podophyllotoxine",
                        "details": "0.5% × 2/j × 3 jours"
                    },
                    {
                        "treatment": "Cryothérapie",
                        "details": "Azote liquide hebdomadaire"
                    },
                    {
                        "treatment": "Surveillance régulière",
                        "details": "Récidives fréquentes"
                    },
                    {
                        "treatment": "Compléter vaccination VPH",
                        "details": "Doses 2 et 3"
                    }
                ]
            },
            {
                "title": "Si infection Chlamydia confirmée",
                "items": [
                    {
                        "treatment": "Azithromycine",
                        "details": "1 g dose unique PO"
                    },
                    {
                        "treatment": "Doxycycline (alternative)",
                        "details": "100 mg × 2/j × 7 jours"
                    },
                    {
                        "treatment": "Traitement des partenaires",
                        "details": "Obligatoire pour tous les partenaires récents"
                    },
                    {
                        "treatment": "Test de guérison",
                        "details": "À 3-4 semaines post-traitement"
                    }
                ]
            },
            {
                "title": "Si gonorrhée associée",
                "items": [
                    {
                        "treatment": "Ceftriaxone",
                        "details": "500 mg IM dose unique"
                    },
                    {
                        "treatment": "Azithromycine (association)",
                        "details": "1 g PO en association"
                    },
                    {
                        "treatment": "Déclaration obligatoire",
                        "details": "Maladie à déclaration obligatoire"
                    }
                ]
            },
            {
                "title": "Si syphilis primaire",
                "items": [
                    {
                        "treatment": "Benzathine pénicilline G",
                        "details": "2.4 MU IM dose unique"
                    },
                    {
                        "treatment": "Doxycycline (si allergie)",
                        "details": "100 mg × 2/j × 14 jours"
                    },
                    {
                        "treatment": "Suivi sérologique",
                        "details": "À 3, 6 et 12 mois"
                    }
                ]
            },
            {
                "title": "Mesures générales",
                "items": [
                    {
                        "treatment": "Abstinence sexuelle",
                        "details": "Jusqu'à guérison complète"
                    },
                    {
                        "treatment": "Dépistage et traitement des partenaires",
                        "details": "Tous les partenaires récents"
                    },
                    {
                        "treatment": "Préservatifs",
                        "details": "Sans latex si allergie, utilisation systématique"
                    },
                    {
                        "treatment": "Dépistage IST complet",
                        "details": "VIH, hépatites B et C"
                    },
                    {
                        "treatment": "Suivi gynécologique",
                        "details": "Régulier post-traitement"
                    }
                ]
            }
        ]
    }
    
    # Mettre à jour le fichier
    if 'sections' in data and 'management' in data['sections']:
        for criterion in data['sections']['management']['criteria']:
            if 'therapySection' in criterion:
                criterion['therapySection'] = correct_therapy_section
                break
    
    # Sauvegarder
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ AMBOSS-32 restructuré avec succès !")
    print("\nNouvelle structure :")
    for cat in correct_therapy_section['categories']:
        print(f"  • {cat['title']}: {len(cat['items'])} traitement(s)")

if __name__ == "__main__":
    restructure_amboss_32()