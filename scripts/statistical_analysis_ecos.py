#!/usr/bin/env python3
"""
Script d'analyse statistique des cas ECOS harmonisés
Auteur: Assistant Claude
Date: 2025
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime

def load_latest_data():
    """Charge le fichier harmonisé le plus récent"""
    data_dir = Path("/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat")

    # Trouver le fichier CSV harmonisé le plus récent
    csv_files = list(data_dir.glob("ECOS_Cas_Harmonise_*.csv"))
    if not csv_files:
        raise FileNotFoundError("Aucun fichier harmonisé trouvé")

    latest_file = max(csv_files, key=lambda x: x.stat().st_mtime)
    print(f"📂 Chargement du fichier: {latest_file.name}")

    df = pd.read_csv(latest_file, sep=';')
    print(f"✓ {len(df)} lignes chargées")
    return df, latest_file

def analyze_temporal_trends(df):
    """Analyse les tendances temporelles"""
    print("\n📈 ANALYSE TEMPORELLE")
    print("="*50)

    # Évolution par année
    year_counts = df['Année'].value_counts().sort_index()
    print("\nNombre de cas par année:")
    for year, count in year_counts.items():
        bar_length = int(count / 2)  # Échelle pour la barre
        bar = '█' * bar_length
        print(f"  {year}: {bar} {count}")

    # Tendance
    years = year_counts.index.tolist()
    counts = year_counts.values.tolist()

    if len(years) > 1:
        # Calcul simple de la tendance
        first_half = sum(counts[:len(counts)//2])
        second_half = sum(counts[len(counts)//2:])

        if second_half > first_half:
            trend = "📈 Croissante"
        elif second_half < first_half:
            trend = "📉 Décroissante"
        else:
            trend = "➡️ Stable"

        print(f"\nTendance générale: {trend}")
        print(f"  • Première moitié ({years[0]}-{years[len(years)//2-1]}): {first_half} cas")
        print(f"  • Seconde moitié ({years[len(years)//2]}-{years[-1]}): {second_half} cas")

def analyze_categories(df):
    """Analyse les catégories"""
    print("\n🏷️ ANALYSE PAR CATÉGORIE")
    print("="*50)

    cat_counts = df['Catégorie'].value_counts()

    print("\nTop 10 des catégories:")
    for i, (cat, count) in enumerate(cat_counts.head(10).items(), 1):
        pct = (count / len(df)) * 100
        bar_length = int(pct / 2)
        bar = '▓' * bar_length
        print(f"  {i:2}. {cat[:30]:30} {bar} {count:3} ({pct:.1f}%)")

    # Diversité des catégories
    unique_cats = df['Catégorie'].nunique()
    print(f"\n📊 Diversité: {unique_cats} catégories uniques")

    # Concentration
    top_5_pct = (cat_counts.head(5).sum() / len(df)) * 100
    print(f"📍 Concentration: Le Top 5 représente {top_5_pct:.1f}% des cas")

def main():
    """Fonction principale"""
    print("\n" + "="*60)
    print("   ANALYSE STATISTIQUE DES CAS ECOS HARMONISÉS")
    print("="*60 + "\n")

    try:
        # Charger les données
        df, data_file = load_latest_data()

        # Analyses
        analyze_temporal_trends(df)
        analyze_categories(df)

        print("\n" + "="*60)
        print("✅ ANALYSE TERMINÉE AVEC SUCCÈS")
        print("="*60)

    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
