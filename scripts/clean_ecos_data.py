#!/usr/bin/env python3
"""
Script de nettoyage et d'harmonisation des données ECOS
Auteur: Assistant Claude
Date: 2025
"""

import pandas as pd
import numpy as np
import re
from datetime import datetime

def clean_text(text):
    """Nettoie le texte en supprimant les espaces superflus et unifiant la casse"""
    if pd.isna(text):
        return text
    # Supprimer les espaces multiples
    text = re.sub(r'\s+', ' ', str(text))
    # Supprimer les espaces en début et fin
    text = text.strip()
    return text

def standardize_diagnosis(diagnosis):
    """Standardise les diagnostics médicaux"""
    if pd.isna(diagnosis):
        return diagnosis

    diagnosis = str(diagnosis).strip()

    # Dictionnaire de standardisation des termes médicaux
    standardization_map = {
        # Cancers
        'Cancer vésical': 'Cancer de la vessie',
        'Carcinome vésical': 'Cancer de la vessie',
        'Cancer colique': 'Cancer du côlon',
        'Cancer colorectal': 'Cancer colorectal',
        'Ca colorectal': 'Cancer colorectal',
        'Carcinome hépatocellulaire': 'Carcinome hépatocellulaire',
        'CHC': 'Carcinome hépatocellulaire',

        # Diabètes
        'Diabète type 1': 'Diabète de type 1',
        'Diabète type 2': 'Diabète de type 2',
        'DT1': 'Diabète de type 1',
        'DT2': 'Diabète de type 2',
        'Diabète mellitus': 'Diabète',

        # Cardiovasculaire
        'HTA': 'Hypertension artérielle',
        'Hypertension': 'Hypertension artérielle',
        'IDM': 'Infarctus du myocarde',
        'Infarctus': 'Infarctus du myocarde',
        'AVC': 'Accident vasculaire cérébral',
        'AIT': 'Accident ischémique transitoire',
        'AOMI': 'Artériopathie oblitérante des membres inférieurs',
        'TVP': 'Thrombose veineuse profonde',
        'EP': 'Embolie pulmonaire',
        'FA': 'Fibrillation auriculaire',
        'Fibrillation atriale': 'Fibrillation auriculaire',

        # Respiratoire
        'BPCO': 'Bronchopneumopathie chronique obstructive',
        'Asthme bronchique': 'Asthme',
        'Pneumonie communautaire': 'Pneumonie',
        'PNA': 'Pyélonéphrite aiguë',

        # Neurologique
        'SEP': 'Sclérose en plaques',
        'Sclérose multiple': 'Sclérose en plaques',
        'Epilepsie': 'Épilepsie',
        'Migraine': 'Migraine',
        'Céphalées': 'Céphalées',
        'Maladie de Parkinson': 'Maladie de Parkinson',
        'Parkinson': 'Maladie de Parkinson',

        # Psychiatrique
        'Depression': 'Dépression',
        'Dépression majeure': 'Dépression',
        'Anxiété généralisée': 'Trouble anxieux généralisé',
        'TAG': 'Trouble anxieux généralisé',
        'Burnout': 'Syndrome d\'épuisement professionnel',
        'Burn-out': 'Syndrome d\'épuisement professionnel',

        # Endocrinologie
        'Hypothyroidie': 'Hypothyroïdie',
        'Hyperthyroidie': 'Hyperthyroïdie',
        'Hyperthyroïdie': 'Hyperthyroïdie',
        'Thyroïdite': 'Thyroïdite',
        'Maladie de Basedow': 'Maladie de Basedow',
        'Basedow': 'Maladie de Basedow',

        # Rhumatologie
        'PR': 'Polyarthrite rhumatoïde',
        'Polyarthrite': 'Polyarthrite rhumatoïde',
        'Lupus': 'Lupus érythémateux systémique',
        'LES': 'Lupus érythémateux systémique',
        'Arthrose': 'Arthrose',
        'Goutte': 'Goutte',

        # Gastroentérologie
        'RCH': 'Rectocolite hémorragique',
        'Crohn': 'Maladie de Crohn',
        'Maladie de Crohn': 'Maladie de Crohn',
        'MICI': 'Maladie inflammatoire chronique de l\'intestin',
        'RGO': 'Reflux gastro-œsophagien',
        'Ulcère gastrique': 'Ulcère gastrique',
        'Ulcère duodénal': 'Ulcère duodénal',

        # Dermatologie
        'Psoriasis': 'Psoriasis',
        'EM': 'Érythème migrant',
        'Erythème migrant': 'Érythème migrant',
        'Melanome': 'Mélanome',

        # Infections
        'ITU': 'Infection urinaire',
        'Infection urinaire': 'Infection urinaire',
        'Cystite': 'Cystite',
        'Pyélonéphrite': 'Pyélonéphrite aiguë',
        'Grippe': 'Grippe',
        'COVID': 'COVID-19',
        'Covid-19': 'COVID-19',
        'VIH': 'VIH/SIDA',
        'SIDA': 'VIH/SIDA',

        # Autres
        'IRC': 'Insuffisance rénale chronique',
        'IRA': 'Insuffisance rénale aiguë',
        'IC': 'Insuffisance cardiaque',
        'Insuffisance cardiaque congestive': 'Insuffisance cardiaque',
        'Anémie ferriprive': 'Anémie ferriprive',
        'Anémie par carence en fer': 'Anémie ferriprive',
        'Hémochromatose': 'Hémochromatose',
        'Cirrhose': 'Cirrhose hépatique',
        'NASH': 'Stéatohépatite non alcoolique'
    }

    # Appliquer la standardisation
    for original, standard in standardization_map.items():
        if diagnosis.upper() == original.upper():
            return standard

    # Corrections orthographiques communes
    diagnosis = diagnosis.replace('hemmorragie', 'hémorragie')
    diagnosis = diagnosis.replace('hemmoragie', 'hémorragie')
    diagnosis = diagnosis.replace('hemoragie', 'hémorragie')
    diagnosis = diagnosis.replace('ophtalmologie', 'ophtalmologique')
    diagnosis = diagnosis.replace('rhumatologie', 'rhumatologique')

    return diagnosis

