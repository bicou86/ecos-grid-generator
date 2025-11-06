#!/usr/bin/env python3
"""
Script de nettoyage et harmonisation des cas ECOS
Auteur: Assistant Claude
Date: 2025
Description: Nettoie, harmonise et structure les données des cas ECOS pour une exploitation optimale
"""

import pandas as pd
import numpy as np
import re
from pathlib import Path
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ECOSDataHarmonizer:
    """Classe pour harmoniser et nettoyer les données ECOS"""

    def __init__(self, input_file: str):
        """
        Initialise le harmonisateur avec le fichier d'entrée

        Args:
            input_file: Chemin vers le fichier CSV ECOS
        """
        self.input_file = Path(input_file)
        self.output_dir = self.input_file.parent
        self.df = None
        self.df_clean = None
        self.mapping_diagnostics = {}
        self.mapping_ssp = {}
        self.icd10_mapping = {}
        self.stats = {
            'total_rows': 0,
            'empty_cells_filled': 0,
            'diagnostics_harmonized': 0,
            'typos_corrected': 0,
            'duplicates_found': 0
        }

    def load_data(self) -> pd.DataFrame:
        """Charge les données du fichier CSV"""
        print("📂 Chargement des données...")
        self.df = pd.read_csv(self.input_file, encoding='utf-8', sep=';')

        # Corriger les noms de colonnes avec des fautes
        if 'Diagnstic principal' in self.df.columns:
            self.df = self.df.rename(columns={'Diagnstic principal': 'Diagnostic principal'})
            print("  ⚠️ Colonne 'Diagnstic principal' renommée en 'Diagnostic principal'")

        # Adapter les noms de colonnes pour ECOS_Cas_propre.csv
        column_mappings = {
            'Diagnostic principal (unifié v3)': 'Diagnostic principal',
            'Diagnostic générique (v3)': 'Diagnostic générique',
            'Thème (v3)': 'Thème',
            'SSP_clean': 'SSP'
        }

        for old_name, new_name in column_mappings.items():
            if old_name in self.df.columns:
                self.df = self.df.rename(columns={old_name: new_name})
                print(f"  ✓ Colonne '{old_name}' renommée en '{new_name}'")

        # Ajouter une colonne Station si elle n'existe pas (pour compatibilité)
        if 'Station' not in self.df.columns:
            self.df['Station'] = self.df['Année'].astype(str)
            print("  ✓ Colonne 'Station' créée à partir de 'Année'")

        self.stats['total_rows'] = len(self.df)
        print(f"✓ {self.stats['total_rows']} lignes chargées")
        print(f"✓ Colonnes: {list(self.df.columns)}")
        return self.df

    def create_diagnostic_mappings(self) -> Dict[str, str]:
        """
        Crée les mappings pour harmoniser les diagnostics similaires
        """
        print("\n🔄 Création des mappings de diagnostics...")

        # Mappings pour les diagnostics principaux
        self.mapping_diagnostics = {
            # Hypertension
            'HTA': 'Hypertension artérielle',
            'HTA nouvelle': 'Hypertension artérielle',
            'Suivi HTA': 'Hypertension artérielle',
            'Hypertension artérielle': 'Hypertension artérielle',
            'Hypertension': 'Hypertension artérielle',

            # Diabète
            'Diabète type 2': 'Diabète de type 2',
            'Diabète de type 2': 'Diabète de type 2',
            'DM2': 'Diabète de type 2',
            'Diabète type II': 'Diabète de type 2',
            'Diabète': 'Diabète de type 2',
            'Diabète type 1': 'Diabète de type 1',
            'DM1': 'Diabète de type 1',

            # Thyroïde
            'hypothyroidie': 'Hypothyroïdie',
            'hypothyroïdie': 'Hypothyroïdie',
            'Hypothyroidie': 'Hypothyroïdie',
            'Hypothyroïdie': 'Hypothyroïdie',
            'hyperthyroidie': 'Hyperthyroïdie',
            'hyperthyroïdie': 'Hyperthyroïdie',
            'Hyperthyroidie': 'Hyperthyroïdie',
            'Hyperthyroïdie': 'Hyperthyroïdie',

            # Asthme
            'Asthme': 'Asthme',
            'asthme': 'Asthme',
            'Crise d\'asthme': 'Asthme',
            'Exacerbation d\'asthme': 'Asthme',

            # BPCO
            'BPCO': 'BPCO',
            'COPD': 'BPCO',
            'Exacerbation BPCO': 'BPCO',
            'Exacerbation de BPCO': 'BPCO',

            # Pneumonie
            'Pneumonie': 'Pneumonie',
            'pneumonie': 'Pneumonie',
            'Pneumonie communautaire': 'Pneumonie',
            'Pneumonie acquise en communauté': 'Pneumonie',

            # AVC
            'AVC': 'Accident vasculaire cérébral',
            'Accident vasculaire cérébral': 'Accident vasculaire cérébral',
            'AVC ischémique': 'Accident vasculaire cérébral',
            'AIT': 'Accident ischémique transitoire',

            # Infarctus
            'IDM': 'Infarctus du myocarde',
            'Infarctus du myocarde': 'Infarctus du myocarde',
            'STEMI': 'Infarctus du myocarde',
            'NSTEMI': 'Infarctus du myocarde',
            'SCA': 'Syndrome coronarien aigu',

            # Insuffisance cardiaque
            'Insuffisance cardiaque': 'Insuffisance cardiaque',
            'IC': 'Insuffisance cardiaque',
            'Décompensation cardiaque': 'Insuffisance cardiaque',

            # Infections urinaires
            'Infection urinaire': 'Infection urinaire',
            'IU': 'Infection urinaire',
            'Cystite': 'Infection urinaire',
            'Pyélonéphrite': 'Pyélonéphrite',

            # Grossesse
            'Grossesse': 'Grossesse',
            'Suivi de grossesse': 'Grossesse',
            'Grossesse normale': 'Grossesse',

            # Dépression
            'Dépression': 'Dépression',
            'Episode dépressif': 'Dépression',
            'Épisode dépressif': 'Dépression',
            'Trouble dépressif': 'Dépression',

            # Anxiété
            'Anxiété': 'Trouble anxieux',
            'Trouble anxieux': 'Trouble anxieux',
            'Crise d\'angoisse': 'Trouble anxieux',
            'Attaque de panique': 'Trouble anxieux',

            # Douleurs
            'Lombalgie': 'Lombalgie',
            'Mal de dos': 'Lombalgie',
            'Douleur lombaire': 'Lombalgie',
            'Migraine': 'Migraine',
            'Céphalée': 'Céphalée',
            'Mal de tête': 'Céphalée',

            # Cancers
            'Cancer du sein': 'Cancer du sein',
            'Cancer mammaire': 'Cancer du sein',
            'Cancer colorectal': 'Cancer colorectal',
            'Cancer du côlon': 'Cancer colorectal',
            'Cancer pulmonaire': 'Cancer du poumon',
            'Cancer du poumon': 'Cancer du poumon',

            # Autres
            'Appendicite': 'Appendicite',
            'Cholécystite': 'Cholécystite',
            'Pancréatite': 'Pancréatite',
            'Hépatite': 'Hépatite',
            'Cirrhose': 'Cirrhose',
            'Épilepsie': 'Épilepsie',
            'Parkinson': 'Maladie de Parkinson',
            'Maladie de Parkinson': 'Maladie de Parkinson',
            'Alzheimer': 'Maladie d\'Alzheimer',
            'Maladie d\'Alzheimer': 'Maladie d\'Alzheimer',
            'SEP': 'Sclérose en plaques',
            'Sclérose en plaques': 'Sclérose en plaques',
            'Polyarthrite rhumatoïde': 'Polyarthrite rhumatoïde',
            'PR': 'Polyarthrite rhumatoïde',
            'Lupus': 'Lupus érythémateux systémique',
            'LED': 'Lupus érythémateux systémique',
            'MICI': 'Maladie inflammatoire chronique intestinale',
            'Crohn': 'Maladie de Crohn',
            'Maladie de Crohn': 'Maladie de Crohn',
            'RCH': 'Rectocolite hémorragique',
            'Rectocolite hémorragique': 'Rectocolite hémorragique',
            'Anémie': 'Anémie',
            'Anémie ferriprive': 'Anémie ferriprive',
            'VIH': 'VIH/SIDA',
            'SIDA': 'VIH/SIDA',
            'COVID-19': 'COVID-19',
            'COVID': 'COVID-19',
            'Coronavirus': 'COVID-19'
        }

        # Mappings pour les SSP (symptômes/plaintes)
        self.mapping_ssp = {
            'Douleur thoracique': 'Douleur thoracique',
            'Douleur thoracique aiguë': 'Douleur thoracique',
            'Dyspnée': 'Dyspnée',
            'Essoufflement': 'Dyspnée',
            'Toux': 'Toux',
            'Fièvre': 'Fièvre',
            'Céphalée': 'Céphalée',
            'Mal de tête': 'Céphalée',
            'Vertige': 'Vertige',
            'Fatigue': 'Fatigue',
            'Asthénie': 'Fatigue',
            'Douleur abdominale': 'Douleur abdominale',
            'Mal de ventre': 'Douleur abdominale',
            'Nausées': 'Nausées/vomissements',
            'Vomissements': 'Nausées/vomissements',
            'Diarrhée': 'Diarrhée',
            'Constipation': 'Constipation',
            'Hématurie': 'Hématurie',
            'Sang dans les urines': 'Hématurie',
            'Dysurie': 'Dysurie',
            'Douleur à la miction': 'Dysurie',
            'Pollakiurie': 'Pollakiurie',
            'Palpitations': 'Palpitations',
            'Syncope': 'Syncope',
            'Malaise': 'Malaise',
            'Éruption cutanée': 'Éruption cutanée',
            'Rash': 'Éruption cutanée',
            'Prurit': 'Prurit',
            'Démangeaisons': 'Prurit',
            'Œdème': 'Œdème',
            'Gonflement': 'Œdème',
            'Perte de poids': 'Perte de poids',
            'Amaigrissement': 'Perte de poids',
            'Prise de poids': 'Prise de poids',
            'Troubles du sommeil': 'Troubles du sommeil',
            'Insomnie': 'Troubles du sommeil',
            'Anxiété': 'Anxiété',
            'Angoisse': 'Anxiété',
            'Tristesse': 'Tristesse/dépression',
            'Dépression': 'Tristesse/dépression'
        }

        print(f"✓ {len(self.mapping_diagnostics)} mappings de diagnostics créés")
        print(f"✓ {len(self.mapping_ssp)} mappings de symptômes créés")
        return self.mapping_diagnostics

    def create_icd10_mapping(self) -> Dict[str, str]:
        """
        Crée un mapping vers les codes ICD-10 pour les diagnostics principaux
        """
        print("\n🏥 Création du mapping ICD-10...")

        self.icd10_mapping = {
            'Hypertension artérielle': 'I10',
            'Diabète de type 1': 'E10',
            'Diabète de type 2': 'E11',
            'Hypothyroïdie': 'E03',
            'Hyperthyroïdie': 'E05',
            'Asthme': 'J45',
            'BPCO': 'J44',
            'Pneumonie': 'J18',
            'Accident vasculaire cérébral': 'I64',
            'Accident ischémique transitoire': 'G45',
            'Infarctus du myocarde': 'I21',
            'Syndrome coronarien aigu': 'I20.0',
            'Insuffisance cardiaque': 'I50',
            'Infection urinaire': 'N39.0',
            'Pyélonéphrite': 'N10',
            'Grossesse': 'Z33',
            'Dépression': 'F32',
            'Trouble anxieux': 'F41',
            'Lombalgie': 'M54.5',
            'Migraine': 'G43',
            'Céphalée': 'R51',
            'Cancer du sein': 'C50',
            'Cancer colorectal': 'C18',
            'Cancer du poumon': 'C34',
            'Appendicite': 'K35',
            'Cholécystite': 'K81',
            'Pancréatite': 'K85',
            'Hépatite': 'B19',
            'Cirrhose': 'K74',
            'Épilepsie': 'G40',
            'Maladie de Parkinson': 'G20',
            'Maladie d\'Alzheimer': 'G30',
            'Sclérose en plaques': 'G35',
            'Polyarthrite rhumatoïde': 'M06',
            'Lupus érythémateux systémique': 'M32',
            'Maladie inflammatoire chronique intestinale': 'K50-K52',
            'Maladie de Crohn': 'K50',
            'Rectocolite hémorragique': 'K51',
            'Anémie': 'D64',
            'Anémie ferriprive': 'D50',
            'VIH/SIDA': 'B24',
            'COVID-19': 'U07.1'
        }

        print(f"✓ {len(self.icd10_mapping)} codes ICD-10 mappés")
        return self.icd10_mapping

    def clean_text(self, text: str) -> str:
        """
        Nettoie et harmonise le texte

        Args:
            text: Texte à nettoyer

        Returns:
            Texte nettoyé
        """
        if pd.isna(text) or text == '':
            return ''

        # Convertir en string
        text = str(text)

        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text)

        # Supprimer les espaces en début et fin
        text = text.strip()

        # Capitaliser la première lettre seulement (garder les acronymes)
        if text and not text[0].isupper():
            text = text[0].upper() + text[1:]

        # Corriger les espaces avant la ponctuation
        text = re.sub(r'\s+([.,;!?])', r'\1', text)

        # Ajouter un espace après la ponctuation si nécessaire
        text = re.sub(r'([.,;!?])([A-Za-z])', r'\1 \2', text)

        return text

    def correct_typos(self, text: str, column: str) -> str:
        """
        Corrige les fautes de frappe communes

        Args:
            text: Texte à corriger
            column: Nom de la colonne pour appliquer les corrections spécifiques

        Returns:
            Texte corrigé
        """
        if pd.isna(text) or text == '':
            return ''

        text = str(text)
        original = text

        # Corrections orthographiques communes
        corrections = {
            'hypothyroidie': 'hypothyroïdie',
            'hyperthyroidie': 'hyperthyroïdie',
            'Diagnstic': 'Diagnostic',
            'pyelonephrite': 'pyélonéphrite',
            'Pyelonephrite': 'Pyélonéphrite',
            'cephalee': 'céphalée',
            'Cephalee': 'Céphalée',
            'dyspnee': 'dyspnée',
            'Dyspnee': 'Dyspnée',
            'hematurie': 'hématurie',
            'Hematurie': 'Hématurie',
            'oedeme': 'œdème',
            'Oedeme': 'Œdème',
            'arterielle': 'artérielle',
            'Arterielle': 'Artérielle',
            'cerebral': 'cérébral',
            'Cerebral': 'Cérébral',
            'ischemique': 'ischémique',
            'Ischemique': 'Ischémique',
            'depression': 'dépression',
            'Depression': 'Dépression',
            'anxiete': 'anxiété',
            'Anxiete': 'Anxiété',
            'epilepsie': 'épilepsie',
            'Epilepsie': 'Épilepsie',
            'hepatite': 'hépatite',
            'Hepatite': 'Hépatite',
            'anemie': 'anémie',
            'Anemie': 'Anémie',
            'bacterie': 'bactérie',
            'Bacterie': 'Bactérie',
            'antiobiotique': 'antibiotique',
            'Antiobiotique': 'Antibiotique'
        }

        for typo, correction in corrections.items():
            text = re.sub(r'\b' + typo + r'\b', correction, text, flags=re.IGNORECASE)

        if text != original:
            self.stats['typos_corrected'] += 1

        return text

    def harmonize_diagnosis(self, text: str) -> str:
        """
        Harmonise les diagnostics selon le mapping

        Args:
            text: Diagnostic à harmoniser

        Returns:
            Diagnostic harmonisé
        """
        if pd.isna(text) or text == '':
            return ''

        text = str(text).strip()

        # Recherche dans le mapping (insensible à la casse)
        for original, harmonized in self.mapping_diagnostics.items():
            if text.lower() == original.lower():
                if text != harmonized:
                    self.stats['diagnostics_harmonized'] += 1
                return harmonized

        # Si pas trouvé dans le mapping, nettoyer le texte
        return self.clean_text(text)

    def harmonize_ssp(self, text: str) -> str:
        """
        Harmonise les symptômes/plaintes selon le mapping

        Args:
            text: SSP à harmoniser

        Returns:
            SSP harmonisé
        """
        if pd.isna(text) or text == '':
            return ''

        text = str(text).strip()

        # Recherche dans le mapping (insensible à la casse)
        for original, harmonized in self.mapping_ssp.items():
            if text.lower() == original.lower():
                return harmonized

        # Si pas trouvé dans le mapping, nettoyer le texte
        return self.clean_text(text)

    def fill_empty_cells(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Remplit les cellules vides en se basant sur le contexte

        Args:
            df: DataFrame à compléter

        Returns:
            DataFrame avec cellules remplies
        """
        print("\n🔧 Remplissage des cellules vides...")

        filled_count = 0

        # Stratégies de remplissage par colonne
        for idx, row in df.iterrows():
            # Si le diagnostic générique est vide mais que le principal existe
            if pd.isna(row['Diagnostic générique']) and not pd.isna(row['Diagnostic principal']):
                # Extraire le diagnostic générique du principal
                diag = str(row['Diagnostic principal'])
                if diag in self.mapping_diagnostics.values():
                    df.at[idx, 'Diagnostic générique'] = diag
                    filled_count += 1

            # Si la catégorie est vide, essayer de la déduire
            if pd.isna(row['Catégorie']):
                # Regarder les lignes voisines avec la même année
                same_year = df[df['Année'] == row['Année']]
                if len(same_year) > 0:
                    most_common = same_year['Catégorie'].mode()
                    if len(most_common) > 0:
                        df.at[idx, 'Catégorie'] = most_common[0]
                        filled_count += 1

            # Si SSP est vide mais Description contient des symptômes
            if pd.isna(row['SSP']) and not pd.isna(row['Description']):
                desc = str(row['Description']).lower()
                # Rechercher des symptômes dans la description
                for symptom in self.mapping_ssp.keys():
                    if symptom.lower() in desc:
                        df.at[idx, 'SSP'] = self.mapping_ssp[symptom]
                        filled_count += 1
                        break

        self.stats['empty_cells_filled'] = filled_count
        print(f"✓ {filled_count} cellules vides remplies")
        return df

    def create_thematic_groups(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crée des groupes thématiques pour les diagnostics

        Args:
            df: DataFrame à enrichir

        Returns:
            DataFrame avec groupes thématiques
        """
        print("\n📊 Création des groupes thématiques...")

        # Définir les groupes thématiques
        thematic_groups = {
            'Cardiovasculaire': [
                'Hypertension artérielle', 'Infarctus du myocarde',
                'Syndrome coronarien aigu', 'Insuffisance cardiaque',
                'Accident vasculaire cérébral', 'Accident ischémique transitoire'
            ],
            'Endocrinologie': [
                'Diabète de type 1', 'Diabète de type 2',
                'Hypothyroïdie', 'Hyperthyroïdie'
            ],
            'Pneumologie': [
                'Asthme', 'BPCO', 'Pneumonie', 'Cancer du poumon'
            ],
            'Gastro-entérologie': [
                'Appendicite', 'Cholécystite', 'Pancréatite',
                'Hépatite', 'Cirrhose', 'Maladie de Crohn',
                'Rectocolite hémorragique', 'Cancer colorectal',
                'Maladie inflammatoire chronique intestinale'
            ],
            'Neurologie': [
                'Épilepsie', 'Maladie de Parkinson', 'Maladie d\'Alzheimer',
                'Sclérose en plaques', 'Migraine', 'Céphalée'
            ],
            'Psychiatrie': [
                'Dépression', 'Trouble anxieux'
            ],
            'Rhumatologie': [
                'Polyarthrite rhumatoïde', 'Lupus érythémateux systémique',
                'Lombalgie'
            ],
            'Urologie/Néphrologie': [
                'Infection urinaire', 'Pyélonéphrite'
            ],
            'Gynécologie-Obstétrique': [
                'Grossesse', 'Cancer du sein'
            ],
            'Hématologie': [
                'Anémie', 'Anémie ferriprive'
            ],
            'Infectiologie': [
                'VIH/SIDA', 'COVID-19'
            ],
            'Oncologie': [
                'Cancer du sein', 'Cancer colorectal', 'Cancer du poumon'
            ]
        }

        # Fonction pour assigner un groupe thématique
        def get_thematic_group(diagnosis):
            if pd.isna(diagnosis):
                return 'Non classé'

            diagnosis = str(diagnosis)
            for group, diagnoses in thematic_groups.items():
                if diagnosis in diagnoses:
                    return group
            return 'Autre'

        # Appliquer le groupement
        df['Groupe_Thematique'] = df['Diagnostic principal harmonisé'].apply(get_thematic_group)

        # Statistiques des groupes
        group_stats = df['Groupe_Thematique'].value_counts()
        print("✓ Répartition des groupes thématiques:")
        for group, count in group_stats.items():
            print(f"  - {group}: {count} cas")

        return df

    def detect_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Détecte et marque les doublons potentiels

        Args:
            df: DataFrame à analyser

        Returns:
            DataFrame avec marquage des doublons
        """
        print("\n🔍 Détection des doublons...")

        # Colonnes à vérifier pour les doublons
        duplicate_cols = ['Station', 'SSP harmonisé', 'Diagnostic principal harmonisé']

        # Identifier les doublons
        df['Est_Doublon'] = df.duplicated(subset=duplicate_cols, keep='first')

        duplicates = df[df['Est_Doublon'] == True]
        self.stats['duplicates_found'] = len(duplicates)

        print(f"✓ {self.stats['duplicates_found']} doublons potentiels détectés")

        if len(duplicates) > 0:
            print("  Exemples de doublons:")
            for idx, row in duplicates.head(3).iterrows():
                print(f"  - Station {row['Station']}: {row['Diagnostic principal harmonisé']}")

        return df

    def clean_and_harmonize(self) -> pd.DataFrame:
        """
        Applique tout le pipeline de nettoyage et d'harmonisation

        Returns:
            DataFrame nettoyé et harmonisé
        """
        print("\n" + "="*60)
        print("🚀 DÉBUT DU NETTOYAGE ET DE L'HARMONISATION")
        print("="*60)

        # Charger les données
        self.load_data()

        # Créer les mappings
        self.create_diagnostic_mappings()
        self.create_icd10_mapping()

        # Créer une copie pour le nettoyage
        self.df_clean = self.df.copy()

        # 1. Nettoyer toutes les colonnes textuelles
        print("\n📝 Nettoyage typographique...")
        text_columns = ['Station', 'SSP', 'Diagnostic générique',
                       'Diagnostic principal', 'Diagnostics différentiels',
                       'Description', 'Anamnèse', 'Status', 'Management']

        for col in text_columns:
            if col in self.df_clean.columns:
                self.df_clean[col] = self.df_clean[col].apply(lambda x: self.clean_text(x))
                self.df_clean[col] = self.df_clean[col].apply(lambda x: self.correct_typos(x, col))

        # 2. Harmoniser les diagnostics et SSP
        print("\n🏥 Harmonisation des diagnostics...")
        self.df_clean['Diagnostic principal harmonisé'] = self.df_clean['Diagnostic principal'].apply(
            self.harmonize_diagnosis
        )
        self.df_clean['Diagnostic générique harmonisé'] = self.df_clean['Diagnostic générique'].apply(
            self.harmonize_diagnosis
        )
        self.df_clean['SSP harmonisé'] = self.df_clean['SSP'].apply(self.harmonize_ssp)

        # 3. Ajouter les codes ICD-10
        print("\n🔢 Ajout des codes ICD-10...")
        self.df_clean['Code_ICD10'] = self.df_clean['Diagnostic principal harmonisé'].apply(
            lambda x: self.icd10_mapping.get(x, '')
        )

        # 4. Remplir les cellules vides
        self.df_clean = self.fill_empty_cells(self.df_clean)

        # 5. Créer les groupes thématiques
        self.df_clean = self.create_thematic_groups(self.df_clean)

        # 6. Détecter les doublons
        self.df_clean = self.detect_duplicates(self.df_clean)

        # 7. Réorganiser les colonnes
        print("\n📊 Réorganisation des colonnes...")
        column_order = [
            'Année', 'Catégorie', 'Station',
            'SSP', 'SSP harmonisé',
            'Diagnostic générique', 'Diagnostic générique harmonisé',
            'Diagnostic principal', 'Diagnostic principal harmonisé',
            'Code_ICD10', 'Groupe_Thematique',
            'Diagnostics différentiels',
            'Description', 'Anamnèse', 'Status', 'Management',
            'Est_Doublon'
        ]

        # Ne garder que les colonnes qui existent
        column_order = [col for col in column_order if col in self.df_clean.columns]
        self.df_clean = self.df_clean[column_order]

        print("✓ Colonnes réorganisées")

        return self.df_clean

    def export_results(self) -> Tuple[str, str, str]:
        """
        Exporte les résultats dans différents formats

        Returns:
            Tuple des chemins des fichiers exportés
        """
        print("\n💾 Export des résultats...")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # 1. Export CSV principal
        output_csv = self.output_dir / f"ECOS_Cas_Harmonise_{timestamp}.csv"
        self.df_clean.to_csv(output_csv, index=False, encoding='utf-8', sep=';')
        print(f"✓ Fichier CSV exporté: {output_csv}")

        # 2. Export Excel avec plusieurs feuilles
        output_excel = self.output_dir / f"ECOS_Cas_Harmonise_{timestamp}.xlsx"
        with pd.ExcelWriter(output_excel, engine='openpyxl') as writer:
            # Feuille principale
            self.df_clean.to_excel(writer, sheet_name='Données harmonisées', index=False)

            # Feuille des statistiques
            stats_df = pd.DataFrame([self.stats])
            stats_df.to_excel(writer, sheet_name='Statistiques', index=False)

            # Feuille des mappings diagnostics
            mapping_df = pd.DataFrame(
                list(self.mapping_diagnostics.items()),
                columns=['Original', 'Harmonisé']
            )
            mapping_df.to_excel(writer, sheet_name='Mapping Diagnostics', index=False)

            # Feuille des codes ICD-10
            icd_df = pd.DataFrame(
                list(self.icd10_mapping.items()),
                columns=['Diagnostic', 'Code ICD-10']
            )
            icd_df.to_excel(writer, sheet_name='Codes ICD-10', index=False)

            # Analyse par groupe thématique
            group_analysis = self.df_clean.groupby('Groupe_Thematique').agg({
                'Station': 'count',
                'Année': ['min', 'max']
            }).round(2)
            group_analysis.columns = ['Nombre_cas', 'Année_min', 'Année_max']
            group_analysis.to_excel(writer, sheet_name='Analyse par groupe')

        print(f"✓ Fichier Excel exporté: {output_excel}")

        # 3. Export JSON pour intégration
        output_json = self.output_dir / f"ECOS_Cas_Harmonise_{timestamp}.json"

        # Préparer les données pour JSON
        json_data = {
            'metadata': {
                'timestamp': timestamp,
                'total_rows': self.stats['total_rows'],
                'statistics': self.stats
            },
            'cases': self.df_clean.to_dict(orient='records'),
            'mappings': {
                'diagnostics': self.mapping_diagnostics,
                'ssp': self.mapping_ssp,
                'icd10': self.icd10_mapping
            }
        }

        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

        print(f"✓ Fichier JSON exporté: {output_json}")

        return str(output_csv), str(output_excel), str(output_json)

    def generate_report(self) -> str:
        """
        Génère un rapport détaillé du nettoyage

        Returns:
            Chemin du fichier rapport
        """
        print("\n📄 Génération du rapport...")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = self.output_dir / f"ECOS_Rapport_Harmonisation_{timestamp}.txt"

        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("="*60 + "\n")
            f.write("RAPPORT D'HARMONISATION DES CAS ECOS\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*60 + "\n\n")

            f.write("STATISTIQUES GÉNÉRALES\n")
            f.write("-"*30 + "\n")
            f.write(f"Nombre total de lignes: {self.stats['total_rows']}\n")
            f.write(f"Cellules vides remplies: {self.stats['empty_cells_filled']}\n")
            f.write(f"Diagnostics harmonisés: {self.stats['diagnostics_harmonized']}\n")
            f.write(f"Fautes corrigées: {self.stats['typos_corrected']}\n")
            f.write(f"Doublons détectés: {self.stats['duplicates_found']}\n\n")

            f.write("RÉPARTITION PAR ANNÉE\n")
            f.write("-"*30 + "\n")
            year_counts = self.df_clean['Année'].value_counts().sort_index()
            for year, count in year_counts.items():
                f.write(f"  {year}: {count} cas\n")

            f.write("\nRÉPARTITION PAR GROUPE THÉMATIQUE\n")
            f.write("-"*30 + "\n")
            group_counts = self.df_clean['Groupe_Thematique'].value_counts()
            for group, count in group_counts.items():
                percentage = (count / len(self.df_clean)) * 100
                f.write(f"  {group}: {count} cas ({percentage:.1f}%)\n")

            f.write("\nTOP 10 DES DIAGNOSTICS LES PLUS FRÉQUENTS\n")
            f.write("-"*30 + "\n")
            top_diag = self.df_clean['Diagnostic principal harmonisé'].value_counts().head(10)
            for i, (diag, count) in enumerate(top_diag.items(), 1):
                f.write(f"  {i}. {diag}: {count} cas\n")

            f.write("\nTOP 10 DES SYMPTÔMES LES PLUS FRÉQUENTS\n")
            f.write("-"*30 + "\n")
            top_ssp = self.df_clean['SSP harmonisé'].value_counts().head(10)
            for i, (ssp, count) in enumerate(top_ssp.items(), 1):
                f.write(f"  {i}. {ssp}: {count} cas\n")

            f.write("\nQUALITÉ DES DONNÉES\n")
            f.write("-"*30 + "\n")

            # Calculer le taux de remplissage par colonne
            for col in self.df_clean.columns:
                non_empty = self.df_clean[col].notna().sum()
                percentage = (non_empty / len(self.df_clean)) * 100
                f.write(f"  {col}: {percentage:.1f}% rempli\n")

            f.write("\nCOHÉRENCE DES DONNÉES\n")
            f.write("-"*30 + "\n")

            # Vérifier la cohérence entre diagnostic générique et principal
            coherent = 0
            for idx, row in self.df_clean.iterrows():
                if not pd.isna(row['Diagnostic générique harmonisé']) and not pd.isna(row['Diagnostic principal harmonisé']):
                    if row['Diagnostic générique harmonisé'] in row['Diagnostic principal harmonisé'] or \
                       row['Diagnostic principal harmonisé'] in row['Diagnostic générique harmonisé']:
                        coherent += 1

            coherence_rate = (coherent / len(self.df_clean)) * 100
            f.write(f"  Cohérence diagnostic générique/principal: {coherence_rate:.1f}%\n")

            # Vérifier la présence de codes ICD-10
            icd_filled = self.df_clean['Code_ICD10'].notna().sum()
            icd_rate = (icd_filled / len(self.df_clean)) * 100
            f.write(f"  Couverture ICD-10: {icd_rate:.1f}%\n")

            f.write("\n" + "="*60 + "\n")
            f.write("FIN DU RAPPORT\n")
            f.write("="*60 + "\n")

        print(f"✓ Rapport généré: {report_file}")
        return str(report_file)

def main():
    """Fonction principale"""
    print("\n" + "="*60)
    print("   HARMONISATION DES CAS ECOS - DÉMARRAGE")
    print("="*60 + "\n")

    # Chemin du fichier d'entrée
    input_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_propre.csv"

    # Créer l'instance du harmonisateur
    harmonizer = ECOSDataHarmonizer(input_file)

    try:
        # Exécuter le pipeline de nettoyage
        harmonizer.clean_and_harmonize()

        # Exporter les résultats
        csv_file, excel_file, json_file = harmonizer.export_results()

        # Générer le rapport
        report_file = harmonizer.generate_report()

        # Résumé final
        print("\n" + "="*60)
        print("✅ HARMONISATION TERMINÉE AVEC SUCCÈS")
        print("="*60)
        print("\n📊 RÉSUMÉ DES OPÉRATIONS:")
        print(f"  • Lignes traitées: {harmonizer.stats['total_rows']}")
        print(f"  • Cellules vides remplies: {harmonizer.stats['empty_cells_filled']}")
        print(f"  • Diagnostics harmonisés: {harmonizer.stats['diagnostics_harmonized']}")
        print(f"  • Fautes corrigées: {harmonizer.stats['typos_corrected']}")
        print(f"  • Doublons détectés: {harmonizer.stats['duplicates_found']}")

        print("\n📁 FICHIERS GÉNÉRÉS:")
        print(f"  • CSV harmonisé: {csv_file}")
        print(f"  • Excel multi-feuilles: {excel_file}")
        print(f"  • JSON structuré: {json_file}")
        print(f"  • Rapport détaillé: {report_file}")

        print("\n✨ Toutes les données ont été nettoyées et harmonisées avec succès!")

    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())