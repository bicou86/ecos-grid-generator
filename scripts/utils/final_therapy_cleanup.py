#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script final pour nettoyer complètement les content des therapySection
"""

import json
import re
from pathlib import Path

def clean_therapy_content_line(line):
    """Nettoie une ligne de contenu"""
    line = line.strip()
    if not line:
        return line
    
    # Corrections spécifiques connues
    corrections = {
        "Natation et e  : xercices": "Natation et exercices",
        "Maintien de la posture et e  : xercices": "Maintien de la posture et exercices",
        "Plan d'action pour e  : xacerbations": "Plan d'action pour exacerbations",
        "Surveillance signes vitau  : x": "Surveillance signes vitaux",
        "Pas d'antivirau  : x": "Pas d'antiviraux",
        "Tau  : x": "Taux",
        "Convocation urgente pour e  : xamen": "Convocation urgente pour examen",
        "Éviter e  : xposition": "Éviter exposition",
        "Alimentation fractionnée, te  : xture": "Alimentation fractionnée, texture",
        "Activités portées  : ": "Activités portées",
        "PET scan pour bilan d'e  : xtension": "PET scan pour bilan d'extension",
        "Surveillance signes vitau": "Surveillance signes vitaux",
        "Pas d'antivirau": "Pas d'antiviraux sauf forme sévère",
        "Tau": "Taux guérison > 95% avec antiviraux action directe",
        "Cytoréduction ma": "Cytoréduction maximale",
        "Perte poids (": "Perte de poids",
        "Repos adapté malgré contraintes jumeau": "Repos adapté malgré contraintes jumeaux",
        "Perte de poids si  :": "Perte de poids si",
        "Hospitalisation si perte poids  5%": "Hospitalisation si perte poids > 5%",
        "Myomectomie si fibromes sous-muqueux ou  4cm": "Myomectomie si fibromes sous-muqueux ou > 4cm",
        "Groupe sanguin, RAI, commande CGR\n• Transfusion si Hb  : 7": "Groupe sanguin, RAI, commande CGR\n• Transfusion si Hb < 7",
        "Objectif : TA  90/60 mmHg, FC  100/min": "Objectif : TA > 90/60 mmHg, FC < 100/min",
        "Acide trane": "Acide tranexamique",
        "Sulfasalazine 2- : 3 g/j": "Sulfasalazine 2-3 g/j",
        "Amo : 2g IV ou": "Amoxicilline : 2g IV",
        "Dépistage régulier VIH, VHC si poursuite UD": "Dépistage régulier VIH, VHC si poursuite UDIV",
    }
    
    # Appliquer les corrections directes
    for wrong, correct in corrections.items():
        if wrong in line:
            line = line.replace(wrong, correct)
    
    # Nettoyer les patterns problématiques
    # Pattern: "X : X quelque chose" → "X : quelque chose"
    if ':' in line:
        parts = line.split(':', 1)
        if len(parts) == 2:
            before = parts[0].replace('•', '').strip()
            after = parts[1].strip()
            
            # Si répétition au début
            if after.startswith(before):
                after = after[len(before):].strip()
                if after.startswith(':'):
                    after = after[1:].strip()
                if after.startswith(';'):
                    after = after[1:].strip()
                line = parts[0] + (' : ' + after if after else '')
            
            # Si c'est juste une lettre ou fragment court après ":"
            elif len(after) <= 3 and not after.isdigit() and after not in ['IV', 'IM', 'PO', 'SC']:
                # Essayer de reconstruire ou supprimer
                if after in ['e', 'x']:
                    line = parts[0].rstrip()
                elif after == 'si':
                    line = parts[0] + ' si indiqué'
            
            # Nettoyer les doubles espaces avant ":"
            line = re.sub(r'\s+:', ':', line)
            line = re.sub(r':\s+', ': ', line)
    
    # Nettoyer les espaces multiples
    line = re.sub(r'\s+', ' ', line)
    
    # Supprimer les terminaisons incomplètes
    line = re.sub(r'\s+(et|ou|,)\s*$', '', line)
    
    # Nettoyer les caractères spéciaux
    line = re.sub(r'[<>{}\\]', '', line)
    
    return line

def clean_therapy_section_content(content):
    """Nettoie un content complet de therapySection"""
    lines = content.split('\n')
    cleaned_lines = []
    seen = set()
    
    for line in lines:
        cleaned = clean_therapy_content_line(line)
        
        # Éviter les doublons
        key = cleaned.lower().strip()
        if key and key not in seen:
            cleaned_lines.append(cleaned)
            seen.add(key)
        elif not key:
            cleaned_lines.append(cleaned)
    
    return '\n'.join(cleaned_lines)

def process_file(filepath):
    """Traite un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    changes = []
    
    # Parcourir les sections pour trouver les therapySection
    if 'sections' in data:
        for section_name, section in data['sections'].items():
            if 'criteria' in section:
                for criterion in section['criteria']:
                    if 'therapySection' in criterion:
                        ts = criterion['therapySection']
                        if 'categories' in ts:
                            for category in ts['categories']:
                                if 'content' in category and category['content']:
                                    original = category['content']
                                    cleaned = clean_therapy_section_content(original)
                                    
                                    if cleaned != original:
                                        category['content'] = cleaned
                                        modified = True
                                        changes.append({
                                            'section': section_name,
                                            'category': category.get('title', 'Sans titre')
                                        })
    
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
    
    print("Nettoyage final des therapySection...")
    print("=" * 80)
    
    # Traiter tous les fichiers JSON
    for json_file in sorted(json_dir.glob("*.json")):
        total_files += 1
        data, modified, changes = process_file(json_file)
        
        if modified:
            modified_files += 1
            print(f"\n✅ {json_file.name}")
            for change in changes:
                print(f"   - {change['section']}: {change['category']}")
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DU NETTOYAGE FINAL")
    print("=" * 80)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    
    print(f"\n✅ Nettoyage terminé !")

if __name__ == "__main__":
    main()