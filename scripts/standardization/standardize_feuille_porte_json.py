#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

def standardize_json_file(file_path):
    """
    Standardise un fichier JSON feuille-porte selon le format spécifié.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Structure standardisée de base
    standardized = {
        "titre": data.get("titre", ""),
        "contexte": data.get("contexte", ""),
        "description": data.get("description", "")
    }
    
    # Gérer les signes vitaux - seulement si présents
    if "signesVitaux" in data and data["signesVitaux"]:
        signes_vitaux = {}
        original_signes = data["signesVitaux"]
        
        # Mapping des clés standards avec les unités appropriées
        mapping = {
            "tensionArterielle": "mmHg",
            "ta": "mmHg",
            "temperature": "°C",
            "temp": "°C",
            "frequenceRespiratoire": "/min",
            "fr": "/min",
            "frequenceCardiaque": "bpm",
            "fc": "bpm",
            "imc": "kg/m²",
            "poids": "kg",
            "taille": "cm",
            "saturation": "%",
            "spo2": "%",
            "glycemie": "mmol/L"
        }
        
        # Normaliser les clés et unités
        for key, value in original_signes.items():
            # Normaliser la clé
            normalized_key = key
            if key == "ta":
                normalized_key = "tensionArterielle"
            elif key == "fc":
                normalized_key = "frequenceCardiaque"
            elif key == "fr":
                normalized_key = "frequenceRespiratoire"
            elif key == "temp":
                normalized_key = "temperature"
            elif key == "spo2":
                normalized_key = "saturation"
            
            # Vérifier et corriger les unités
            if value and isinstance(value, str):
                # Nettoyer la valeur
                value = value.strip()
                
                # Corriger les unités si nécessaire
                if normalized_key == "frequenceCardiaque":
                    # Remplacer /min par bpm pour la fréquence cardiaque
                    if "/min" in value:
                        value = value.replace("/min", "bpm")
                    elif not "bpm" in value and value[-1].isdigit():
                        value = value + " bpm"
                
                elif normalized_key == "frequenceRespiratoire":
                    # S'assurer que c'est /min pour la fréquence respiratoire
                    if "bpm" in value:
                        value = value.replace("bpm", "/min")
                    elif not "/min" in value and value[-1].isdigit():
                        value = value + "/min"
                
                elif normalized_key == "tensionArterielle":
                    # S'assurer que c'est mmHg pour la tension
                    if not "mmHg" in value and "/" in value:
                        value = value + " mmHg"
                
                elif normalized_key == "temperature":
                    # S'assurer que c'est °C pour la température
                    if not "°C" in value and value[-1].isdigit():
                        value = value + "°C"
                
                elif normalized_key == "imc":
                    # S'assurer que c'est kg/m² pour l'IMC
                    if not "kg/m²" in value and value[-1].isdigit():
                        value = value + " kg/m²"
                
                signes_vitaux[normalized_key] = value
        
        # Ajouter les signes vitaux seulement s'ils ne sont pas vides
        if signes_vitaux:
            standardized["signesVitaux"] = signes_vitaux
    
    # Gérer les tâches - toujours au pluriel
    if "taches" in data:
        standardized["taches"] = data["taches"]
    elif "tache" in data:
        # Corriger si c'est au singulier
        if isinstance(data["tache"], list):
            standardized["taches"] = data["tache"]
        else:
            standardized["taches"] = [data["tache"]]
    else:
        standardized["taches"] = []
    
    # Gérer la remarque - seulement si présente et non vide
    if "remarque" in data and data["remarque"]:
        standardized["remarque"] = data["remarque"]
    
    return standardized

def process_all_files():
    """
    Traite tous les fichiers JSON dans le dossier spécifié.
    """
    base_dir = Path("json_files/json_feuille-porte/Thieme")
    
    if not base_dir.exists():
        print(f"Erreur: Le dossier {base_dir} n'existe pas!")
        return
    
    json_files = list(base_dir.glob("*.json"))
    print(f"Trouvé {len(json_files)} fichiers JSON à traiter")
    
    success_count = 0
    error_count = 0
    errors = []
    
    for json_file in json_files:
        try:
            print(f"Traitement de: {json_file.name}")
            
            # Standardiser le fichier
            standardized_data = standardize_json_file(json_file)
            
            # Sauvegarder le fichier modifié
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(standardized_data, f, ensure_ascii=False, indent=2)
            
            success_count += 1
            
        except Exception as e:
            error_count += 1
            errors.append(f"{json_file.name}: {str(e)}")
            print(f"  ❌ Erreur: {str(e)}")
    
    # Rapport final
    print("\n" + "="*50)
    print(f"✅ Fichiers traités avec succès: {success_count}")
    print(f"❌ Fichiers avec erreurs: {error_count}")
    
    if errors:
        print("\nDétail des erreurs:")
        for error in errors:
            print(f"  - {error}")
    
    print(f"\nTotal: {success_count + error_count} fichiers traités")

if __name__ == "__main__":
    process_all_files()