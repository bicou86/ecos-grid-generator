#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour standardiser les titres des fichiers German
Met à jour la valeur "title" avec le nom du fichier (sans l'extension .json)
"""

import json
from pathlib import Path

def update_title_from_filename(filepath):
    """Met à jour le titre du fichier JSON avec le nom du fichier"""
    # Extraire le nom du fichier sans extension
    filename_without_ext = filepath.stem
    
    # Lire le fichier JSON
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Vérifier si le titre actuel est différent
    current_title = data.get('title', '')
    
    # Mettre à jour le titre si nécessaire
    if current_title != filename_without_ext:
        data['title'] = filename_without_ext
        return data, True, current_title
    
    return data, False, current_title

def main():
    # Dossier contenant les fichiers JSON German
    json_dir = Path("json_files/German")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    updated_files = 0
    
    print("Standardisation des titres dans les fichiers German...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        
        data, modified, old_title = update_title_from_filename(json_file)
        
        if modified:
            updated_files += 1
            new_title = data['title']
            print(f"✅ {json_file.name}")
            print(f"   Ancien titre : \"{old_title}\"")
            print(f"   Nouveau titre : \"{new_title}\"")
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA STANDARDISATION")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {updated_files}")
    print(f"✅ Fichiers déjà conformes : {total_files - updated_files}")
    
    if updated_files > 0:
        print(f"\n✅ Standardisation terminée ! {updated_files} titre(s) mis à jour.")
    else:
        print(f"\n✅ Tous les fichiers avaient déjà le bon titre !")

if __name__ == "__main__":
    main()