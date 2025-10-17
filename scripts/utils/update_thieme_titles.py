#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour mettre à jour les titres des fichiers Thieme
en plaçant le numéro juste après "Thieme"
"""

import json
from pathlib import Path
import re

def extract_and_update_title(title):
    """
    Transforme le titre en plaçant le numéro après Thieme
    Exemple: "Thieme Mini-Cas 62 - ..." -> "Thieme 62 Mini-Cas - ..."
    """
    # Patterns possibles
    patterns = [
        # Pattern 1: Thieme-Categorie-Nombre
        (r'^Thieme-(\w+)-(\d+)\s*-\s*(.+)$', r'Thieme \2 \1 - \3'),
        # Pattern 2: Thieme Mini-Cas Nombre
        (r'^Thieme\s+Mini-Cas\s+(\d+)\s*-\s*(.+)$', r'Thieme \1 Mini-Cas - \2'),
        # Pattern 3: Thieme Categorie Nombre
        (r'^Thieme\s+(\w+)\s+(\d+)\s*-\s*(.+)$', r'Thieme \2 \1 - \3'),
        # Pattern 4: Thieme Categorie-Nombre
        (r'^Thieme\s+(\w+)-(\d+)\s*-\s*(.+)$', r'Thieme \2 \1 - \3'),
    ]
    
    for pattern, replacement in patterns:
        match = re.match(pattern, title)
        if match:
            return re.sub(pattern, replacement, title)
    
    # Si aucun pattern ne correspond, retourner le titre original
    return title

def main():
    print("Mise à jour des titres des fichiers Thieme...")
    print("=" * 80)
    
    # Dossier des fichiers Thieme
    thieme_dir = Path("json_files/json_feuille-porte/Thieme")
    
    if not thieme_dir.exists():
        print(f"❌ Le dossier {thieme_dir} n'existe pas!")
        return
    
    # Parcourir tous les fichiers JSON
    json_files = list(thieme_dir.glob("*.json"))
    print(f"📁 {len(json_files)} fichiers JSON trouvés dans {thieme_dir}")
    
    updated_count = 0
    errors = []
    
    for json_file in json_files:
        try:
            # Lire le fichier
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Vérifier si le titre existe
            if 'titre' not in data:
                print(f"⚠️ Pas de titre dans {json_file.name}")
                continue
            
            old_title = data['titre']
            new_title = extract_and_update_title(old_title)
            
            # Si le titre a changé, mettre à jour
            if old_title != new_title:
                data['titre'] = new_title
                
                # Sauvegarder le fichier
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ {json_file.name}")
                print(f"   Ancien: {old_title}")
                print(f"   Nouveau: {new_title}")
                updated_count += 1
            
        except Exception as e:
            error_msg = f"Erreur avec {json_file.name}: {str(e)}"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
    
    # Résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA MISE À JOUR")
    print("=" * 80)
    print(f"📊 Total fichiers traités : {len(json_files)}")
    print(f"✅ Fichiers mis à jour : {updated_count}")
    print(f"⚠️  Fichiers non modifiés : {len(json_files) - updated_count - len(errors)}")
    print(f"❌ Erreurs : {len(errors)}")
    
    if errors:
        print("\nErreurs rencontrées:")
        for error in errors:
            print(f"  - {error}")

if __name__ == "__main__":
    main()