def split_multiple_diagnoses(diagnosis_str):
    """Sépare les diagnostics multiples en diagnostic principal et différentiels"""
    if pd.isna(diagnosis_str):
        return diagnosis_str, None

    diagnosis_str = str(diagnosis_str)

    # Patterns pour détecter les diagnostics multiples
    patterns = [
        r'\s+vs\s+',  # "Diagnostic1 vs Diagnostic2"
        r'\s+versus\s+',
        r'\s+ou\s+',   # "Diagnostic1 ou Diagnostic2"
        r'\s+/\s+',    # "Diagnostic1 / Diagnostic2"
        r'\s*,\s+',    # "Diagnostic1, Diagnostic2"
        r'\s+et\s+'    # "Diagnostic1 et Diagnostic2" (parfois utilisé pour des DD)
    ]

    for pattern in patterns:
        if re.search(pattern, diagnosis_str, re.IGNORECASE):
            parts = re.split(pattern, diagnosis_str, flags=re.IGNORECASE)
            if len(parts) >= 2:
                principal = parts[0].strip()
                differentiels = [p.strip() for p in parts[1:]]
                return principal, '; '.join(differentiels)

    return diagnosis_str, None

def extract_diagnostic_precision(diagnosis):
    """Extrait la précision diagnostique d'un diagnostic principal"""
    if pd.isna(diagnosis):
        return None, None

    diagnosis = str(diagnosis)

    # Patterns pour extraire les précisions
    precision_patterns = {
        'Psychose': ['post-partum', 'aiguë', 'chronique', 'paranoïaque', 'schizophrénique'],
        'Pneumonie': ['communautaire', 'nosocomiale', 'atypique', 'virale', 'bactérienne'],
        'Hépatite': ['A', 'B', 'C', 'alcoolique', 'médicamenteuse', 'auto-immune'],
        'Anémie': ['ferriprive', 'mégaloblastique', 'hémolytique', 'aplastique'],
        'Insuffisance cardiaque': ['gauche', 'droite', 'globale', 'aiguë', 'chronique'],
        'Insuffisance rénale': ['aiguë', 'chronique', 'terminale'],
        'Diabète': ['type 1', 'type 2', 'gestationnel', 'insipide'],
        'Cancer': ['stade I', 'stade II', 'stade III', 'stade IV', 'métastatique'],
        'Fracture': ['ouverte', 'fermée', 'comminutive', 'déplacée', 'pathologique'],
        'AVC': ['ischémique', 'hémorragique', 'lacunaire', 'embolique'],
        'Douleur': ['aiguë', 'chronique', 'neuropathique', 'inflammatoire'],
        'Infection': ['bactérienne', 'virale', 'fongique', 'parasitaire']
    }

    for base_diagnosis, precisions in precision_patterns.items():
        if base_diagnosis.lower() in diagnosis.lower():
            for precision in precisions:
                if precision.lower() in diagnosis.lower():
                    return base_diagnosis, precision

    # Si aucun pattern n'est trouvé, rechercher des patterns génériques
    if '(' in diagnosis and ')' in diagnosis:
        # Ex: "Diagnostic (précision)"
        match = re.search(r'^([^(]+)\s*\(([^)]+)\)', diagnosis)
        if match:
            return match.group(1).strip(), match.group(2).strip()

    if ' - ' in diagnosis:
        # Ex: "Diagnostic - précision"
        parts = diagnosis.split(' - ', 1)
        if len(parts) == 2:
            return parts[0].strip(), parts[1].strip()

    return None, None

