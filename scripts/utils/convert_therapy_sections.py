#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re
import glob

def parse_content_to_items(content):
    """
    Convertit le contenu texte en liste d'items structurés
    avec treatment, details et duration
    """
    items = []
    
    # Nettoyer le contenu
    content = content.strip()
    
    # Diviser le contenu par lignes
    lines = content.split('\n')
    
    current_treatment = None
    current_details = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Retirer les puces
        line = re.sub(r'^[•\-]\s*', '', line)
        
        # Détecter si c'est un traitement principal (contient : ou des parenthèses de dosage)
        if ':' in line:
            # Si on avait un traitement en cours, l'ajouter
            if current_treatment:
                items.append(format_treatment_item(current_treatment, current_details))
            
            # Nouveau traitement
            parts = line.split(':', 1)
            current_treatment = parts[0].strip()
            current_details = [parts[1].strip()] if len(parts) > 1 and parts[1].strip() else []
            
        elif re.search(r'\d+\s*mg|\d+\s*g|\d+\s*ml|dose|bolus|IV|PO|IM|SC', line, re.IGNORECASE):
            # C'est probablement un nouveau traitement avec dosage
            if current_treatment:
                items.append(format_treatment_item(current_treatment, current_details))
            
            current_treatment = extract_treatment_name(line)
            current_details = [extract_treatment_details(line)]
            
        elif line.startswith('-') or line.startswith('•'):
            # C'est un sous-élément
            if current_treatment:
                current_details.append(line.lstrip('- •').strip())
            else:
                # C'est un traitement autonome
                current_treatment = line.lstrip('- •').strip()
                current_details = []
        else:
            # C'est soit un détail supplémentaire, soit un nouveau traitement
            if current_treatment and len(line) < 50:
                # Probablement un nouveau traitement court
                items.append(format_treatment_item(current_treatment, current_details))
                current_treatment = line
                current_details = []
            else:
                # C'est un détail
                current_details.append(line)
    
    # Ajouter le dernier traitement
    if current_treatment:
        items.append(format_treatment_item(current_treatment, current_details))
    
    # Si aucun item n'a été créé, créer un item unique avec tout le contenu
    if not items and content:
        items.append({
            "treatment": "Prise en charge",
            "details": content.replace('\\n', ' ').replace('•', ',').strip(),
            "duration": "Selon évolution clinique"
        })
    
    return items

def extract_treatment_name(line):
    """
    Extrait le nom du traitement d'une ligne
    """
    # Retirer les dosages et voies d'administration
    name = re.sub(r'\d+\s*(mg|g|ml|UI|µg|mcg).*', '', line)
    name = re.sub(r'\s*(IV|PO|IM|SC|×|x).*', '', name)
    name = re.sub(r'\s*[\(\[].*?[\)\]]', '', name)
    return name.strip()

def extract_treatment_details(line):
    """
    Extrait les détails (dosage, voie) d'une ligne
    """
    # Chercher les patterns de dosage
    dosage_match = re.search(r'(\d+\s*(mg|g|ml|UI|µg|mcg)[^,\n]*)', line)
    if dosage_match:
        return dosage_match.group(0).strip()
    return line

def extract_duration(details_list):
    """
    Extrait la durée du traitement des détails
    """
    duration_keywords = ['jour', 'semaine', 'mois', 'h', 'heures', 'min', 'durée', 'pendant', 'jusqu']
    
    for detail in details_list:
        for keyword in duration_keywords:
            if keyword in detail.lower():
                return detail
    
    # Durées par défaut selon le contexte
    combined = ' '.join(details_list).lower()
    if 'aigu' in combined or 'urgence' in combined:
        return "Traitement immédiat"
    elif 'chronique' in combined:
        return "Traitement au long cours"
    elif 'antibio' in combined or 'anti-infect' in combined:
        return "5-7 jours selon évolution"
    elif 'chirurg' in combined or 'opérat' in combined:
        return "Intervention programmée"
    else:
        return "Selon réponse clinique"

def format_treatment_item(treatment, details_list):
    """
    Formate un item de traitement
    """
    # Extraire la durée des détails
    duration = None
    remaining_details = []
    
    for detail in details_list:
        if any(keyword in detail.lower() for keyword in ['jour', 'semaine', 'mois', 'durée', 'pendant']):
            duration = detail
        else:
            remaining_details.append(detail)
    
    if not duration:
        duration = extract_duration(details_list)
    
    # Formater les détails restants
    details_text = ' ; '.join(remaining_details) if remaining_details else ""
    
    # Nettoyer le nom du traitement
    treatment = treatment.strip(':').strip()
    
    return {
        "treatment": treatment,
        "details": details_text,
        "duration": duration
    }

def convert_therapy_section(therapy_section):
    """
    Convertit une therapySection de l'ancien format au nouveau format
    """
    if not therapy_section or 'categories' not in therapy_section:
        return therapy_section
    
    new_categories = []
    
    for category in therapy_section['categories']:
        # Récupérer le titre (pathologie)
        title = category.get('title', category.get('name', 'Prise en charge'))
        
        # Si il y a déjà des items, les garder
        if 'items' in category and category['items']:
            new_categories.append({
                "title": title,
                "items": category['items']
            })
        # Sinon, convertir le content en items
        elif 'content' in category:
            items = parse_content_to_items(category['content'])
            new_categories.append({
                "title": title,
                "items": items
            })
        else:
            # Catégorie vide
            new_categories.append({
                "title": title,
                "items": []
            })
    
    return {"categories": new_categories}

def process_json_file(filepath):
    """
    Traite un fichier JSON pour convertir les therapySection
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    # Parcourir toutes les sections
    for section_name, section_content in data.get('sections', {}).items():
        for criterion in section_content.get('criteria', []):
            if 'therapySection' in criterion:
                old_therapy = criterion['therapySection']
                new_therapy = convert_therapy_section(old_therapy)
                if old_therapy != new_therapy:
                    criterion['therapySection'] = new_therapy
                    modified = True
    
    return data, modified

def main():
    # Traiter tous les fichiers AMBOSS
    amboss_files = glob.glob('json_files/AMBOSS/*.json')
    
    modified_count = 0
    
    for filepath in amboss_files:
        filename = os.path.basename(filepath)
        try:
            data, modified = process_json_file(filepath)
            if modified:
                # Sauvegarder le fichier
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f'✅ Converti : {filename}')
                modified_count += 1
            else:
                print(f'⏭️  Déjà OK : {filename}')
        except Exception as e:
            print(f'❌ Erreur avec {filename}: {e}')
    
    print(f'\n📊 Résumé : {modified_count} fichiers convertis sur {len(amboss_files)}')

if __name__ == '__main__':
    main()