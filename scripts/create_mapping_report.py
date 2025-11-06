#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour créer un rapport détaillé des mappings de l'harmonisation ECOS
"""

import pandas as pd
import json
from datetime import datetime
from collections import Counter

def analyze_harmonization_mappings(harmonized_file):
    """Analyse les mappings d'harmonisation et génère un rapport détaillé"""

    print("📊 Analyse des mappings d'harmonisation ECOS")
    print("=" * 60)

    # Charger le fichier harmonisé
    df = pd.read_csv(harmonized_file, sep=';', encoding='utf-8')

    # Créer un dictionnaire pour stocker tous les mappings
    mappings = {
        'diagnostic_principal': {},
        'diagnostic_générique': {},
        'ssp': {}
    }

    # Analyser les mappings de diagnostic principal
    for _, row in df.iterrows():
        orig = row['Diagnostic principal']
        harm = row['Diagnostic principal harmonisé']
        if pd.notna(orig) and pd.notna(harm) and orig != harm:
            if orig not in mappings['diagnostic_principal']:
                mappings['diagnostic_principal'][orig] = harm

    # Analyser les mappings de diagnostic générique
    for _, row in df.iterrows():
        orig = row['Diagnostic générique']
        harm = row['Diagnostic générique harmonisé']
        if pd.notna(orig) and pd.notna(harm) and orig != harm:
            if orig not in mappings['diagnostic_générique']:
                mappings['diagnostic_générique'][orig] = harm

    # Analyser les mappings SSP
    for _, row in df.iterrows():
        orig = row['SSP']
        harm = row['SSP harmonisé']
        if pd.notna(orig) and pd.notna(harm) and orig != harm:
            if orig not in mappings['ssp']:
                mappings['ssp'][orig] = harm

    # Générer le rapport
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = f'/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Mapping_Report_{timestamp}.txt'

    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("RAPPORT DÉTAILLÉ DES MAPPINGS D'HARMONISATION ECOS\n")
        f.write(f"Date de génération: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")

        # Section 1: Statistiques générales
        f.write("📊 STATISTIQUES GÉNÉRALES\n")
        f.write("-" * 40 + "\n")
        f.write(f"Total de lignes analysées: {len(df)}\n")
        f.write(f"Mappings de diagnostic principal: {len(mappings['diagnostic_principal'])}\n")
        f.write(f"Mappings de diagnostic générique: {len(mappings['diagnostic_générique'])}\n")
        f.write(f"Mappings de SSP: {len(mappings['ssp'])}\n\n")

        # Section 2: Mappings de diagnostic principal
        f.write("🏥 MAPPINGS DE DIAGNOSTIC PRINCIPAL\n")
        f.write("-" * 40 + "\n")
        if mappings['diagnostic_principal']:
            for orig, harm in sorted(mappings['diagnostic_principal'].items()):
                count = len(df[df['Diagnostic principal'] == orig])
                f.write(f"  '{orig}' → '{harm}' ({count} occurrences)\n")
        else:
            f.write("  Aucun mapping détecté (toutes les valeurs sont déjà harmonisées)\n")
        f.write("\n")

        # Section 3: Mappings de diagnostic générique
        f.write("📋 MAPPINGS DE DIAGNOSTIC GÉNÉRIQUE\n")
        f.write("-" * 40 + "\n")
        if mappings['diagnostic_générique']:
            for orig, harm in sorted(mappings['diagnostic_générique'].items()):
                count = len(df[df['Diagnostic générique'] == orig])
                f.write(f"  '{orig}' → '{harm}' ({count} occurrences)\n")
        else:
            f.write("  Aucun mapping détecté (toutes les valeurs sont déjà harmonisées)\n")
        f.write("\n")

        # Section 4: Mappings de SSP
        f.write("🔍 MAPPINGS DE SSP (Symptômes et Signes Principaux)\n")
        f.write("-" * 40 + "\n")
        if mappings['ssp']:
            for orig, harm in sorted(mappings['ssp'].items()):
                count = len(df[df['SSP'] == orig])
                f.write(f"  '{orig}' → '{harm}' ({count} occurrences)\n")
        else:
            f.write("  Aucun mapping détecté (toutes les valeurs sont déjà harmonisées)\n")
        f.write("\n")

        # Section 5: Analyse des groupes thématiques
        f.write("📂 RÉPARTITION DES GROUPES THÉMATIQUES\n")
        f.write("-" * 40 + "\n")
        theme_counts = df['Groupe_Thematique'].value_counts()
        for theme, count in theme_counts.items():
            percentage = (count / len(df)) * 100
            f.write(f"  {theme}: {count} cas ({percentage:.1f}%)\n")
        f.write("\n")

        # Section 6: Codes ICD-10 assignés
        f.write("🔢 CODES ICD-10 ASSIGNÉS\n")
        f.write("-" * 40 + "\n")
        icd_codes = df[df['Code_ICD10'].notna()]['Code_ICD10'].value_counts()
        if not icd_codes.empty:
            for code, count in icd_codes.head(20).items():
                diag = df[df['Code_ICD10'] == code]['Diagnostic principal harmonisé'].iloc[0]
                f.write(f"  {code}: {diag} ({count} cas)\n")
        else:
            f.write("  Aucun code ICD-10 assigné\n")
        f.write("\n")

        # Section 7: Doublons détectés
        f.write("🔄 DOUBLONS POTENTIELS DÉTECTÉS\n")
        f.write("-" * 40 + "\n")
        duplicates = df[df['Est_Doublon'] == True]
        if not duplicates.empty:
            for _, dup in duplicates.iterrows():
                f.write(f"  Année {dup['Année']}: {dup['Diagnostic principal harmonisé']}\n")
        else:
            f.write("  Aucun doublon détecté\n")
        f.write("\n")

        # Section 8: Transformations typographiques
        f.write("✏️ EXEMPLES DE TRANSFORMATIONS TYPOGRAPHIQUES\n")
        f.write("-" * 40 + "\n")

        # Détecter les changements de casse
        case_changes = []
        for _, row in df.iterrows():
            orig = row['Diagnostic principal']
            harm = row['Diagnostic principal harmonisé']
            if pd.notna(orig) and pd.notna(harm):
                if orig.lower() == harm.lower() and orig != harm:
                    case_changes.append((orig, harm))

        if case_changes:
            for orig, harm in case_changes[:10]:  # Limiter à 10 exemples
                f.write(f"  '{orig}' → '{harm}' (changement de casse)\n")
        else:
            f.write("  Aucun changement de casse détecté\n")
        f.write("\n")

        # Section 9: Résumé des améliorations
        f.write("✨ RÉSUMÉ DES AMÉLIORATIONS\n")
        f.write("-" * 40 + "\n")
        f.write("  ✓ Harmonisation des variations de diagnostic (ex: HTA/HTA nouvelle → HTA)\n")
        f.write("  ✓ Standardisation de la casse (première lettre en majuscule)\n")
        f.write("  ✓ Suppression des espaces superflus\n")
        f.write("  ✓ Regroupement thématique des cas\n")
        f.write("  ✓ Attribution de codes ICD-10 standards\n")
        f.write("  ✓ Détection des doublons potentiels\n")
        f.write("  ✓ Harmonisation des symptômes et signes principaux (SSP)\n")

        f.write("\n" + "=" * 80 + "\n")
        f.write("FIN DU RAPPORT\n")
        f.write("=" * 80 + "\n")

    # Créer aussi un fichier JSON avec les mappings
    json_file = f'/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Mappings_{timestamp}.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(mappings, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Rapport de mapping créé: {report_file}")
    print(f"✅ Fichier JSON des mappings: {json_file}")

    # Afficher un résumé dans la console
    print("\n📊 Résumé des mappings:")
    print(f"  - Diagnostics principaux harmonisés: {len(mappings['diagnostic_principal'])}")
    print(f"  - Diagnostics génériques harmonisés: {len(mappings['diagnostic_générique'])}")
    print(f"  - SSP harmonisés: {len(mappings['ssp'])}")

    return report_file, json_file


if __name__ == "__main__":
    # Utiliser le fichier harmonisé le plus récent
    harmonized_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Harmonise_20251024_154128.csv"

    report_file, json_file = analyze_harmonization_mappings(harmonized_file)

    print("\n✨ Analyse terminée avec succès!")