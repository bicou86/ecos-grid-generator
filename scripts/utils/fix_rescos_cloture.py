#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger les labels dans les sections cloture des fichiers RESCOS
Remplace exemplesPhrases par content
"""

import json
from pathlib import Path

def fix_cloture_section(data):
    """Corrige les labels dans la section cloture"""
    modified = False
    
    if 'sections' in data and 'cloture' in data['sections']:
        cloture = data['sections']['cloture']
        
        if 'criteria' in cloture:
            for criterion in cloture['criteria']:
                # Remplacer exemplesPhrases par content
                if 'exemplesPhrases' in criterion:
                    # Si exemplesPhrases est un tableau, joindre les éléments
                    if isinstance(criterion['exemplesPhrases'], list):
                        criterion['content'] = '\n'.join(criterion['exemplesPhrases'])
                    else:
                        criterion['content'] = criterion['exemplesPhrases']
                    del criterion['exemplesPhrases']
                    modified = True
                
                # Remplacer patientComment par content
                if 'patientComment' in criterion:
                    criterion['content'] = criterion.pop('patientComment')
                    modified = True
                
                # Remplacer response par content
                if 'response' in criterion:
                    criterion['content'] = criterion.pop('response')
                    modified = True
                
                # Remplacer reponseType par content
                if 'reponseType' in criterion:
                    criterion['content'] = criterion.pop('reponseType')
                    modified = True
                
                # Si pas de content mais un text long, créer un content vide
                if 'content' not in criterion and 'text' in criterion:
                    # Pour RESCOS, on laisse le content vide si c'est juste un titre
                    if criterion['text'] in ['Clôture type', 'Questions difficiles à poser', 'Réponse type du candidat']:
                        criterion['content'] = ""
                        modified = True
    
    return modified

def main():
    # Dossier contenant les fichiers JSON RESCOS
    json_dir = Path("json_files/RESCOS")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    files_with_cloture = 0
    files_fixed = 0
    
    print("Correction des labels dans les sections cloture des fichiers RESCOS...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Vérifier si le fichier a une section cloture
        has_cloture = 'sections' in data and 'cloture' in data['sections']
        
        if has_cloture:
            files_with_cloture += 1
            
            if fix_cloture_section(data):
                files_fixed += 1
                print(f"✅ {json_file.name}")
                
                # Sauvegarder le fichier modifié
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA CORRECTION")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"📝 Fichiers avec section cloture : {files_with_cloture}")
    print(f"✅ Fichiers corrigés : {files_fixed}")
    
    if files_fixed > 0:
        print(f"\n✅ Correction terminée ! Les labels 'exemplesPhrases' ont été remplacés par 'content'.")
    else:
        print(f"\n✅ Aucune correction nécessaire.")

if __name__ == "__main__":
    main()