def reorganize_columns_content(row):
    """Réorganise le contenu des colonnes Anamnèse, Status et Management"""
    anamnese_keywords = ['antécédent', 'histoire', 'depuis', 'début', 'évolution', 'facteur de risque',
                         'allergie', 'médicament', 'traitement actuel', 'habitude', 'tabac', 'alcool',
                         'profession', 'voyage', 'contact', 'symptôme']

    status_keywords = ['examen', 'palpation', 'auscultation', 'inspection', 'percussion', 'signe vital',
                       'tension', 'pouls', 'température', 'fréquence', 'saturation', 'glasgow', 'neurologique',
                       'abdominal', 'cardio', 'pulmonaire', 'cutané', 'œdème', 'ganglion']

    management_keywords = ['traitement', 'prescription', 'médicament', 'dose', 'posologie', 'surveillance',
                          'hospitalisation', 'ambulatoire', 'urgence', 'référer', 'consulter', 'examen complémentaire',
                          'bilan', 'imagerie', 'laboratoire', 'ECG', 'radio', 'scanner', 'IRM', 'échographie']

    anamnese = row['Anamnèse'] if pd.notna(row['Anamnèse']) else ''
    status = row['Status'] if pd.notna(row['Status']) else ''
    management = row['Management'] if pd.notna(row['Management']) else ''
    description = row['Description'] if pd.notna(row['Description']) else ''

    # Analyser et réaffecter si nécessaire
    remarque_parts = []

    # Vérifier si le contenu de l'anamnèse correspond vraiment à une anamnèse
    if anamnese and not any(keyword in anamnese.lower() for keyword in anamnese_keywords):
        if any(keyword in anamnese.lower() for keyword in status_keywords):
            if not status:
                status = anamnese
                anamnese = ''
        elif any(keyword in anamnese.lower() for keyword in management_keywords):
            if not management:
                management = anamnese
                anamnese = ''
        else:
            remarque_parts.append(f"Info anamnèse: {anamnese}")
            anamnese = ''

    # Extraire les informations mal placées dans la description
    if description:
        desc_lower = description.lower()
        if any(keyword in desc_lower for keyword in anamnese_keywords) and not anamnese:
            anamnese = description
            description = ''
        elif any(keyword in desc_lower for keyword in status_keywords) and not status:
            status = description
            description = ''
        elif any(keyword in desc_lower for keyword in management_keywords) and not management:
            management = description
            description = ''

    # Créer la colonne Remarque
    remarque = ' | '.join(remarque_parts) if remarque_parts else ''

    return anamnese, status, management, description, remarque

