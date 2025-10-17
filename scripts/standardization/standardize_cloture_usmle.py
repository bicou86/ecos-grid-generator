#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour standardiser les sections "cloture" des fichiers USMLE
selon la structure: Questions difficiles / Réponse type
"""

import json
import re
from pathlib import Path

def standardize_cloture_section(cloture_section):
    """Standardise une section cloture"""
    if not cloture_section:
        return cloture_section
    
    # S'assurer que weight est à 0
    cloture_section['weight'] = 0
    
    # Traiter les criteria
    if 'criteria' not in cloture_section:
        return cloture_section
    
    new_criteria = []
    
    # Analyser les critères existants
    for criterion in cloture_section['criteria']:
        text = criterion.get('text', '').lower()
        content = criterion.get('content', criterion.get('patientComment', ''))
        
        # Identifier le type de critère
        if any(word in text for word in ['clôture', 'closure', 'closing', 'type']):
            # C'est probablement la réponse type du candidat
            if content and not content.startswith('['):
                new_criteria.append({
                    "id": "cl2",
                    "text": "Réponse type du candidat",
                    "content": content
                })
        elif any(word in text for word in ['question', 'défi', 'challenge', 'difficile']):
            # C'est une question difficile
            if content:
                # S'assurer que c'est entre crochets
                if not content.startswith('['):
                    content = f"[{content}]"
                new_criteria.append({
                    "id": "cl1",
                    "text": "Questions difficiles à poser",
                    "content": content
                })
        elif 'patientComment' in criterion:
            # Si c'est un patientComment, c'est probablement une question
            comment = criterion['patientComment']
            if comment:
                if not comment.startswith('['):
                    comment = f"[{comment}]"
                new_criteria.append({
                    "id": "cl1",
                    "text": "Questions difficiles à poser",
                    "content": comment
                })
        elif content:
            # Analyser le contenu pour déterminer le type
            if content.startswith('[') or 'je' in content.lower()[:50] or '?' in content:
                # Probablement une question du patient
                if not content.startswith('['):
                    content = f"[{content}]"
                new_criteria.append({
                    "id": "cl1",
                    "text": "Questions difficiles à poser",
                    "content": content
                })
            else:
                # Probablement une réponse type
                new_criteria.append({
                    "id": "cl2",
                    "text": "Réponse type du candidat",
                    "content": content
                })
    
    # Si on a trouvé des critères valides, les réorganiser
    if new_criteria:
        # Trier pour avoir cl1 puis cl2
        new_criteria.sort(key=lambda x: x['id'])
        
        # S'assurer qu'on a les deux types si possible
        has_cl1 = any(c['id'] == 'cl1' for c in new_criteria)
        has_cl2 = any(c['id'] == 'cl2' for c in new_criteria)
        
        # Si on n'a qu'un seul type, essayer de déduire l'autre
        if has_cl1 and not has_cl2:
            # On a la question mais pas la réponse
            # Chercher dans les anciens critères
            for criterion in cloture_section['criteria']:
                if 'réponse' in criterion.get('text', '').lower() or len(criterion.get('content', '')) > 100:
                    content = criterion.get('content', '')
                    if content and not content.startswith('['):
                        new_criteria.append({
                            "id": "cl2",
                            "text": "Réponse type du candidat",
                            "content": content
                        })
                        break
        
        elif has_cl2 and not has_cl1:
            # On a la réponse mais pas la question
            # Chercher dans les anciens critères
            for criterion in cloture_section['criteria']:
                if 'question' in criterion.get('text', '').lower() or 'défi' in criterion.get('text', '').lower():
                    content = criterion.get('content', criterion.get('patientComment', ''))
                    if content:
                        if not content.startswith('['):
                            content = f"[{content}]"
                        new_criteria.insert(0, {
                            "id": "cl1",
                            "text": "Questions difficiles à poser",
                            "content": content
                        })
                        break
        
        # Limiter à 2 critères (cl1 et cl2)
        final_criteria = []
        for id_type in ['cl1', 'cl2']:
            for c in new_criteria:
                if c['id'] == id_type and len(final_criteria) < 2:
                    # S'assurer que l'id n'est pas déjà présent
                    if not any(fc['id'] == id_type for fc in final_criteria):
                        final_criteria.append(c)
                    break
        
        cloture_section['criteria'] = final_criteria
    
    return cloture_section

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    changes = []
    
    # Traiter la section cloture
    if 'cloture' in data:
        original = json.dumps(data['cloture'], ensure_ascii=False)
        data['cloture'] = standardize_cloture_section(data['cloture'])
        new = json.dumps(data['cloture'], ensure_ascii=False)
        
        if original != new:
            modified = True
            # Décrire les changements
            if 'criteria' in data['cloture']:
                for c in data['cloture']['criteria']:
                    changes.append(f"{c['id']}: {c['text']}")
    
    # Vérifier aussi dans les sections (au cas où)
    if 'sections' in data and 'cloture' in data['sections']:
        original = json.dumps(data['sections']['cloture'], ensure_ascii=False)
        data['sections']['cloture'] = standardize_cloture_section(data['sections']['cloture'])
        new = json.dumps(data['sections']['cloture'], ensure_ascii=False)
        
        if original != new:
            modified = True
            if 'criteria' in data['sections']['cloture']:
                for c in data['sections']['cloture']['criteria']:
                    changes.append(f"{c['id']}: {c['text']}")
    
    return data, modified, changes

def main():
    # Dossier contenant les fichiers JSON USMLE
    json_dir = Path("json_files/USMLE")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    modified_files = 0
    files_with_both = 0
    files_with_question_only = 0
    files_with_response_only = 0
    files_without_cloture = 0
    
    print("Standardisation des sections 'cloture' des fichiers USMLE...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, changes = process_file(json_file)
        
        # Vérifier le contenu de la section cloture
        cloture = data.get('cloture', data.get('sections', {}).get('cloture'))
        
        if not cloture:
            files_without_cloture += 1
        else:
            has_cl1 = False
            has_cl2 = False
            
            for c in cloture.get('criteria', []):
                if c.get('id') == 'cl1':
                    has_cl1 = True
                elif c.get('id') == 'cl2':
                    has_cl2 = True
            
            if has_cl1 and has_cl2:
                files_with_both += 1
            elif has_cl1:
                files_with_question_only += 1
            elif has_cl2:
                files_with_response_only += 1
        
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
    print("RÉSUMÉ DE LA STANDARDISATION")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    print(f"\n📈 État des sections cloture :")
    print(f"   - Avec les deux éléments (cl1 + cl2) : {files_with_both}")
    print(f"   - Question seulement (cl1) : {files_with_question_only}")
    print(f"   - Réponse seulement (cl2) : {files_with_response_only}")
    print(f"   - Sans section cloture : {files_without_cloture}")
    
    print(f"\n✅ Standardisation terminée !")
    print("Structure appliquée :")
    print("  • cl1: Questions difficiles à poser [entre crochets]")
    print("  • cl2: Réponse type du candidat")

if __name__ == "__main__":
    main()