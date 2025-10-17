#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour détecter et corriger les problèmes de cohérence dans les content des therapySection
"""

import json
import re
from pathlib import Path
from collections import defaultdict

def detect_issues_in_content(content):
    """Détecte les problèmes dans un content de therapySection"""
    issues = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Détecter les répétitions de type "X : X" ou similaires
        if ':' in line:
            parts = line.split(':', 1)
            if len(parts) == 2:
                before = parts[0].replace('•', '').strip()
                after = parts[1].strip()
                
                # Vérifier si le début est répété dans la suite
                if before and after.startswith(before):
                    issues.append({
                        'type': 'repetition',
                        'line': i,
                        'text': line,
                        'before': before,
                        'after': after
                    })
                
                # Vérifier les troncatures (texte très court après ":")
                if before and len(after) <= 3 and not after.isdigit():
                    issues.append({
                        'type': 'truncation',
                        'line': i,
                        'text': line,
                        'before': before,
                        'after': after
                    })
        
        # Détecter les doublons exacts de traitements
        if '•' in line:
            treatment = line.replace('•', '').strip()
            # Vérifier si le traitement apparaît plusieurs fois dans le même content
            count = content.count(treatment)
            if count > 1 and treatment not in [iss['text'] for iss in issues if iss['type'] == 'duplicate']:
                issues.append({
                    'type': 'duplicate',
                    'line': i,
                    'text': line,
                    'count': count
                })
        
        # Détecter les lignes incomplètes (se terminant par "et" ou "ou" ou ",")
        if re.search(r'\s+(et|ou|,)\s*$', line):
            issues.append({
                'type': 'incomplete',
                'line': i,
                'text': line
            })
        
        # Détecter les caractères spéciaux incorrects
        if re.search(r'[<>{}\\]', line):
            issues.append({
                'type': 'special_chars',
                'line': i,
                'text': line
            })
    
    return issues

def fix_content_issues(content):
    """Corrige automatiquement les problèmes détectés"""
    lines = content.split('\n')
    fixed_lines = []
    seen_treatments = set()
    
    for line in lines:
        original_line = line
        line = line.strip()
        
        if not line:
            fixed_lines.append(original_line)
            continue
        
        # Corriger les répétitions
        if ':' in line:
            parts = line.split(':', 1)
            if len(parts) == 2:
                before = parts[0].replace('•', '').strip()
                after = parts[1].strip()
                
                # Si répétition, garder seulement la partie après ":"
                if before and after.startswith(before):
                    # Enlever la répétition
                    after = after[len(before):].strip()
                    if after.startswith(':'):
                        after = after[1:].strip()
                    line = parts[0] + ' : ' + after
                
                # Si troncature probable, essayer de reconstruire
                elif before and len(after) <= 3 and not after.isdigit():
                    # Cas spécifiques connus
                    if before.lower().endswith('maintien de la posture') and after == 'e':
                        line = parts[0] + ' : exercices respiratoires'
                    elif before.lower().endswith('supplémentation fer') and after in ['si', 'en']:
                        line = parts[0] + ' si anémie'
                    # Sinon, enlever la partie tronquée
                    elif after in ['e', 'et', 'ou', 'si', 'en', 'de', 'à']:
                        line = parts[0].rstrip()
        
        # Supprimer les doublons exacts (garder seulement la première occurrence)
        treatment_key = line.replace('•', '').strip().lower()
        if treatment_key in seen_treatments:
            continue
        seen_treatments.add(treatment_key)
        
        # Nettoyer les lignes incomplètes
        line = re.sub(r'\s+(et|ou|,)\s*$', '', line)
        
        # Nettoyer les caractères spéciaux incorrects
        line = re.sub(r'[<>{}\\]', '', line)
        
        fixed_lines.append(line if line.startswith('•') else original_line.replace(original_line.strip(), line))
    
    return '\n'.join(fixed_lines)

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues_found = []
    fixes_applied = []
    modified = False
    
    # Parcourir les sections pour trouver les therapySection
    if 'sections' in data:
        for section_name, section in data['sections'].items():
            if 'criteria' in section:
                for criterion in section['criteria']:
                    if 'therapySection' in criterion:
                        ts = criterion['therapySection']
                        if 'categories' in ts:
                            for cat_idx, category in enumerate(ts['categories']):
                                if 'content' in category and category['content']:
                                    original_content = category['content']
                                    
                                    # Détecter les problèmes
                                    issues = detect_issues_in_content(original_content)
                                    
                                    if issues:
                                        issues_found.append({
                                            'section': section_name,
                                            'criterion': criterion.get('text', 'N/A'),
                                            'category': category.get('title', 'Sans titre'),
                                            'issues': issues
                                        })
                                        
                                        # Corriger automatiquement
                                        fixed_content = fix_content_issues(original_content)
                                        
                                        if fixed_content != original_content:
                                            category['content'] = fixed_content
                                            modified = True
                                            fixes_applied.append({
                                                'section': section_name,
                                                'category': category.get('title', 'Sans titre'),
                                                'changes': len([i for i in issues if i['type'] in ['repetition', 'truncation', 'duplicate']])
                                            })
    
    return data, modified, issues_found, fixes_applied

def main():
    # Dossier contenant les fichiers JSON AMBOSS
    json_dir = Path("json_files/AMBOSS")
    
    if not json_dir.exists():
        print(f"Erreur : Le dossier {json_dir} n'existe pas")
        return
    
    # Statistiques
    total_files = 0
    files_with_issues = 0
    total_issues = defaultdict(int)
    
    print("Vérification et correction des problèmes dans les therapySection...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, issues, fixes = process_file(json_file)
        
        if issues:
            files_with_issues += 1
            print(f"\n📝 {json_file.name}")
            
            for issue_group in issues:
                print(f"  Section: {issue_group['section']}")
                print(f"  Catégorie: {issue_group['category']}")
                
                for issue in issue_group['issues']:
                    total_issues[issue['type']] += 1
                    
                    if issue['type'] == 'repetition':
                        print(f"    ⚠️  Répétition détectée:")
                        print(f"       Avant: '{issue['before']}'")
                        print(f"       Après: '{issue['after']}'")
                    elif issue['type'] == 'truncation':
                        print(f"    ⚠️  Troncature détectée:")
                        print(f"       '{issue['text']}'")
                    elif issue['type'] == 'duplicate':
                        print(f"    ⚠️  Doublon détecté ({issue['count']} fois):")
                        print(f"       '{issue['text'][:60]}...'")
                    elif issue['type'] == 'incomplete':
                        print(f"    ⚠️  Ligne incomplète:")
                        print(f"       '{issue['text'][:60]}...'")
            
            if modified:
                print(f"  ✅ Corrections appliquées automatiquement")
                for fix in fixes:
                    print(f"     - {fix['category']}: {fix['changes']} correction(s)")
                
                # Sauvegarder le fichier modifié
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DE LA VÉRIFICATION")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"⚠️  Fichiers avec problèmes : {files_with_issues}")
    
    if total_issues:
        print(f"\n📈 Types de problèmes détectés :")
        for issue_type, count in sorted(total_issues.items(), key=lambda x: x[1], reverse=True):
            type_labels = {
                'repetition': 'Répétitions',
                'truncation': 'Troncatures',
                'duplicate': 'Doublons',
                'incomplete': 'Lignes incomplètes',
                'special_chars': 'Caractères spéciaux'
            }
            print(f"   - {type_labels.get(issue_type, issue_type)}: {count}")
    
    print(f"\n✅ Vérification et correction terminées !")

if __name__ == "__main__":
    main()