#!/usr/bin/env python3
"""
Script de création d'un tableau de bord Excel interactif pour les cas ECOS
Auteur: Assistant Claude
Date: 2025
"""

import pandas as pd
from pathlib import Path
from datetime import datetime

def load_latest_data():
    """Charge le fichier harmonisé le plus récent"""
    data_dir = Path("/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat")
    csv_files = list(data_dir.glob("ECOS_Cas_Harmonise_*.csv"))
    if not csv_files:
        raise FileNotFoundError("Aucun fichier harmonisé trouvé")

    latest_file = max(csv_files, key=lambda x: x.stat().st_mtime)
    print(f"📂 Chargement: {latest_file.name}")
    df = pd.read_csv(latest_file, sep=';')
    print(f"✓ {len(df)} lignes chargées")
    return df

def create_excel_dashboard(df):
    """Crée un tableau de bord Excel complet"""
    print("\n📊 Création du tableau de bord Excel...")

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = Path("/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat") / f"ECOS_Dashboard_{timestamp}.xlsx"

    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        # 1. Résumé
        print("  • Résumé exécutif...")
        summary_data = {
            'Métrique': [
                'Total de cas', 'Période', 'Catégories uniques',
                'Diagnostics uniques', 'Symptômes uniques',
                'Taux de doublons (%)', 'Couverture ICD-10 (%)'
            ],
            'Valeur': [
                len(df),
                f"{df['Année'].min()}-{df['Année'].max()}",
                df['Catégorie'].nunique(),
                df['Diagnostic principal harmonisé'].nunique(),
                df['SSP harmonisé'].nunique(),
                round((df['Est_Doublon'].sum() / len(df)) * 100, 1),
                round((df['Code_ICD10'].notna().sum() / len(df)) * 100, 1)
            ]
        }
        pd.DataFrame(summary_data).to_excel(writer, sheet_name='Résumé', index=False)

        # 2. Top Diagnostics
        print("  • Top diagnostics...")
        diag_counts = df[df['Diagnostic principal harmonisé'] != '']['Diagnostic principal harmonisé'].value_counts().head(30)
        diag_df = pd.DataFrame({
            'Diagnostic': diag_counts.index,
            'Nombre': diag_counts.values,
            'Pourcentage': [(v / len(df)) * 100 for v in diag_counts.values]
        })
        diag_df.to_excel(writer, sheet_name='Top30_Diagnostics', index=False)

        # 3. Évolution temporelle
        print("  • Évolution temporelle...")
        temporal_df = df.groupby('Année').size().reset_index(name='Nombre de cas')
        temporal_df.to_excel(writer, sheet_name='Évolution', index=False)

        # 4. Analyse par catégorie
        print("  • Analyse par catégorie...")
        cat_df = df['Catégorie'].value_counts().reset_index()
        cat_df.columns = ['Catégorie', 'Nombre']
        cat_df['Pourcentage'] = (cat_df['Nombre'] / len(df)) * 100
        cat_df.to_excel(writer, sheet_name='Catégories', index=False)

        # 5. Données complètes
        print("  • Export données complètes...")
        df.to_excel(writer, sheet_name='Données_Complètes', index=False)

    print(f"\n✅ Dashboard créé: {output_file.name}")
    return output_file

def main():
    print("\n" + "="*60)
    print("   CRÉATION DU TABLEAU DE BORD EXCEL INTERACTIF")
    print("="*60 + "\n")

    try:
        df = load_latest_data()
        excel_file = create_excel_dashboard(df)

        print("\n📊 RÉSUMÉ:")
        print(f"  • {len(df)} cas traités")
        print(f"  • {df['Année'].nunique()} années")
        print(f"  • {df['Catégorie'].nunique()} catégories")
        print(f"  • Fichier: {excel_file.name}")

        print("\n✨ Utilisez Excel pour explorer interactivement les données!")

    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