def process_ecos_data(input_file, output_file):
    """Fonction principale de traitement des données ECOS"""
    print("📚 Lecture du fichier Excel...")
    df = pd.read_excel(input_file)
    original_count = len(df)

    print(f"✅ {original_count} enregistrements lus")

    # 1. NETTOYAGE INITIAL
    print("\n📄 Étape 1: Nettoyage initial...")

    # Nettoyer les espaces dans toutes les colonnes texte
    text_columns = ['Sujet', 'Station', 'SSP', 'Suspicion diagnostic principale',
                   'Diagnostics différentiels', 'Description', 'Anamnèse', 'Status', 'Management']

    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].apply(clean_text)

    # Standardiser la casse pour les diagnostics
    if 'Suspicion diagnostic principale' in df.columns:
        df['Suspicion diagnostic principale'] = df['Suspicion diagnostic principale'].apply(
            lambda x: x.capitalize() if pd.notna(x) and x else x
        )

    print("   ✓ Espaces superflus supprimés")
    print("   ✓ Casse standardisée")

    # Séparer les diagnostics multiples
    print("   ⚡ Séparation des diagnostics multiples...")
    new_differentials = []
    new_principals = []

    for idx, row in df.iterrows():
        principal, additional_diff = split_multiple_diagnoses(row['Suspicion diagnostic principale'])
        new_principals.append(principal)

        # Combiner avec les diagnostics différentiels existants
        existing_diff = row['Diagnostics différentiels'] if pd.notna(row['Diagnostics différentiels']) else ''
        if additional_diff:
            if existing_diff:
                new_diff = f"{existing_diff}; {additional_diff}"
            else:
                new_diff = additional_diff
        else:
            new_diff = existing_diff
        new_differentials.append(new_diff if new_diff else np.nan)

    df['Suspicion diagnostic principale'] = new_principals
    df['Diagnostics différentiels'] = new_differentials
    print(f"   ✓ {sum(1 for d in new_differentials if d and ';' in str(d))} diagnostics multiples séparés")

    # 2. STANDARDISATION TERMINOLOGIQUE
    print("\n🧠 Étape 2: Standardisation terminologique...")

    df['Suspicion diagnostic principale'] = df['Suspicion diagnostic principale'].apply(standardize_diagnosis)

    # Standardiser aussi les diagnostics différentiels
    def standardize_differential_diagnoses(diff_str):
        if pd.isna(diff_str):
            return diff_str
        diagnoses = str(diff_str).split(';')
        standardized = [standardize_diagnosis(d.strip()) for d in diagnoses]
        return '; '.join(standardized)

    df['Diagnostics différentiels'] = df['Diagnostics différentiels'].apply(standardize_differential_diagnoses)
    print("   ✓ Terminologie médicale harmonisée")

    # Compter les standardisations effectuées
    unique_before = df['Suspicion diagnostic principale'].nunique()
    print(f"   ✓ Diagnostics uniques: {unique_before}")

    # 3. AJOUT DE STRUCTURE MÉDICALE
    print("\n📊 Étape 3: Ajout de structure médicale...")

    # Créer les nouvelles colonnes
    df['Diagnostic_principal_générique'] = ''
    df['Précision_diagnostic'] = ''

    for idx, row in df.iterrows():
        generic, precision = extract_diagnostic_precision(row['Suspicion diagnostic principale'])
        if generic:
            df.at[idx, 'Diagnostic_principal_générique'] = generic
            df.at[idx, 'Précision_diagnostic'] = precision if precision else ''
        else:
            df.at[idx, 'Diagnostic_principal_générique'] = row['Suspicion diagnostic principale']

    print(f"   ✓ {sum(df['Précision_diagnostic'] != '')} précisions diagnostiques extraites")

    # 4. RÉORGANISATION DU CONTENU
    print("\n🔄 Étape 4: Réorganisation du contenu des colonnes...")

    df['Remarque'] = ''

    reorganized_data = []
    for idx, row in df.iterrows():
        anamnese, status, management, description, remarque = reorganize_columns_content(row)
        reorganized_data.append({
            'Anamnèse': anamnese,
            'Status': status,
            'Management': management,
            'Description': description,
            'Remarque': remarque
        })

    for col in ['Anamnèse', 'Status', 'Management', 'Description', 'Remarque']:
        df[col] = [d[col] for d in reorganized_data]

    print(f"   ✓ {sum(df['Remarque'] != '')} remarques créées")

    # 5. AJOUT DE MÉTADONNÉES
    print("\n📋 Étape 5: Ajout de métadonnées...")

    # Ajouter une colonne de catégorie médicale basée sur les diagnostics
    categories_map = {
        'Cardiologie': ['infarctus', 'hypertension', 'insuffisance cardiaque', 'fibrillation',
                       'péricardite', 'angine', 'arythmie', 'tachycardie', 'bradycardie', 'endocardite'],
        'Pneumologie': ['asthme', 'bpco', 'pneumonie', 'embolie pulmonaire', 'tuberculose',
                       'bronchite', 'pneumothorax', 'fibrose'],
        'Neurologie': ['avc', 'accident vasculaire', 'épilepsie', 'migraine', 'sclérose',
                      'parkinson', 'alzheimer', 'démence', 'neuropathie', 'myasthénie'],
        'Gastroentérologie': ['reflux', 'ulcère', 'crohn', 'rectocolite', 'cirrhose',
                             'hépatite', 'pancréatite', 'cholécystite', 'appendicite', 'hernie'],
        'Endocrinologie': ['diabète', 'thyroïde', 'hyperthyroïdie', 'hypothyroïdie',
                          'cushing', 'addison', 'phéochromocytome', 'hypoglycémie'],
        'Rhumatologie': ['polyarthrite', 'arthrose', 'lupus', 'goutte', 'fibromyalgie',
                        'spondylarthrite', 'ostéoporose', 'arthrite'],
        'Psychiatrie': ['dépression', 'anxiété', 'psychose', 'schizophrénie', 'trouble bipolaire',
                       'burn-out', 'stress post-traumatique', 'trouble panique', 'phobie'],
        'Infectiologie': ['grippe', 'covid', 'vih', 'tuberculose', 'infection urinaire',
                         'méningite', 'sepsis', 'endocardite', 'malaria', 'dengue'],
        'Oncologie': ['cancer', 'carcinome', 'lymphome', 'leucémie', 'mélanome',
                     'sarcome', 'tumeur', 'métastase'],
        'Dermatologie': ['psoriasis', 'eczéma', 'mélanome', 'érythème', 'urticaire',
                        'dermatite', 'zona', 'herpès', 'acné', 'vitiligo'],
        'Néphrologie': ['insuffisance rénale', 'glomérulonéphrite', 'pyélonéphrite',
                       'syndrome néphrotique', 'lithiase', 'polykystose'],
        'Hématologie': ['anémie', 'thrombose', 'hémophilie', 'leucémie', 'lymphome',
                       'thrombocytopénie', 'polyglobulie', 'drépanocytose']
    }

    def assign_medical_category(diagnosis):
        if pd.isna(diagnosis):
            return 'Non classé'

        diagnosis_lower = str(diagnosis).lower()

        for category, keywords in categories_map.items():
            for keyword in keywords:
                if keyword in diagnosis_lower:
                    return category

        return 'Autre'

    df['Catégorie_médicale'] = df['Suspicion diagnostic principale'].apply(assign_medical_category)

    print(f"   ✓ Catégories médicales attribuées")
    print(f"   Distribution: {df['Catégorie_médicale'].value_counts().to_dict()}")

    # Ajouter la date de traitement
    df['Date_traitement'] = datetime.now().strftime('%Y-%m-%d')

    # 6. VALIDATION ET STATISTIQUES
    print("\n📈 Validation et statistiques finales...")

    # Statistiques de qualité
    quality_stats = {
        'Total_enregistrements': len(df),
        'Diagnostics_principaux_remplis': df['Suspicion diagnostic principale'].notna().sum(),
        'Diagnostics_différentiels_remplis': df['Diagnostics différentiels'].notna().sum(),
        'Anamnèse_remplie': df['Anamnèse'].notna().sum(),
        'Status_rempli': df['Status'].notna().sum(),
        'Management_rempli': df['Management'].notna().sum(),
        'Catégories_attribuées': df['Catégorie_médicale'].value_counts().to_dict()
    }

    print("   Statistiques de qualité:")
    for key, value in quality_stats.items():
        if isinstance(value, dict):
            print(f"   - {key}:")
            for k, v in value.items():
                print(f"     • {k}: {v}")
        else:
            print(f"   - {key}: {value}")

    # 7. RÉORGANISATION DES COLONNES POUR L'EXPORT
    column_order = [
        'Année', 'Sujet', 'Station', 'SSP',
        'Catégorie_médicale',
        'Suspicion diagnostic principale',
        'Diagnostic_principal_générique',
        'Précision_diagnostic',
        'Diagnostics différentiels',
        'Description',
        'Anamnèse',
        'Status',
        'Management',
        'Remarque',
        'Date_traitement'
    ]

    # Assurer que toutes les colonnes existent
    for col in column_order:
        if col not in df.columns:
            df[col] = ''

    df_final = df[column_order]

    # 8. SAUVEGARDE
    print(f"\n💾 Sauvegarde du fichier nettoyé vers: {output_file}")
    df_final.to_excel(output_file, index=False, engine='openpyxl')
    print(f"✅ Fichier sauvegardé avec succès ({len(df_final)} enregistrements)")

    # Créer aussi un fichier CSV pour compatibilité
    csv_file = output_file.replace('.xlsx', '.csv')
    df_final.to_csv(csv_file, index=False, encoding='utf-8-sig')
    print(f"✅ Version CSV également créée: {csv_file}")

    return df_final, quality_stats

# Exécution principale
if __name__ == "__main__":
    input_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/ECOSAnciens_cas_2011-2025.xlsx"
    output_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/ECOSAnciens_cas_2011-2025_CLEAN.xlsx"

    try:
        df_cleaned, stats = process_ecos_data(input_file, output_file)
        print("\n🎉 Traitement terminé avec succès!")

        # Afficher un résumé
        print("\n📊 RÉSUMÉ DU NETTOYAGE:")
        print("=" * 50)
        print(f"Fichier source: {input_file}")
        print(f"Fichier nettoyé: {output_file}")
        print(f"Nombre total d'enregistrements: {len(df_cleaned)}")
        print(f"Colonnes ajoutées: Catégorie_médicale, Diagnostic_principal_générique, Précision_diagnostic, Remarque, Date_traitement")
        print("=" * 50)

    except Exception as e:
        print(f"❌ Erreur lors du traitement: {str(e)}")
        import traceback
        traceback.print_exc()