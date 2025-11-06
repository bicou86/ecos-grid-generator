#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de visualisation des données ECOS harmonisées
Génère des statistiques visuelles sous forme textuelle
"""

import pandas as pd
from collections import Counter
from datetime import datetime

def create_text_bar(value, max_value, bar_length=40):
    """Crée une barre de progression textuelle"""
    filled_length = int(bar_length * value / max_value)
    bar = '█' * filled_length + '░' * (bar_length - filled_length)
    return bar

def visualize_ecos_data(harmonized_file):
    """Analyse et visualise les données ECOS harmonisées"""

    print("\n" + "=" * 80)
    print("VISUALISATION DES DONNÉES ECOS HARMONISÉES")
    print("=" * 80 + "\n")

    # Charger les données
    df = pd.read_csv(harmonized_file, sep=';', encoding='utf-8')

    # 1. Distribution temporelle
    print("📅 DISTRIBUTION TEMPORELLE DES CAS")
    print("-" * 40)
    year_counts = df['Année'].value_counts().sort_index()
    max_count = year_counts.max()

    for year in sorted(year_counts.index):
        count = year_counts[year]
        bar = create_text_bar(count, max_count, 30)
        print(f"  {year}: {bar} {count:3d} cas")

    print(f"\n  Période couverte: {year_counts.index.min()} - {year_counts.index.max()}")
    print(f"  Total: {len(df)} cas sur {len(year_counts)} années")
    print(f"  Moyenne par année: {len(df) / len(year_counts):.1f} cas")

    # 2. Top 15 des diagnostics principaux
    print("\n🏥 TOP 15 DES DIAGNOSTICS PRINCIPAUX")
    print("-" * 40)
    diag_counts = df['Diagnostic principal harmonisé'].value_counts()
    max_diag = diag_counts.iloc[0] if not diag_counts.empty else 0

    for diag, count in diag_counts.head(15).items():
        if pd.notna(diag) and str(diag).lower() != 'nan':
            percentage = (count / len(df)) * 100
            bar = create_text_bar(count, max_diag, 20)
            # Tronquer le diagnostic s'il est trop long
            diag_short = str(diag)[:35] + "..." if len(str(diag)) > 35 else str(diag)
            print(f"  {bar} {count:3d} ({percentage:4.1f}%) {diag_short}")

    # 3. Distribution par catégorie
    print("\n📊 DISTRIBUTION PAR CATÉGORIE")
    print("-" * 40)
    if 'Catégorie' in df.columns:
        cat_counts = df['Catégorie'].value_counts()
        max_cat = cat_counts.iloc[0] if not cat_counts.empty else 0

        for cat, count in cat_counts.head(10).items():
            if pd.notna(cat):
                percentage = (count / len(df)) * 100
                bar = create_text_bar(count, max_cat, 25)
                print(f"  {cat:15s}: {bar} {count:3d} ({percentage:4.1f}%)")

    # 4. Groupes thématiques
    print("\n🎯 RÉPARTITION PAR GROUPE THÉMATIQUE")
    print("-" * 40)
    theme_counts = df['Groupe_Thematique'].value_counts()
    total = len(df)

    # Créer un graphique en secteurs textuel
    for theme, count in theme_counts.items():
        percentage = (count / total) * 100
        bar_length = int(percentage / 2)  # Ajuster pour que ça tienne sur une ligne
        bar = '█' * bar_length
        print(f"  {theme:25s} {bar} {percentage:5.1f}% ({count} cas)")

    # 5. Couverture ICD-10
    print("\n🔢 COUVERTURE ICD-10")
    print("-" * 40)
    icd_coverage = df['Code_ICD10'].notna().sum()
    icd_percentage = (icd_coverage / len(df)) * 100
    no_icd = len(df) - icd_coverage

    print(f"  Cas avec code ICD-10:     {icd_coverage:4d} ({icd_percentage:5.1f}%)")
    print(f"  Cas sans code ICD-10:     {no_icd:4d} ({100-icd_percentage:5.1f}%)")

    bar_with = '█' * int(icd_percentage/2.5)
    bar_without = '░' * int((100-icd_percentage)/2.5)
    print(f"  [{bar_with}{bar_without}]")

    # 6. Top 10 des symptômes (SSP)
    print("\n🔍 TOP 10 DES SYMPTÔMES ET SIGNES PRINCIPAUX")
    print("-" * 40)
    ssp_counts = df['SSP harmonisé'].value_counts()
    max_ssp = ssp_counts.iloc[0] if not ssp_counts.empty else 0

    for ssp, count in ssp_counts.head(10).items():
        if pd.notna(ssp) and str(ssp).strip():  # Ignorer les valeurs vides
            percentage = (count / len(df)) * 100
            bar = create_text_bar(count, max_ssp, 20)
            ssp_short = str(ssp)[:25] + "..." if len(str(ssp)) > 25 else str(ssp)
            print(f"  {bar} {count:3d} ({percentage:4.1f}%) {ssp_short}")

    # 7. Détection de doublons
    print("\n🔄 ANALYSE DES DOUBLONS")
    print("-" * 40)
    duplicates = df[df['Est_Doublon'] == True]
    dup_percentage = (len(duplicates) / len(df)) * 100

    print(f"  Doublons potentiels détectés: {len(duplicates)} ({dup_percentage:.1f}%)")
    if not duplicates.empty:
        print("  Exemples de doublons:")
        for _, dup in duplicates.head(5).iterrows():
            diag_short = str(dup['Diagnostic principal harmonisé'])[:50]
            print(f"    • Année {dup['Année']}: {diag_short}")

    # 8. Qualité des données
    print("\n✅ INDICATEURS DE QUALITÉ")
    print("-" * 40)

    quality_metrics = {}
    for col in df.columns:
        completeness = (df[col].notna().sum() / len(df)) * 100
        quality_metrics[col] = completeness

    # Afficher les colonnes critiques
    critical_cols = ['Année', 'Diagnostic principal harmonisé', 'SSP harmonisé',
                    'Groupe_Thematique', 'Code_ICD10']

    for col in critical_cols:
        if col in quality_metrics:
            completeness = quality_metrics[col]
            status = "✓" if completeness == 100 else "⚠" if completeness > 90 else "✗"
            bar = create_text_bar(completeness, 100, 20)
            print(f"  {status} {col:30s} {bar} {completeness:5.1f}%")

    # 9. Résumé final
    print("\n" + "=" * 80)
    print("RÉSUMÉ EXÉCUTIF")
    print("=" * 80)
    print(f"""
  📊 Base de données ECOS harmonisée avec succès:
     • {len(df)} cas cliniques traités
     • {len(year_counts)} années de données ({year_counts.index.min()}-{year_counts.index.max()})
     • {len(diag_counts)} diagnostics uniques
     • {len(theme_counts)} groupes thématiques
     • {icd_percentage:.1f}% de couverture ICD-10
     • {len(duplicates)} doublons potentiels identifiés

  ✨ Principales améliorations apportées:
     • Harmonisation des variantes diagnostiques
     • Standardisation de la casse et ponctuation
     • Attribution de codes ICD-10
     • Regroupement thématique des cas
     • Détection des doublons
     • Harmonisation des symptômes (SSP)
    """)

    print("=" * 80 + "\n")


if __name__ == "__main__":
    # Utiliser le fichier harmonisé généré
    harmonized_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Harmonise_20251024_154128.csv"

    visualize_ecos_data(harmonized_file)