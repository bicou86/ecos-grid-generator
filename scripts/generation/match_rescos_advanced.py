#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script amélioré pour matcher les fichiers feuille-porte RESCOS restants
en utilisant des méthodes de matching plus flexibles
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
        'grossesse', 'enceinte', 'accouchement'
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

def find_best_match(fp_info, rescos_candidates):
    """Trouve la meilleure correspondance pour un fichier feuille-porte"""
    best_match = None
    best_score = 0
    
    fp_desc = fp_info['description']
    fp_normalized = normalize_text(fp_desc)
    fp_key_info = extract_key_info(fp_desc)
    
    for rescos_name, rescos_info in rescos_candidates.items():
        score = 0
        rescos_patient = rescos_info['patient']
        rescos_normalized = normalize_text(rescos_patient)
        rescos_key_info = extract_key_info(rescos_patient)
        
        # Score de similarité textuelle
        text_score = similarity_score(fp_normalized, rescos_normalized)
        score += text_score * 50
        
        # Bonus si même âge
        if fp_key_info.get('age') and rescos_key_info.get('age'):
            if fp_key_info['age'] == rescos_key_info['age']:
                score += 20
        
        # Bonus si même nom
        if fp_key_info.get('name') and rescos_key_info.get('name'):
            if fp_key_info['name'] == rescos_key_info['name']:
                score += 15
        
        # Bonus pour symptômes communs
        fp_symptoms = set(fp_key_info.get('symptoms', []))
        rescos_symptoms = set(rescos_key_info.get('symptoms', []))
        if fp_symptoms and rescos_symptoms:
            common_symptoms = fp_symptoms & rescos_symptoms
            score += len(common_symptoms) * 10
        
        # Mise à jour du meilleur match
        if score > best_score:
            best_score = score
            best_match = rescos_name
    
    # Retourner le match seulement si le score est suffisant
    return best_match if best_score > 30 else None

def main():
    print("Matching avancé des fichiers feuille-porte RESCOS restants...")
    print("=" * 80)
    
    # Charger les fichiers déjà matchés
    fp_dir = Path("json_files/json_feuille-porte/RESCOS")
    main_dir = Path("json_files/RESCOS")
    
    # Lister les fichiers déjà traités (commençant par RESCOS-)
    already_matched = [f.name for f in fp_dir.glob("RESCOS-*.json")]
    
    # Charger les fichiers RESCOS principaux
    rescos_data = {}
    for json_file in main_dir.glob("*.json"):
        if "Station double" in json_file.name:
            continue
        
        # Vérifier si ce fichier a déjà une feuille-porte
        fp_name = json_file.stem + ".json"
        if fp_name in already_matched:
            continue
            
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        patient = ""
        if 'context' in data and 'patient' in data['context']:
            patient = data['context']['patient']
        
        rescos_data[json_file.stem] = {
            'patient': patient,
            'file_path': json_file
        }
    
    # Charger les fichiers feuille-porte non matchés
    fp_unmatched = {}
    for json_file in fp_dir.glob("*.json"):
        # Ignorer les fichiers déjà traités
        if json_file.name.startswith("RESCOS-"):
            continue
            
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        fp_unmatched[json_file.name] = {
            'description': data.get('description', ''),
            'file_path': json_file,
            'data': data
        }
    
    print(f"\n📁 Fichiers à traiter:")
    print(f"  - {len(fp_unmatched)} feuilles-porte non matchées")
    print(f"  - {len(rescos_data)} fichiers RESCOS sans feuille-porte")
    
    if not fp_unmatched:
        print("\n✅ Tous les fichiers sont déjà matchés!")
        return
    
    # Essayer de matcher les fichiers restants
    print("\n🔍 Recherche avancée de correspondances...")
    new_matches = []
    
    for fp_name, fp_info in fp_unmatched.items():
        best_match = find_best_match(fp_info, rescos_data)
        
        if best_match:
            new_matches.append({
                'fp_file': fp_name,
                'rescos_file': best_match,
                'fp_path': fp_info['file_path'],
                'fp_data': fp_info['data'],
                'description': fp_info['description'],
                'patient': rescos_data[best_match]['patient']
            })
            # Retirer du pool pour éviter les doublons
            del rescos_data[best_match]
    
    print(f"  - {len(new_matches)} nouvelles correspondances trouvées")
    
    # Afficher les correspondances trouvées
    if new_matches:
        print("\n📋 Nouvelles correspondances:")
        for match in new_matches[:10]:
            print(f"  • {match['fp_file'][:30]}...")
            print(f"    → {match['rescos_file'][:50]}...")
            print(f"    Description: {match['description'][:60]}...")
            print(f"    Patient: {match['patient'][:60]}...")
            print()
    
    # Appliquer les modifications
    if new_matches:
        print("\n📝 Application des modifications...")
        for match in new_matches:
            try:
                old_path = match['fp_path']
                new_name = match['rescos_file'] + '.json'
                new_path = old_path.parent / new_name
                
                # Mettre à jour le titre
                match['fp_data']['titre'] = match['rescos_file']
                
                # Sauvegarder avec le nouveau titre
                with open(old_path, 'w', encoding='utf-8') as f:
                    json.dump(match['fp_data'], f, ensure_ascii=False, indent=2)
                
                # Renommer le fichier
                if old_path != new_path:
                    if new_path.exists():
                        new_path.unlink()
                    old_path.rename(new_path)
                    print(f"✅ Renommé: {match['fp_file']}")
                    print(f"   → {new_name}")
                    
            except Exception as e:
                print(f"❌ Erreur avec {match['fp_file']}: {str(e)}")
    
    # Afficher les fichiers toujours non matchés
    still_unmatched = []
    for json_file in fp_dir.glob("*.json"):
        if not json_file.name.startswith("RESCOS-"):
            still_unmatched.append(json_file.name)
    
    if still_unmatched:
        print(f"\n⚠️ Fichiers toujours non matchés ({len(still_unmatched)}):")
        for fp in still_unmatched[:10]:
            print(f"  - {fp}")
        if len(still_unmatched) > 10:
            print(f"  ... et {len(still_unmatched) - 10} autres")
    
    # Résumé final
    print("\n" + "=" * 80)
    print("RÉSUMÉ DU MATCHING AVANCÉ")
    print("=" * 80)
    print(f"✅ Nouvelles correspondances trouvées : {len(new_matches)}")
    print(f"⚠️  Fichiers toujours non matchés : {len(still_unmatched)}")

if __name__ == "__main__":
    main()