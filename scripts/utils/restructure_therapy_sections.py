#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour restructurer correctement les therapySection des fichiers AMBOSS
en regroupant les traitements par pathologie/catégorie
"""

import json
import re
from pathlib import Path

def is_category_header(text):
    """Détermine si un texte est un header de catégorie"""
    # Patterns qui indiquent un nouveau groupe/catégorie
    category_patterns = [
        r'^Si\s+.*:?$',  # Si infection VPH, Si Chlamydia, etc.
        r'^Traitement\s+de\s+.*:?$',  # Traitement de la crise, etc.
        r'^Prise en charge\s+.*:?$',  # Prise en charge immédiate, etc.
        r'^Mesures?\s+.*:?$',  # Mesures générales, Mesure hygiéno-, etc.
        r'^Thérapie\s+.*:?$',  # Thérapie de...
        r'^Antibiothérapie\s+.*:?$',  # Antibiothérapie...
        r'^Traitement\s+chirurgical.*:?$',  # Traitement chirurgical
        r'^Traitement\s+conservateur.*:?$',  # Traitement conservateur
        r'^Suivi\s+.*:?$',  # Suivi post-opératoire, etc.
        r'^Prophylaxie\s+.*:?$',  # Prophylaxie...
        r'^Prévention\s+.*:?$',  # Prévention et conseils
        r'^Conseil\s+.*:?$',  # Conseil génétique, etc.
        r'^Hyperemesis\s+.*:?$',  # Hyperemesis gravidarum
        r'^Stabilisation\s+.*:?$',  # Stabilisation hémodynamique
        r'^Bilan\s+.*:?$',  # Bilan d'extension
        r'^Chimiothérapie\s+.*:?$',  # Chimiothérapie adjuvante
        r'^Approche\s+.*:?$',  # Approche thérapeutique
        r'^Traitement étiologique.*:?$',  # Traitement étiologique
    ]
    
    for pattern in category_patterns:
        if re.match(pattern, text.strip(), re.IGNORECASE):
            return True
    
    # Vérifier aussi si c'est une condition médicale (début avec diagnostic)
    medical_conditions = [
        'Cancer', 'Infection', 'Pneumonie', 'Appendicite', 'Cholécystite',
        'Grossesse', 'Nausées', 'Migraine', 'Céphalée', 'BPCO', 'Asthme',
        'Diabète', 'Hypertension', 'Fibromes', 'Endométriose', 'Hernie',
        'Pneumothorax', 'Embolie', 'AVC', 'Infarctus', 'Hémorragie',
        'Fracture', 'Entorse', 'Luxation', 'Tendinite', 'Arthrite',
        'Gastrite', 'Ulcère', 'Cirrhose', 'Hépatite', 'Pancréatite',
        'Cystite', 'Pyélonéphrite', 'Lithiase', 'Insuffisance',
        'Anémie', 'Leucémie', 'Lymphome', 'Thrombose', 'Varices'
    ]
    
    text_lower = text.lower()
    for condition in medical_conditions:
        if condition.lower() in text_lower:
            return True
    
    return False

def parse_therapy_items(items):
    """Parse une liste d'items pour identifier les catégories et leurs traitements"""
    categories = []
    current_category = None
    current_items = []
    
    for item in items:
        treatment = item.get('treatment', '')
        
        # Vérifier si c'est un header de catégorie
        if is_category_header(treatment):
            # Sauvegarder la catégorie précédente si elle existe
            if current_category and current_items:
                categories.append({
                    'title': current_category,
                    'items': current_items
                })
            
            # Nouvelle catégorie
            current_category = treatment.rstrip(':')
            current_items = []
        else:
            # C'est un traitement normal
            # Nettoyer les treatments mal découpés
            if treatment == "Ou do" or treatment == "Ou podophylloto":
                # Récupérer le texte complet depuis details
                details = item.get('details', '')
                if "doxycycline" in details.lower() or "100 mg × 2/j × 7j" in details:
                    treatment = "Doxycycline"
                elif "podophyllotoxine" in details.lower():
                    treatment = "Podophyllotoxine"
            elif treatment == "Ceftria":
                treatment = "Ceftriaxone"
            elif treatment == "PLUS azithromycine":
                treatment = "Azithromycine (association)"
            elif treatment and len(treatment) < 3 and not treatment.startswith("O2"):
                # Probablement un fragment, essayer de le reconstituer
                details = item.get('details', '')
                if details and len(details) > len(treatment):
                    # Utiliser les details comme base pour le treatment
                    treatment_words = details.split()
                    if treatment_words:
                        treatment = treatment_words[0]
            
            # Créer l'item nettoyé
            clean_item = {}
            
            # Treatment
            if treatment and not is_category_header(treatment):
                clean_item['treatment'] = treatment
            
            # Details
            details = item.get('details', '')
            duration = item.get('duration', '')
            
            # Ne pas dupliquer si details == treatment ou duration == treatment
            if details and details != treatment and details != duration:
                clean_item['details'] = details
            
            if duration and duration != treatment and duration != details and duration != "Selon réponse clinique":
                clean_item['duration'] = duration
            elif duration == "Selon réponse clinique" and not details:
                clean_item['duration'] = duration
            
            # Ajouter seulement si l'item a du contenu
            if clean_item and 'treatment' in clean_item:
                current_items.append(clean_item)
    
    # Ajouter la dernière catégorie
    if current_category and current_items:
        categories.append({
            'title': current_category,
            'items': current_items
        })
    
    # Si aucune catégorie n'a été trouvée, retourner la structure originale nettoyée
    if not categories and items:
        # Nettoyer les items sans catégories
        cleaned_items = []
        for item in items:
            if item.get('treatment') and not is_category_header(item.get('treatment', '')):
                cleaned_items.append(item)
        
        if cleaned_items:
            categories.append({
                'title': 'Prise en charge thérapeutique',
                'items': cleaned_items
            })
    
    return categories

