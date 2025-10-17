#!/usr/bin/env python3
"""
Script de test pour vérifier que la section résumé est correctement générée
"""

import json
import os
import sys
from pathlib import Path

def check_json_files_with_resume():
    """Vérifie quels fichiers JSON contiennent une section résumé"""
    json_dir = Path("json_files")
    files_with_resume = []
    
    print("🔍 Recherche des fichiers JSON avec section 'resume'...\n")
    
    for json_file in json_dir.glob("*.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'resume' in data:
                    files_with_resume.append(json_file.name)
                    print(f"✅ {json_file.name}")
                    
                    # Afficher un aperçu de la structure
                    if data['resume'].get('titre'):
                        print(f"   Titre: {data['resume']['titre']}")
                    if data['resume'].get('sections'):
                        print(f"   Nombre de sections: {len(data['resume']['sections'])}")
                        for section in data['resume']['sections'][:2]:  # Afficher les 2 premières sections
                            if section.get('titre'):
                                print(f"     - {section['titre']}")
                    print()
        except Exception as e:
            print(f"❌ Erreur avec {json_file.name}: {e}")
    
    print(f"\n📊 Résumé: {len(files_with_resume)} fichiers avec section 'resume' trouvés")
    return files_with_resume

def validate_resume_structure(json_file):
    """Valide la structure de la section résumé dans un fichier JSON"""
    print(f"\n📝 Validation de la structure résumé dans: {json_file}")
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'resume' not in data:
            print("   ❌ Pas de section 'resume'")
            return False
            
        resume = data['resume']
        
        # Vérifier les champs obligatoires
        if not resume.get('titre'):
            print("   ⚠️  Pas de titre dans la section résumé")
            
        if not resume.get('sections'):
            print("   ❌ Pas de sections dans le résumé")
            return False
            
        # Analyser chaque section
        for i, section in enumerate(resume['sections']):
            if not section.get('titre'):
                print(f"   ⚠️  Section {i+1} sans titre")
                
            if section.get('points'):
                print(f"   ✅ Section '{section.get('titre', 'Sans titre')}' avec {len(section['points'])} points")
                
            if section.get('subsections'):
                for subsection in section['subsections']:
                    if subsection.get('tableau'):
                        print(f"      📊 Sous-section avec tableau")
                    if subsection.get('points'):
                        print(f"      • Sous-section avec {len(subsection['points'])} points")
                        
        print("   ✅ Structure valide")
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def main():
    print("=" * 60)
    print("TEST DE LA SECTION RÉSUMÉ DANS LE GÉNÉRATEUR ECOS")
    print("=" * 60)
    
    # Trouver tous les fichiers avec résumé
    files_with_resume = check_json_files_with_resume()
    
    if not files_with_resume:
        print("\n⚠️  Aucun fichier JSON avec section 'resume' trouvé!")
        return
    
    # Valider la structure d'un fichier exemple
    test_file = "json_files/BPCO exacerbation - Femme de 65 ans-1.json"
    if os.path.exists(test_file):
        validate_resume_structure(test_file)
    
    print("\n" + "=" * 60)
    print("✅ TEST TERMINÉ")
    print("=" * 60)
    print("\nPour tester visuellement :")
    print("1. Ouvrez Chablon/Generateur_de_Grilles_ECOS.html dans un navigateur")
    print("2. Chargez un des fichiers JSON listés ci-dessus")
    print("3. Cliquez sur 'Générer la grille ECOS'")
    print("4. Vérifiez que la section résumé apparaît avant les annexes")
    print("   - Fond jaune clair (#fff8e1)")
    print("   - Bordure orange (#f9a825)")
    print("   - Titre en orange foncé (#f57c00)")

if __name__ == "__main__":
    main()