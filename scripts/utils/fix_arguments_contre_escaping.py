#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger les erreurs d'échappement dans les Arguments CONTRE des ddSection
"""

import json
import os
import re
from pathlib import Path

def fix_arguments_contre(text):
    """Corrige les erreurs d'échappement dans les Arguments CONTRE"""
    if not text or not isinstance(text, str):
        return text
    
    original = text
    fixed = text
    
    # Corriger les doubles backslashes avant Arguments CONTRE
    # Pattern: \\nArguments CONTRE:\\n\\t → \nArguments CONTRE:\n\t
    fixed = re.sub(r'\\\\nArguments CONTRE:\\\\n\\\\t', r'\nArguments CONTRE:\n\t', fixed)
    
    # Corriger les simples backslashes mal placés
    # Pattern: \\nArguments CONTRE:\\n\\t → \nArguments CONTRE:\n\t
    fixed = re.sub(r'\\nArguments CONTRE:\\n\\t', r'\nArguments CONTRE:\n\t', fixed)
    
    # Corriger les doubles backslashes dans tout le texte Arguments CONTRE
    # Pattern: \\n → \n et \\t → \t
    if 'Arguments CONTRE:' in fixed:
        parts = fixed.split('Arguments CONTRE:')
        if len(parts) == 2:
            before = parts[0]
            after = parts[1]
            # Corriger uniquement la partie après Arguments CONTRE
            after = after.replace('\\n', '\n').replace('\\t', '\t')
            fixed = before + 'Arguments CONTRE:' + after
    
    # Nettoyer les doubles \n\n qui pourraient apparaître
    fixed = re.sub(r'\n\n+Arguments CONTRE:', r'\nArguments CONTRE:', fixed)
    
    # S'assurer qu'il n'y a pas de double espace après les deux-points
    fixed = re.sub(r'Arguments CONTRE:\s+\n', r'Arguments CONTRE:\n', fixed)
    
    return fixed if fixed != original else text

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    changes = []
    
    # Parcourir les sections pour trouver les ddSection
    if 'sections' in data:
        for section_name, section in data['sections'].items():
            if 'criteria' in section:
                for criterion_idx, criterion in enumerate(section['criteria']):
                    if 'ddSection' in criterion and 'categories' in criterion['ddSection']:
                        for cat_idx, category in enumerate(criterion['ddSection']['categories']):
                            if 'items' in category:
                                for item_idx, item in enumerate(category['items']):
                                    if 'cause' in item and item['cause']:
                                        original = item['cause']
                                        fixed = fix_arguments_contre(original)
                                        
                                        if fixed != original:
                                            item['cause'] = fixed
                                            modified = True
                                            
                                            # Créer un aperçu des changements
                                            if '\\\\n' in original or '\\n' in original:
                                                diagnostic = item.get('text', 'Diagnostic inconnu')
                                                changes.append(f"  • {diagnostic}")
                                                
                                                # Montrer les patterns corrigés
                                                if '\\\\nArguments CONTRE:\\\\n\\\\t' in original:
                                                    changes.append(f"    - Corrigé: \\\\\\\\nArguments CONTRE:\\\\\\\\n\\\\\\\\t → \\nArguments CONTRE:\\n\\t")
                                                elif '\\nArguments CONTRE:\\n\\t' in original:
                                                    changes.append(f"    - Corrigé: \\\\nArguments CONTRE:\\\\n\\\\t → \\nArguments CONTRE:\\n\\t")
    
    return data, modified, changes

def main():
    # Dossier contenant les fichiers JSON AMBOSS
    json_dir = Path("json_files/AMBOSS")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    modified_files = 0
    total_corrections = 0
    
    print("Correction des erreurs d'échappement dans les Arguments CONTRE...")
    print("=" * 70)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, changes = process_file(json_file)
        
        if modified:
            modified_files += 1
            print(f"\n📝 {json_file.name}")
            for change in changes:
                print(change)
                if "Corrigé" in change:
                    total_corrections += 1
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ DES CORRECTIONS")
    print("=" * 70)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    print(f"🔧 Corrections d'échappement : {total_corrections}")
    
    if modified_files == 0:
        print("\n✅ Aucune erreur d'échappement trouvée !")
    else:
        print(f"\n✅ Corrections terminées avec succès !")

if __name__ == "__main__":
    main()