def restructure_therapy_section(therapy_section):
    """Restructure une therapySection complète"""
    if not therapy_section or 'categories' not in therapy_section:
        return therapy_section
    
    new_categories = []
    
    for category in therapy_section['categories']:
        if 'items' in category and category['items']:
            # Parser les items pour identifier les vraies catégories
            parsed_categories = parse_therapy_items(category['items'])
            
            # Si on a trouvé plusieurs catégories, les utiliser
            if len(parsed_categories) > 1:
                new_categories.extend(parsed_categories)
            else:
                # Garder la structure existante mais nettoyer les items
                new_category = {
                    'title': category.get('title', 'Prise en charge thérapeutique'),
                    'items': []
                }
                
                for item in category.get('items', []):
                    treatment = item.get('treatment', '')
                    if treatment and not is_category_header(treatment):
                        new_category['items'].append(item)
                
                if new_category['items']:
                    new_categories.append(new_category)
    
    return {'categories': new_categories}

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
                for criterion_idx, criterion in enumerate(section['criteria']):
                    if 'therapySection' in criterion:
                        original_categories = len(criterion['therapySection'].get('categories', []))
                        
                        # Restructurer la therapySection
                        new_therapy_section = restructure_therapy_section(criterion['therapySection'])
                        
                        new_categories = len(new_therapy_section.get('categories', []))
                        
                        if new_categories != original_categories or new_therapy_section != criterion['therapySection']:
                            criterion['therapySection'] = new_therapy_section
                            modified = True
                            
                            changes.append(f"  Section '{section_name}', critère {criterion.get('text', 'N/A')}:")
                            changes.append(f"    • {original_categories} catégorie(s) → {new_categories} catégorie(s)")
                            
                            # Lister les nouvelles catégories
                            for cat in new_therapy_section.get('categories', []):
                                title = cat.get('title', 'Sans titre')
                                items_count = len(cat.get('items', []))
                                changes.append(f"      - {title}: {items_count} traitement(s)")
    
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
    total_categories_before = 0
    total_categories_after = 0
    
    print("Restructuration des therapySection dans les fichiers AMBOSS...")
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
                # Compter les catégories
                if "catégorie(s) →" in change:
                    numbers = re.findall(r'(\d+) catégorie', change)
                    if len(numbers) == 2:
                        total_categories_before += int(numbers[0])
                        total_categories_after += int(numbers[1])
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Afficher le résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ DE LA RESTRUCTURATION")
    print("=" * 70)
    print(f"📊 Fichiers traités : {total_files}")
    print(f"✏️  Fichiers modifiés : {modified_files}")
    print(f"📁 Catégories avant : {total_categories_before}")
    print(f"📁 Catégories après : {total_categories_after}")
    
    if modified_files == 0:
        print("\n✅ Toutes les therapySection sont déjà bien structurées !")
    else:
        print(f"\n✅ Restructuration terminée avec succès !")

if __name__ == "__main__":
    main()