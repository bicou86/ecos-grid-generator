#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour affiner davantage la catégorisation thématique
et analyser les cas restants dans 'Autre'
"""

import pandas as pd
from datetime import datetime

def analyze_and_refine_categories(enriched_file):
    """
    Analyse les cas dans 'Autre' et affine la catégorisation
    """
    print("\n" + "="*60)
    print("AFFINEMENT DE LA CATÉGORISATION THÉMATIQUE")
    print("="*60 + "\n")

    # Charger les données enrichies
    df = pd.read_csv(enriched_file, sep=';', encoding='utf-8')
    print(f"📂 {len(df)} cas chargés")

    # Analyser les cas dans 'Autre'
    print("\n🔍 Analyse des cas dans 'Autre' et 'Non classé'...")
    autres = df[df['Groupe_Thematique_V2'].isin(['Autre', 'Non classé'])]
    print(f"  {len(autres)} cas à recatégoriser")

    if not autres.empty:
        print("\n📋 Diagnostics dans 'Autre' (top 20):")
        diag_autres = autres['Diagnostic principal harmonisé'].value_counts()
        for diag, count in diag_autres.head(20).items():
            if pd.notna(diag) and str(diag).lower() != 'nan':
                print(f"    • {diag}: {count} cas")

    # Créer des règles de catégorisation supplémentaires
    additional_mappings = {
        'Oncologie': [
            'Cancer', 'Tumeur', 'Métastase', 'Carcinome', 'Lymphome',
            'Leucémie', 'Myélome', 'Sarcome', 'Mélanome'
        ],
        'Infectiologie': [
            'Infection', 'Sepsis', 'Abcès', 'Cellulite', 'Érysipèle',
            'Fièvre', 'FUO', 'Fuo', 'Bactériémie', 'Virémie',
            'Parasitose', 'Mycose', 'Candidose'
        ],
        'Hématologie': [
            'Anémie', 'Leucopénie', 'Thrombopénie', 'Pancytopénie',
            'Polyglobulie', 'Hémochromatose', 'Drépanocytose',
            'Thalassémie', 'Hémophilie', 'Purpura'
        ],
        'Ophtalmologie': [
            'Conjonctivite', 'Kératite', 'Uvéite', 'Glaucome',
            'Cataracte', 'Rétinopathie', 'DMLA', 'Œil rouge',
            'Baisse vision', 'Cécité', 'Diplopie'
        ],
        'ORL': [
            'Otite', 'Sinusite', 'Rhinite', 'Pharyngite', 'Laryngite',
            'Angine', 'Amygdalite', 'Épistaxis', 'Acouphène',
            'Vertige', 'Surdité', 'Hypoacousie', 'OMA'
        ],
        'Allergie-Immunologie': [
            'Allergie', 'Anaphylaxie', 'Œdème de Quincke', 'Urticaire',
            'Rhinite allergique', 'Asthme allergique', 'Eczéma atopique',
            'Intolérance', 'Maladie auto-immune'
        ],
        'Médecine générale': [
            'Bilan', 'Check-up', 'Contrôle', 'Prévention', 'Vaccination',
            'Certificat', 'Conseil', 'Éducation', 'Dépistage'
        ],
        'Médecine du travail': [
            'Accident travail', 'Maladie professionnelle', 'Burn-out',
            'Stress professionnel', 'TMS', 'Exposition professionnelle'
        ],
        'Médecine sportive': [
            'Blessure sportive', 'Traumatisme sport', 'Surentraînement',
            'Test effort', 'Certificat sport'
        ],
        'Gériatrie': [
            'Chute personne âgée', 'Syndrome gériatrique', 'Démence',
            'Confusion aiguë', 'Dénutrition', 'Escarre', 'Polypathologie'
        ],
        'Toxicologie': [
            'Intoxication', 'Empoisonnement', 'Surdosage', 'Overdose',
            'Sevrage', 'Addiction'
        ]
    }

    def recategorize_autre(row):
        """Recatégorise les cas 'Autre' et 'Non classé'"""
        if row['Groupe_Thematique_V2'] not in ['Autre', 'Non classé']:
            return row['Groupe_Thematique_V2']

        # Vérifier le diagnostic principal
        diag = str(row['Diagnostic principal harmonisé']).lower() if pd.notna(row['Diagnostic principal harmonisé']) else ''
        diag_gen = str(row['Diagnostic générique harmonisé']).lower() if pd.notna(row['Diagnostic générique harmonisé']) else ''
        ssp = str(row['SSP harmonisé']).lower() if pd.notna(row['SSP harmonisé']) else ''
        desc = str(row['Description']).lower() if pd.notna(row['Description']) else ''

        # Chercher dans les mappings supplémentaires
        for category, keywords in additional_mappings.items():
            for keyword in keywords:
                keyword_lower = keyword.lower()
                if (keyword_lower in diag or keyword_lower in diag_gen or
                    keyword_lower in ssp or keyword_lower in desc):
                    return category

        # Catégorisation basée sur les patterns SSP
        if 'douleur' in ssp:
            if 'thoracique' in ssp or 'précordiale' in ssp:
                return 'Cardiovasculaire'
            elif 'abdominale' in ssp or 'épigastrique' in ssp:
                return 'Gastroentérologie'
            elif 'dorsale' in ssp or 'lombaire' in ssp:
                return 'Rhumatologie'
            elif 'articulaire' in ssp:
                return 'Rhumatologie'
            elif 'céphalée' in ssp or 'tête' in ssp:
                return 'Neurologie'
            elif 'gorge' in ssp:
                return 'ORL'
            elif 'testiculaire' in ssp or 'pelvienne' in ssp:
                return 'Néphrologie-Urologie'

        # Catégorisation par systèmes dans la description
        if desc:
            if 'cardia' in desc or 'cœur' in desc or 'vasculaire' in desc:
                return 'Cardiovasculaire'
            elif 'poumon' in desc or 'respiratoire' in desc or 'thorax' in desc:
                return 'Pneumologie'
            elif 'foie' in desc or 'vésicule' in desc or 'pancréas' in desc:
                return 'Gastroentérologie'
            elif 'rein' in desc or 'vessie' in desc or 'urinaire' in desc:
                return 'Néphrologie-Urologie'
            elif 'cerveau' in desc or 'neurologique' in desc:
                return 'Neurologie'
            elif 'peau' in desc or 'cutané' in desc:
                return 'Dermatologie'

        # Si toujours non classé, utiliser le SSP pour catégoriser
        if 'fièvre' in ssp or 'infection' in diag:
            return 'Infectiologie'
        elif 'bilan' in ssp or 'contrôle' in ssp or 'check' in ssp:
            return 'Médecine générale'
        elif 'anxiété' in ssp or 'dépression' in ssp or 'stress' in ssp:
            return 'Psychiatrie'
        elif 'éruption' in ssp or 'rash' in ssp:
            return 'Dermatologie'
        elif 'fatigue' in ssp or 'asthénie' in ssp:
            return 'Médecine générale'

        # Si vraiment aucune correspondance
        if pd.isna(row['Diagnostic principal harmonisé']) or str(row['Diagnostic principal harmonisé']).lower() == 'nan':
            return 'Non spécifié'

        return 'Autre'

    # Appliquer la recatégorisation
    print("\n🔄 Application de la recatégorisation...")
    df['Groupe_Thematique_V3'] = df.apply(recategorize_autre, axis=1)

    # Statistiques après recatégorisation
    print("\n📊 Nouvelle répartition après affinement:")
    cat_stats = df['Groupe_Thematique_V3'].value_counts()
    for cat, count in cat_stats.items():
        percentage = (count / len(df)) * 100
        if percentage >= 1.0:  # Afficher seulement les catégories > 1%
            print(f"  - {cat}: {count} cas ({percentage:.1f}%)")

    # Afficher les petites catégories ensemble
    small_cats = cat_stats[cat_stats < len(df) * 0.01]
    if not small_cats.empty:
        total_small = small_cats.sum()
        print(f"  - [Autres catégories <1%]: {total_small} cas ({total_small/len(df)*100:.1f}%)")

    autre_final = cat_stats.get('Autre', 0)
    autre_percentage = (autre_final / len(df)) * 100
    print(f"\n✨ Groupe 'Autre' final: {autre_percentage:.1f}%")

    # Validation des doublons
    print("\n🔍 Validation et décision sur les doublons...")
    if 'Doublon_Supprime' in df.columns:
        doublons = df[df['Doublon_Supprime'] == True]
        print(f"  {len(doublons)} doublons à supprimer")

        # Option 1: Garder les doublons mais les marquer
        df['Statut_Doublon'] = df.apply(
            lambda x: 'Doublon conservé pour analyse' if x['Est_Doublon'] and not x['Doublon_Supprime']
            else 'Doublon à supprimer' if x['Doublon_Supprime']
            else 'Original',
            axis=1
        )

        # Option 2: Créer un dataframe sans doublons
        df_sans_doublons = df[df['Doublon_Supprime'] == False].copy()
        print(f"  ✓ Dataset sans doublons: {len(df_sans_doublons)} cas")

    # Sauvegarder les résultats
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Version complète avec doublons marqués
    output_complete = enriched_file.replace('.csv', f'_V3_complet_{timestamp}.csv')
    df.to_csv(output_complete, sep=';', encoding='utf-8', index=False)
    print(f"\n💾 Fichier complet sauvegardé: {output_complete}")

    # Version sans doublons
    if 'df_sans_doublons' in locals():
        output_clean = enriched_file.replace('.csv', f'_V3_sans_doublons_{timestamp}.csv')
        df_sans_doublons.to_csv(output_clean, sep=';', encoding='utf-8', index=False)
        print(f"💾 Fichier sans doublons: {output_clean}")

    # Générer un rapport final
    report_file = enriched_file.replace('.csv', f'_rapport_final_{timestamp}.txt')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("="*60 + "\n")
        f.write("RAPPORT FINAL D'HARMONISATION ECOS\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*60 + "\n\n")

        f.write("RÉSUMÉ EXÉCUTIF\n")
        f.write("-"*30 + "\n")
        f.write(f"Total de cas traités: {len(df)}\n")
        f.write(f"Cas sans doublons: {len(df_sans_doublons) if 'df_sans_doublons' in locals() else 'N/A'}\n")
        f.write(f"Catégories thématiques: {len(cat_stats)}\n")
        f.write(f"Groupe 'Autre' réduit de 92.2% à {autre_percentage:.1f}%\n\n")

        f.write("ÉVOLUTION DE LA CATÉGORISATION\n")
        f.write("-"*30 + "\n")
        f.write("Étape 1 (initial): Autre = 92.2%\n")
        f.write("Étape 2 (V2): Autre = 20.3%\n")
        f.write(f"Étape 3 (V3): Autre = {autre_percentage:.1f}%\n\n")

        f.write("RÉPARTITION FINALE PAR CATÉGORIE\n")
        f.write("-"*30 + "\n")
        for cat, count in cat_stats.head(20).items():
            percentage = (count / len(df)) * 100
            f.write(f"  {cat:30s}: {count:4d} cas ({percentage:5.1f}%)\n")

        f.write("\nCODIFICATION SSP PROFILES\n")
        f.write("-"*30 + "\n")
        ssp_coverage = df[~df['Code_SSP_PROFILES'].isin(['SSP-000', 'SSP-999'])].shape[0]
        f.write(f"SSP codifiés: {ssp_coverage}/{len(df)} ({ssp_coverage/len(df)*100:.1f}%)\n")

        f.write("\nGESTION DES DOUBLONS\n")
        f.write("-"*30 + "\n")
        if 'Statut_Doublon' in df.columns:
            statut_counts = df['Statut_Doublon'].value_counts()
            for statut, count in statut_counts.items():
                f.write(f"  {statut}: {count}\n")

        f.write("\n" + "="*60 + "\n")
        f.write("RECOMMANDATIONS\n")
        f.write("-"*30 + "\n")
        f.write("1. Utiliser la version sans doublons pour les analyses statistiques\n")
        f.write("2. Compléter les codes SSP-999 (non reconnus) manuellement\n")
        f.write("3. Réviser les cas restants dans 'Autre' individuellement\n")
        f.write("4. Intégrer les PDFs pour enrichir les descriptions manquantes\n")

        f.write("\n" + "="*60 + "\n")

    print(f"📄 Rapport final généré: {report_file}")

    return output_complete

if __name__ == "__main__":
    # Utiliser le fichier enrichi précédent
    enriched_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Enrichi_20251024_155919.csv"

    final_file = analyze_and_refine_categories(enriched_file)

    print("\n✅ Affinement terminé avec succès!")