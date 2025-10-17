#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour matcher et renommer les fichiers feuille-porte RESCOS
en comparant les descriptions avec les patients des fichiers principaux
"""

import json
from pathlib import Path
import shutil
import re

def normalize_text(text):
    """Normalise le texte pour la comparaison"""
    if not text:
        return ""
    # Enlever les espaces multiples, ponctuation finale, et normaliser
    text = re.sub(r'\s+', ' ', text.strip())
    text = text.rstrip('.,;:')
    return text.lower()

def load_main_rescos_files():
    """Charge tous les fichiers RESCOS principaux avec leur patient"""
    main_dir = Path("json_files/RESCOS")
    rescos_data = {}
    
    for json_file in main_dir.glob("*.json"):
        # Ignorer le fichier Station double
        if "Station double" in json_file.name:
            continue
            
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraire le patient depuis context
        patient = ""
        if 'context' in data and 'patient' in data['context']:
            patient = data['context']['patient']
        
        rescos_data[json_file.stem] = {
            'patient': patient,
            'patient_normalized': normalize_text(patient),
            'file_path': json_file
        }
    
    return rescos_data

def load_feuille_porte_files():
    """Charge tous les fichiers feuille-porte RESCOS"""
    fp_dir = Path("json_files/json_feuille-porte/RESCOS")
    fp_data = {}
    
    for json_file in fp_dir.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        description = data.get('description', '')
        
        fp_data[json_file.name] = {
            'description': description,
            'description_normalized': normalize_text(description),
            'file_path': json_file,
            'data': data
        }
    
    return fp_data

def find_matches(rescos_data, fp_data):
    """Trouve les correspondances entre les fichiers"""
    matches = []
    unmatched_fp = []
    unmatched_rescos = []
    
    # Pour chaque fichier feuille-porte
    for fp_name, fp_info in fp_data.items():
        fp_desc = fp_info['description_normalized']
        match_found = False
        
        # Chercher une correspondance dans les fichiers RESCOS
        for rescos_name, rescos_info in rescos_data.items():
            rescos_patient = rescos_info['patient_normalized']
            
            # Comparaison exacte ou très proche
            if fp_desc and rescos_patient and (
                fp_desc == rescos_patient or
                fp_desc in rescos_patient or
                rescos_patient in fp_desc
            ):
                matches.append({
                    'fp_file': fp_name,
                    'rescos_file': rescos_name,
                    'fp_path': fp_info['file_path'],
                    'fp_data': fp_info['data'],
                    'description': fp_info['description'],
                    'patient': rescos_info['patient']
                })
                match_found = True
                break
        
        if not match_found:
            unmatched_fp.append(fp_name)
    
    # Trouver les fichiers RESCOS sans correspondance
    matched_rescos = {m['rescos_file'] for m in matches}
    for rescos_name in rescos_data.keys():
        if rescos_name not in matched_rescos:
            unmatched_rescos.append(rescos_name)
    
    return matches, unmatched_fp, unmatched_rescos

def rename_and_update_files(matches):
    """Renomme les fichiers et met à jour les titres"""
    renamed_count = 0
    errors = []
    
    for match in matches:
        try:
            old_path = match['fp_path']
            new_name = match['rescos_file'] + '.json'
            new_path = old_path.parent / new_name
            
            # Mettre à jour le titre dans les données
            match['fp_data']['titre'] = match['rescos_file']
            
            # Sauvegarder avec le nouveau titre
            with open(old_path, 'w', encoding='utf-8') as f:
                json.dump(match['fp_data'], f, ensure_ascii=False, indent=2)
            
            # Renommer le fichier si nécessaire
            if old_path != new_path:
                if new_path.exists():
                    # Si le fichier cible existe déjà, le supprimer
                    new_path.unlink()
                old_path.rename(new_path)
                print(f"✅ Renommé: {match['fp_file']}")
                print(f"   → {new_name}")
                print(f"   Titre: \"{match['rescos_file']}\"")
                renamed_count += 1
            else:
                print(f"✅ Titre mis à jour: {match['fp_file']}")
                renamed_count += 1
                
        except Exception as e:
            errors.append(f"Erreur avec {match['fp_file']}: {str(e)}")
    
    return renamed_count, errors

def main():
    print("Matching et renommage des fichiers feuille-porte RESCOS...")
    print("=" * 80)
    
    # Charger les données
    print("\n📁 Chargement des fichiers...")
    rescos_data = load_main_rescos_files()
    fp_data = load_feuille_porte_files()
    
    print(f"  - {len(rescos_data)} fichiers RESCOS principaux trouvés")
    print(f"  - {len(fp_data)} fichiers feuille-porte trouvés")
    
    # Trouver les correspondances
    print("\n🔍 Recherche des correspondances...")
    matches, unmatched_fp, unmatched_rescos = find_matches(rescos_data, fp_data)
    
    print(f"  - {len(matches)} correspondances trouvées")
    print(f"  - {len(unmatched_fp)} feuilles-porte sans correspondance")
    print(f"  - {len(unmatched_rescos)} fichiers RESCOS sans feuille-porte")
    
    # Afficher quelques exemples de correspondances
    if matches:
        print("\n📋 Exemples de correspondances trouvées:")
        for match in matches[:5]:
            print(f"  • {match['fp_file'][:30]}... → {match['rescos_file'][:40]}...")
    
    # Afficher les non-correspondances
    if unmatched_fp:
        print(f"\n⚠️ Feuilles-porte sans correspondance ({len(unmatched_fp)}):")
        for fp in unmatched_fp[:10]:
            print(f"  - {fp}")
            if len(unmatched_fp) > 10:
                print(f"  ... et {len(unmatched_fp) - 10} autres")
                break
    
    if unmatched_rescos:
        print(f"\n⚠️ Fichiers RESCOS sans feuille-porte ({len(unmatched_rescos)}):")
        for rescos in unmatched_rescos[:10]:
            print(f"  - {rescos}")
            if len(unmatched_rescos) > 10:
                print(f"  ... et {len(unmatched_rescos) - 10} autres")
                break
    
    # Renommer et mettre à jour les fichiers
    if matches:
        print("\n📝 Application des modifications...")
        renamed_count, errors = rename_and_update_files(matches)
        
        if errors:
            print(f"\n❌ Erreurs rencontrées:")
            for error in errors:
                print(f"  - {error}")
    
    # Résumé final
    print("\n" + "=" * 80)
    print("RÉSUMÉ DU MATCHING")
    print("=" * 80)
    print(f"📊 Total fichiers traités : {len(fp_data)}")
    print(f"✅ Fichiers matchés et renommés : {len(matches)}")
    print(f"⚠️  Fichiers non matchés : {len(unmatched_fp)}")
    
    if len(matches) == len(fp_data):
        print(f"\n✅ PARFAIT! Tous les fichiers feuille-porte ont été matchés!")
    else:
        print(f"\n⚠️ {len(unmatched_fp)} fichier(s) feuille-porte n'ont pas pu être matchés")

if __name__ == "__main__":
    main()