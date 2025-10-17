#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger uniquement les labels dans les sections cloture
Remplace "patientComment" par "content" sans changer la structure
"""

import json
from pathlib import Path
import subprocess
import sys

def revert_to_git_version(filepath):
    """Revient à la version git du fichier"""
    try:
        subprocess.run(['git', 'checkout', '--', str(filepath)], 
                      check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError:
        return False

def fix_cloture_labels(cloture_section):
    """Corrige uniquement les labels dans la section cloture"""
    if not cloture_section:
        return cloture_section
    
    # Traiter les criteria
    if 'criteria' in cloture_section:
        for criterion in cloture_section['criteria']:
            # Si il y a un patientComment, le renommer en content
            if 'patientComment' in criterion:
                criterion['content'] = criterion.pop('patientComment')
    
    return cloture_section

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    changes = []
    
    # Traiter la section cloture principale
    if 'cloture' in data:
        original = json.dumps(data['cloture'], ensure_ascii=False)
        data['cloture'] = fix_cloture_labels(data['cloture'])
        new = json.dumps(data['cloture'], ensure_ascii=False)
        
        if original != new:
            modified = True
            changes.append("Remplacement patientComment → content dans cloture")
    
    # Vérifier aussi dans sections (au cas où)
    if 'sections' in data and 'cloture' in data['sections']:
        original = json.dumps(data['sections']['cloture'], ensure_ascii=False)
        data['sections']['cloture'] = fix_cloture_labels(data['sections']['cloture'])
        new = json.dumps(data['sections']['cloture'], ensure_ascii=False)
        
        if original != new:
            modified = True
            changes.append("Remplacement patientComment → content dans sections.cloture")
    
    return data, modified, changes

def main():
    # Dossier contenant les fichiers JSON USMLE
    json_dir = Path("json_files/USMLE")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    reverted_files = 0
    modified_files = 0
    
    print("Correction des labels dans les sections 'cloture' des fichiers USMLE...")
    print("=" * 80)
    
    # D'abord, revenir aux versions originales via git
    print("\n📌 Étape 1 : Retour aux versions originales via git...")
    for json_file in sorted(json_dir.glob("*.json")):
        if revert_to_git_version(json_file):
            reverted_files += 1
            print(f"   ↩️  {json_file.name} - Restauré")
    
    if reverted_files == 0:
        print("   ⚠️  Aucun fichier n'a pu être restauré via git")
        print("   Continuons avec les fichiers actuels...")
    
    print(f"\n📌 Étape 2 : Application des corrections de labels...")
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, changes = process_file(json_file)
        
        if modified:
            modified_files += 1
            print(f"\n✅ {json_file.name}")
            for change in changes:
                print(f"   - {change}")
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA CORRECTION DES LABELS")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"↩️  Fichiers restaurés via git : {reverted_files}")
    print(f"✏️  Fichiers avec labels corrigés : {modified_files}")
    
    print(f"\n✅ Correction terminée !")
    print("Changement appliqué :")
    print("  • 'patientComment' → 'content' dans les sections cloture")
    print("  • Structure originale préservée")

if __name__ == "__main__":
    main()