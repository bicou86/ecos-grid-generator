#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour matcher et renommer les fichiers feuille-porte German
en comparant les descriptions avec les patients des fichiers principaux
"""

import json
from pathlib import Path
import re
from difflib import SequenceMatcher

def normalize_text(text):
    """Normalise le texte pour la comparaison"""
    if not text:
        return ""
    # Enlever les espaces multiples, ponctuation finale, et normaliser
    text = re.sub(r'\s+', ' ', text.strip())
    text = text.rstrip('.,;:')
    # Enlever les articles
    text = re.sub(r'\b(le|la|les|un|une|des|de|du|à|au|aux)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+', ' ', text.strip())
    return text.lower()

def extract_key_info(text):
    """Extrait les informations clés (nom, âge, symptômes)"""
    info = {}
    
    # Extraire l'âge
    age_match = re.search(r'(\d+)\s*ans', text)
    if age_match:
        info['age'] = age_match.group(1)
    
    # Extraire le nom
    name_patterns = [
        r'M(?:me|lle|onsieur|r\.?)\s+([A-Z][a-zéèêàù]+)',
        r'([A-Z][a-zéèêàù]+),\s*\d+\s*ans',
    ]
    for pattern in name_patterns:
        name_match = re.search(pattern, text)
        if name_match:
            info['name'] = name_match.group(1).lower()
            break
    
    # Extraire les symptômes clés
    symptoms = []
    symptom_keywords = [
        'douleur', 'fièvre', 'toux', 'dyspnée', 'fatigue', 'malaise',
        'céphalée', 'vomissement', 'diarrhée', 'dysurie', 'hématurie',
        'thoracique', 'abdominale', 'lombaire', 'pelvienne',
        'grossesse', 'enceinte', 'accouchement', 'épaule', 'genou',
        'poignet', 'talon', 'jambes', 'hanche', 'coude', 'oreille',
        'constipation', 'acouphène', 'anxiété', 'bouffées', 'bradycardie',
        'chute', 'dysphagie', 'dyspnée', 'énurésie', 'épilepsie',
        'éruption', 'érythème', 'gonflement', 'hémoptysie', 'hypertension',
        'ictère', 'incontinence', 'malaise', 'masse', 'ménopause',
        'obésité', 'otorrhée', 'palpitations', 'perte', 'pleurs',
        'pollakiurie', 'retard', 'saignement', 'tachycardie', 'tremblement',
        'troubles', 'voyage', 'yeux'
    ]
    text_lower = text.lower()
    for keyword in symptom_keywords:
        if keyword in text_lower:
            symptoms.append(keyword)
    info['symptoms'] = symptoms
    
    return info

def similarity_score(text1, text2):
    """Calcule un score de similarité entre deux textes"""
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, text1, text2).ratio()

def find_best_match(fp_info, german_candidates):
    """Trouve la meilleure correspondance pour un fichier feuille-porte"""
    best_match = None
    best_score = 0
    
    fp_desc = fp_info['description']
    fp_normalized = normalize_text(fp_desc)
    fp_key_info = extract_key_info(fp_desc)
    
    for german_name, german_info in german_candidates.items():
        score = 0
        german_patient = german_info['patient']
        german_normalized = normalize_text(german_patient)
        german_key_info = extract_key_info(german_patient)
        
        # Score de similarité textuelle
        text_score = similarity_score(fp_normalized, german_normalized)
        score += text_score * 50
        
        # Bonus si même âge
        if fp_key_info.get('age') and german_key_info.get('age'):
            if fp_key_info['age'] == german_key_info['age']:
                score += 20
        
        # Bonus si même nom
        if fp_key_info.get('name') and german_key_info.get('name'):
            if fp_key_info['name'] == german_key_info['name']:
                score += 15
        
        # Bonus pour symptômes communs
        fp_symptoms = set(fp_key_info.get('symptoms', []))
        german_symptoms = set(german_key_info.get('symptoms', []))
        if fp_symptoms and german_symptoms:
            common_symptoms = fp_symptoms & german_symptoms
            score += len(common_symptoms) * 10
        
        # Mise à jour du meilleur match
        if score > best_score:
            best_score = score
            best_match = german_name
    
    # Retourner le match seulement si le score est suffisant
    return best_match if best_score > 25 else None

def main():
    print("Matching et renommage des fichiers feuille-porte German...")
    print("=" * 80)
    
    # Dossiers
    fp_dir = Path("json_files/json_feuille-porte/German")
    main_dir = Path("json_files/German")
    
    # Charger les fichiers German principaux
    german_data = {}
    for json_file in main_dir.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraire le patient depuis context
        patient = ""
        if 'context' in data and 'patient' in data['context']:
            patient = data['context']['patient']
        
        german_data[json_file.stem] = {
            'patient': patient,
            'file_path': json_file
        }
    
    print(f"📁 {len(german_data)} fichiers German principaux trouvés")
    
    # Charger les fichiers feuille-porte
    fp_files = {}
    for json_file in fp_dir.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        fp_files[json_file.name] = {
            'description': data.get('description', ''),
            'file_path': json_file,
            'data': data
        }
    
    print(f"📁 {len(fp_files)} fichiers feuille-porte trouvés")
    
    # Matcher les fichiers
    matches = []
    unmatched_fp = []
    
    for fp_name, fp_info in fp_files.items():
        best_match = find_best_match(fp_info, german_data)
        
        if best_match:
            matches.append({
                'fp_file': fp_name,
                'german_file': best_match,
                'fp_path': fp_info['file_path'],
                'fp_data': fp_info['data'],
                'description': fp_info['description'],
                'patient': german_data[best_match]['patient']
            })
            # Retirer du pool pour éviter les doublons
            del german_data[best_match]
        else:
            unmatched_fp.append(fp_name)
    
    print(f"\n📋 Résultats du matching:")
    print(f"  - {len(matches)} correspondances trouvées")
    print(f"  - {len(unmatched_fp)} feuilles-porte non matchées")
    
    # Afficher quelques exemples de correspondances
    if matches:
        print("\n📋 Exemples de correspondances trouvées:")
        for match in matches[:5]:
            print(f"  • {match['fp_file'][:40]}...")
            print(f"    → {match['german_file'][:50]}...")
    
    # Afficher les non-matchés
    if unmatched_fp:
        print(f"\n⚠️ Fichiers non matchés ({len(unmatched_fp)}):")
        for fp in unmatched_fp[:10]:
            print(f"  - {fp}")
            if len(unmatched_fp) > 10:
                print(f"  ... et {len(unmatched_fp) - 10} autres")
                break
    
    # Renommer et mettre à jour les fichiers
    if matches:
        print("\n📝 Application des modifications...")
        renamed_count = 0
        errors = []
        
        for match in matches:
            try:
                old_path = match['fp_path']
                new_name = match['german_file'] + '.json'
                new_path = old_path.parent / new_name
                
                # Mettre à jour le titre dans les données
                match['fp_data']['titre'] = match['german_file']
                
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
                    renamed_count += 1
                else:
                    print(f"✅ Titre mis à jour: {match['fp_file']}")
                    renamed_count += 1
                    
            except Exception as e:
                errors.append(f"Erreur avec {match['fp_file']}: {str(e)}")
        
        if errors:
            print(f"\n❌ Erreurs rencontrées:")
            for error in errors:
                print(f"  - {error}")
    
    # Résumé final
    print("\n" + "=" * 80)
    print("RÉSUMÉ DU MATCHING GERMAN")
    print("=" * 80)
    print(f"📊 Total fichiers feuille-porte : {len(fp_files)}")
    print(f"✅ Fichiers matchés et renommés : {len(matches)}")
    print(f"⚠️  Fichiers non matchés : {len(unmatched_fp)}")
    
    if len(matches) == len(fp_files):
        print(f"\n✅ PARFAIT! Tous les fichiers feuille-porte German ont été matchés!")
    else:
        print(f"\n⚠️ {len(unmatched_fp)} fichier(s) feuille-porte n'ont pas pu être matchés")
        print("\nAnalyse des fichiers non matchés pour matching manuel...")
        
        # Essayer de suggérer des matches manuels
        if unmatched_fp and german_data:
            print("\nSuggestions de correspondances manuelles:")
            for fp in unmatched_fp[:5]:
                fp_info = fp_files[fp]
                print(f"\n  Feuille-porte: {fp}")
                print(f"  Description: {fp_info['description'][:60]}...")
                print(f"  Candidats German restants:")
                for german_name in list(german_data.keys())[:3]:
                    print(f"    - {german_name}: {german_data[german_name]['patient'][:50]}...")

if __name__ == "__main__":
    main()