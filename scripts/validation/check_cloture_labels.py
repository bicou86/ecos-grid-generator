#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour vérifier et corriger les labels dans les sections cloture des fichiers USMLE
"""

import json
from pathlib import Path

def check_and_fix_cloture(filepath):
    """Vérifie et corrige les labels dans la section cloture"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    issues = []
    
    # Vérifier si la section cloture existe
    if 'sections' in data and 'cloture' in data['sections']:
        cloture = data['sections']['cloture']
        
        if 'criteria' in cloture:
            for criterion in cloture['criteria']:
                # Vérifier les labels incorrects
                wrong_labels = []
                
                # Vérifier patientComment au lieu de content
                if 'patientComment' in criterion:
                    wrong_labels.append('patientComment')
                    # Remplacer patientComment par content
                    criterion['content'] = criterion.pop('patientComment')
                    modified = True
                
                # Vérifier d'autres labels potentiellement incorrects
                for key in list(criterion.keys()):
                    if key not in ['id', 'text', 'content', 'binaryOnly', 'details', 'subheader']:
                        if key != 'patientComment':  # Déjà traité
                            wrong_labels.append(key)
                
                # Vérifier les labels manquants
                if 'id' not in criterion:
                    issues.append("id manquant")
                if 'text' not in criterion:
                    issues.append("text manquant")
                if 'content' not in criterion and 'details' not in criterion:
                    issues.append("content manquant")
                
                if wrong_labels:
                    issues.append(f"Labels incorrects: {', '.join(wrong_labels)}")
    
    return data, modified, issues

def main():
    # Dossier contenant les fichiers JSON USMLE
    json_dir = Path("json_files/USMLE")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    files_with_cloture = 0
    files_with_issues = 0
    files_fixed = 0
    
    print("Vérification des labels dans les sections 'cloture' des fichiers USMLE...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, issues = check_and_fix_cloture(json_file)
        
        # Vérifier si le fichier a une section cloture
        has_cloture = 'sections' in data and 'cloture' in data['sections']
        
        if has_cloture:
            files_with_cloture += 1
            
            if issues:
                files_with_issues += 1
                print(f"\n⚠️  {json_file.name}")
                for issue in issues:
                    print(f"   - {issue}")
            
            if modified:
                files_fixed += 1
                print(f"\n✅ {json_file.name}")
                print(f"   - Corrigé : 'patientComment' → 'content'")
                
                # Sauvegarder le fichier modifié
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA VÉRIFICATION")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"📝 Fichiers avec section cloture : {files_with_cloture}")
    print(f"⚠️  Fichiers avec problèmes détectés : {files_with_issues}")
    print(f"✅ Fichiers corrigés : {files_fixed}")
    
    if files_fixed > 0:
        print(f"\n✅ Correction terminée ! Les labels 'patientComment' ont été remplacés par 'content'.")
    elif files_with_issues > 0:
        print(f"\n⚠️  Des problèmes ont été détectés mais n'ont pas pu être corrigés automatiquement.")
    else:
        print(f"\n✅ Tous les fichiers sont conformes ! Les labels sont corrects (id, text, content).")

if __name__ == "__main__":
    main()