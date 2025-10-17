#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour tester la génération HTML avec les nouvelles couleurs de therapySection
"""

import json
import subprocess
import time
import webbrowser
import os

def test_generation():
    # Fichier JSON à tester (utiliser un fichier avec therapySection complète)
    test_file = "json_files/AMBOSS/AMBOSS-4 - Saignements vaginaux - Femme 50 ans.json"
    
    if not os.path.exists(test_file):
        print(f"Erreur : Le fichier {test_file} n'existe pas")
        return
    
    # Lire le JSON
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Vérifier qu'il y a bien une therapySection
    has_therapy = False
    if 'sections' in data and 'management' in data['sections']:
        for criterion in data['sections']['management']['criteria']:
            if 'therapySection' in criterion:
                has_therapy = True
                print(f"✓ therapySection trouvée dans le critère '{criterion.get('text', 'N/A')}'")
                print(f"  Nombre de catégories : {len(criterion['therapySection']['categories'])}")
                for cat in criterion['therapySection']['categories']:
                    print(f"    - {cat.get('title', 'Sans titre')}: {len(cat.get('items', []))} traitements")
                break
    
    if not has_therapy:
        print("⚠ Aucune therapySection trouvée dans ce fichier")
        return
    
    # Ouvrir le générateur dans le navigateur
    generator_path = "Chablon/Generateur_de_Grilles_ECOS.html"
    print(f"\n1. Ouvrez le générateur : {generator_path}")
    print(f"2. Chargez le fichier JSON : {test_file}")
    print(f"3. Vérifiez les couleurs dans la section Management :")
    print(f"   - Titres de pathologie : ROUGE (#a92117)")
    print(f"   - Traitements : JAUNE (#998800)")
    print(f"   - Détails et durée : GRIS (#666)")
    
    # Optionnel : ouvrir automatiquement le générateur
    try:
        full_path = os.path.abspath(generator_path)
        webbrowser.open(f"file://{full_path}")
        print(f"\n✓ Générateur ouvert dans le navigateur")
    except:
        print(f"\n⚠ Impossible d'ouvrir automatiquement le navigateur")

if __name__ == "__main__":
    test_generation()