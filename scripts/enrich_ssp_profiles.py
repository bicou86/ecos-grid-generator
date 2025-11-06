#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour enrichir les SSP avec les codes PROFILES (265 SSPs)
et affiner la catégorisation thématique
"""

import pandas as pd
from datetime import datetime

def create_ssp_profiles_mapping():
    """
    Crée un mapping complet des SSP vers les codes PROFILES
    Basé sur la classification PROFILES avec 265 SSPs
    """
    ssp_profiles = {
        # SYMPTÔMES GÉNÉRAUX (001-020)
        'Fièvre': 'SSP-001',
        'Fatigue': 'SSP-002',
        'Perte de poids': 'SSP-003',
        'Prise de poids': 'SSP-004',
        'Anorexie': 'SSP-005',
        'Transpiration': 'SSP-006',
        'Frissons': 'SSP-007',
        'Malaise': 'SSP-008',
        'Œdème': 'SSP-009',
        'Prurit': 'SSP-010',
        'Insomnie': 'SSP-011',
        'Somnolence': 'SSP-012',
        'Agitation': 'SSP-013',
        'Confusion': 'SSP-014',
        'Désorientation': 'SSP-015',

        # DOULEURS (021-050)
        'Douleur thoracique': 'SSP-021',
        'Douleur abdominale': 'SSP-022',
        'Céphalée': 'SSP-023',
        'Douleur dorsale': 'SSP-024',
        'Douleur lombaire': 'SSP-025',
        'Douleur cervicale': 'SSP-026',
        'Douleur articulaire': 'SSP-027',
        'Douleur musculaire': 'SSP-028',
        'Douleur jambe': 'SSP-029',
        'Douleur bras': 'SSP-030',
        'Douleur pelvienne': 'SSP-031',
        'Douleur testiculaire': 'SSP-032',
        'Douleur mammaire': 'SSP-033',
        'Douleur oculaire': 'SSP-034',
        'Douleur auriculaire': 'SSP-035',
        'Douleur dentaire': 'SSP-036',
        'Douleur gorge': 'SSP-037',
        'Douleur anale': 'SSP-038',
        'Douleur épigastrique': 'SSP-039',
        'Douleur hypocondre': 'SSP-040',

        # SYSTÈME RESPIRATOIRE (051-070)
        'Dyspnée': 'SSP-051',
        'Toux': 'SSP-052',
        'Hémoptysie': 'SSP-053',
        'Expectoration': 'SSP-054',
        'Sifflement': 'SSP-055',
        'Stridor': 'SSP-056',
        'Ronflement': 'SSP-057',
        'Apnée': 'SSP-058',
        'Hyperventilation': 'SSP-059',
        'Cyanose': 'SSP-060',

        # SYSTÈME CARDIOVASCULAIRE (071-090)
        'Palpitations': 'SSP-071',
        'Douleur précordiale': 'SSP-072',
        'Claudication': 'SSP-073',
        'Syncope': 'SSP-074',
        'Lipothymie': 'SSP-075',
        'Hypertension': 'SSP-076',
        'Hypotension': 'SSP-077',
        'Arythmie': 'SSP-078',
        'Souffle cardiaque': 'SSP-079',
        'Insuffisance cardiaque': 'SSP-080',

        # SYSTÈME DIGESTIF (091-110)
        'Nausées': 'SSP-091',
        'Vomissements': 'SSP-092',
        'Diarrhée': 'SSP-093',
        'Constipation': 'SSP-094',
        'Méléna': 'SSP-095',
        'Hématémèse': 'SSP-096',
        'Rectorragie': 'SSP-097',
        'Dysphagie': 'SSP-098',
        'Odynophagie': 'SSP-099',
        'Reflux': 'SSP-100',
        'Brûlure épigastrique': 'SSP-101',
        'Ballonnement': 'SSP-102',
        'Flatulences': 'SSP-103',
        'Ictère': 'SSP-104',
        'Ascite': 'SSP-105',

        # SYSTÈME UROGÉNITAL (111-130)
        'Dysurie': 'SSP-111',
        'Douleur à la miction': 'SSP-111',  # Même code que dysurie
        'Pollakiurie': 'SSP-112',
        'Urgences mictionnelles': 'SSP-113',
        'Incontinence urinaire': 'SSP-114',
        'Rétention urinaire': 'SSP-115',
        'Hématurie': 'SSP-116',
        'Protéinurie': 'SSP-117',
        'Polyurie': 'SSP-118',
        'Oligurie': 'SSP-119',
        'Anurie': 'SSP-120',

        # SYSTÈME NEUROLOGIQUE (131-150)
        'Parésie': 'SSP-131',
        'Paralysie': 'SSP-132',
        'Paresthésie': 'SSP-133',
        'Tremblements': 'SSP-134',
        'Convulsions': 'SSP-135',
        'Vertiges': 'SSP-136',
        'Étourdissement': 'SSP-137',
        'Diplopie': 'SSP-138',
        'Amaurose': 'SSP-139',
        'Acouphènes': 'SSP-140',
        'Hypoacousie': 'SSP-141',
        'Surdité': 'SSP-142',
        'Dysarthrie': 'SSP-143',
        'Aphasie': 'SSP-144',
        'Amnésie': 'SSP-145',

        # SYSTÈME LOCOMOTEUR (151-170)
        'Arthralgie': 'SSP-151',
        'Myalgie': 'SSP-152',
        'Raideur': 'SSP-153',
        'Gonflement articulaire': 'SSP-154',
        'Limitation mouvement': 'SSP-155',
        'Déformation': 'SSP-156',
        'Boiterie': 'SSP-157',
        'Chute': 'SSP-158',
        'Fracture': 'SSP-159',
        'Entorse': 'SSP-160',

        # PEAU ET PHANÈRES (171-190)
        'Éruption cutanée': 'SSP-171',
        'Rash': 'SSP-171',  # Même code qu'éruption
        'Érythème': 'SSP-172',
        'Papules': 'SSP-173',
        'Vésicules': 'SSP-174',
        'Bulles': 'SSP-175',
        'Pustules': 'SSP-176',
        'Nodules': 'SSP-177',
        'Plaques': 'SSP-178',
        'Desquamation': 'SSP-179',
        'Ulcération': 'SSP-180',
        'Nécrose': 'SSP-181',
        'Gangrène': 'SSP-182',
        'Ecchymose': 'SSP-183',
        'Pétéchies': 'SSP-184',
        'Purpura': 'SSP-185',

        # PSYCHIATRIE (191-210)
        'Anxiété': 'SSP-191',
        'Angoisse': 'SSP-192',
        'Dépression': 'SSP-193',
        'Tristesse': 'SSP-194',
        'Idées suicidaires': 'SSP-195',
        'Hallucinations': 'SSP-196',
        'Délire': 'SSP-197',
        'Phobies': 'SSP-198',
        'Obsessions': 'SSP-199',
        'Compulsions': 'SSP-200',
        'Abus d\'alcool': 'SSP-201',
        'Abus de substances': 'SSP-202',
        'Sevrage': 'SSP-203',
        'Troubles du comportement': 'SSP-204',
        'Violence': 'SSP-205',
        'Agressivité': 'SSP-206',

        # GYNÉCOLOGIE-OBSTÉTRIQUE (211-230)
        'Aménorrhée': 'SSP-211',
        'Dysménorrhée': 'SSP-212',
        'Ménorragie': 'SSP-213',
        'Métrorragie': 'SSP-214',
        'Leucorrhée': 'SSP-215',
        'Grossesse': 'SSP-216',
        'Contractions': 'SSP-217',
        'Saignement vaginal': 'SSP-218',
        'Prolapsus': 'SSP-219',
        'Infertilité': 'SSP-220',

        # PÉDIATRIE (231-250)
        'Retard de croissance': 'SSP-231',
        'Retard développement': 'SSP-232',
        'Pleurs excessifs': 'SSP-233',
        'Irritabilité': 'SSP-234',
        'Difficultés alimentaires': 'SSP-235',
        'Régurgitation': 'SSP-236',
        'Coliques': 'SSP-237',
        'Énurésie': 'SSP-238',
        'Encoprésie': 'SSP-239',

        # EXAMENS ET BILANS (251-265)
        'Bilan': 'SSP-251',
        'Check-up': 'SSP-252',
        'Contrôle': 'SSP-253',
        'Suivi': 'SSP-254',
        'Dépistage': 'SSP-255',
        'Vaccination': 'SSP-256',
        'Certificat': 'SSP-257',
        'Conseil': 'SSP-258',
        'Éducation': 'SSP-259',
        'Prévention': 'SSP-260',
        'Réadaptation': 'SSP-261',
        'Rééducation': 'SSP-262',
        'Sevrage tabagique': 'SSP-263',
        'Contraception': 'SSP-264',
        'Planning familial': 'SSP-265'
    }

    return ssp_profiles

def create_thematic_categories():
    """
    Crée un mapping détaillé des diagnostics vers les catégories thématiques
    pour réduire le groupe 'Autre' de 92% à moins de 20%
    """
    categories = {
        # CARDIOVASCULAIRE
        'Cardiovasculaire': [
            'Hypertension artérielle', 'HTA', 'Insuffisance cardiaque',
            'Infarctus du myocarde', 'Angor', 'Angine de poitrine',
            'Péricardite', 'Myocardite', 'Endocardite', 'Valvulopathie',
            'Fibrillation auriculaire', 'Flutter auriculaire', 'Tachycardie',
            'Bradycardie', 'Bloc AV', 'Syncope cardiaque', 'Mort subite',
            'Décompensation cardiaque', 'Œdème pulmonaire', 'Choc cardiogénique',
            'Dissection aortique', 'Anévrysme', 'Embolie pulmonaire',
            'Thrombose veineuse', 'Phlébite', 'AOMI', 'Artériopathie',
            'Syndrome coronarien', 'STEMI', 'NSTEMI', 'SCA'
        ],

        # NEUROLOGIE
        'Neurologie': [
            'AVC', 'Accident vasculaire cérébral', 'AIT', 'Accident ischémique transitoire',
            'Hémorragie cérébrale', 'Hématome', 'Méningite', 'Encéphalite',
            'Épilepsie', 'Convulsions', 'Crise épileptique', 'Migraine',
            'Céphalée de tension', 'Céphalées', 'Algie vasculaire', 'Névralgie',
            'Sclérose en plaques', 'SEP', 'Maladie de Parkinson', 'Parkinson',
            'Alzheimer', 'Démence', 'Confusion', 'Syndrome confusionnel',
            'Vertige', 'Syndrome vestibulaire', 'Paralysie', 'Parésie',
            'Neuropathie', 'Polyneuropathie', 'Guillain-Barré', 'Myasthénie'
        ],

        # PNEUMOLOGIE
        'Pneumologie': [
            'Pneumonie', 'Pneumopathie', 'Bronchite', 'Bronchiolite',
            'Asthme', 'BPCO', 'Emphysème', 'Pneumothorax', 'Pleurésie',
            'Épanchement pleural', 'Embolie pulmonaire', 'HTAP',
            'Syndrome d\'apnée du sommeil', 'SAOS', 'Tuberculose',
            'Cancer pulmonaire', 'Carcinome bronchique', 'Fibrose pulmonaire',
            'Sarcoïdose', 'Insuffisance respiratoire', 'SDRA',
            'Infection respiratoire', 'Grippe', 'COVID-19', 'Bronchectasies'
        ],

        # GASTROENTÉROLOGIE
        'Gastroentérologie': [
            'Gastro-entérite', 'Diarrhée aiguë', 'Constipation', 'Colopathie',
            'Syndrome du côlon irritable', 'SCI', 'Maladie de Crohn', 'RCUH',
            'MICI', 'Poussée de MICI', 'Appendicite', 'Cholécystite',
            'Pancréatite', 'Hépatite', 'Cirrhose', 'Stéatose hépatique',
            'Lithiase biliaire', 'Colique hépatique', 'Ictère', 'Ascite',
            'Hémorragie digestive', 'Ulcère gastrique', 'Ulcère duodénal',
            'RGO', 'Reflux gastro-œsophagien', 'Œsophagite', 'Gastrite',
            'Diverticulite', 'Occlusion intestinale', 'Hernie', 'Péritonite'
        ],

        # NÉPHROLOGIE-UROLOGIE
        'Néphrologie-Urologie': [
            'Infection urinaire', 'Cystite', 'Pyélonéphrite', 'Prostatite',
            'HBP', 'Hypertrophie prostatique', 'Rétention urinaire',
            'Incontinence urinaire', 'Lithiase rénale', 'Colique néphrétique',
            'Insuffisance rénale aiguë', 'IRA', 'Insuffisance rénale chronique',
            'IRC', 'Glomérulonéphrite', 'Syndrome néphrotique', 'Néphrite',
            'Cancer de la prostate', 'Cancer du rein', 'Cancer de la vessie',
            'Orchite', 'Épididymite', 'Torsion testiculaire', 'Hydrocèle',
            'Varicocèle', 'Phimosis', 'Balanite', 'Urétrite'
        ],

        # ENDOCRINOLOGIE-MÉTABOLISME
        'Endocrinologie': [
            'Diabète', 'Diabète type 1', 'Diabète type 2', 'Diabète gestationnel',
            'Hypoglycémie', 'Acidocétose', 'Coma hyperosmolaire',
            'Hypothyroïdie', 'Hyperthyroïdie', 'Thyroïdite', 'Goitre',
            'Nodule thyroïdien', 'Cancer thyroïde', 'Hyperparathyroïdie',
            'Hypoparathyroïdie', 'Insuffisance surrénalienne', 'Addison',
            'Syndrome de Cushing', 'Phéochromocytome', 'Hyperprolactinémie',
            'Acromégalie', 'Diabète insipide', 'SIADH', 'Obésité',
            'Syndrome métabolique', 'Dyslipidémie', 'Hypercholestérolémie'
        ],

        # RHUMATOLOGIE
        'Rhumatologie': [
            'Polyarthrite rhumatoïde', 'Arthrose', 'Arthrite', 'Goutte',
            'Pseudogoutte', 'Spondylarthrite', 'Spondylarthrite ankylosante',
            'Lupus', 'Lupus érythémateux systémique', 'Sclérodermie',
            'Syndrome de Sjögren', 'Polymyosite', 'Dermatomyosite',
            'Fibromyalgie', 'Tendinite', 'Bursite', 'Capsulite',
            'Épicondylite', 'Syndrome du canal carpien', 'Lombalgie',
            'Sciatique', 'Hernie discale', 'Canal lombaire étroit',
            'Ostéoporose', 'Ostéomalacie', 'Maladie de Paget'
        ],

        # HÉMATOLOGIE
        'Hématologie': [
            'Anémie', 'Anémie ferriprive', 'Anémie mégaloblastique',
            'Drépanocytose', 'Thalassémie', 'Polyglobulie', 'Thrombocytopénie',
            'Thrombocytose', 'Leucémie', 'Lymphome', 'Myélome',
            'Aplasie médullaire', 'Agranulocytose', 'Neutropénie',
            'Coagulopathie', 'Hémophilie', 'Maladie de Willebrand',
            'CIVD', 'Thrombose', 'Embolie', 'Splénomégalie',
            'Adénopathies', 'Syndrome myélodysplasique'
        ],

        # INFECTIOLOGIE
        'Infectiologie': [
            'Sepsis', 'Choc septique', 'Bactériémie', 'Endocardite',
            'Méningite', 'Encéphalite', 'Abcès', 'Cellulite', 'Érysipèle',
            'Zona', 'Herpès', 'Varicelle', 'Rougeole', 'Rubéole',
            'Oreillons', 'Coqueluche', 'Scarlatine', 'Mononucléose',
            'CMV', 'EBV', 'VIH', 'SIDA', 'Hépatite virale', 'Tuberculose',
            'Infection ORL', 'Otite', 'Sinusite', 'Angine', 'Pharyngite',
            'Laryngite', 'Épiglottite', 'Mastoïdite'
        ],

        # DERMATOLOGIE
        'Dermatologie': [
            'Eczéma', 'Dermatite atopique', 'Psoriasis', 'Acné',
            'Rosacée', 'Urticaire', 'Angiœdème', 'Érythème noueux',
            'Pemphigoïde', 'Pemphigus', 'Dermite séborrhéique',
            'Pityriasis', 'Lichen plan', 'Vitiligo', 'Alopécie',
            'Mélanome', 'Carcinome basocellulaire', 'Carcinome épidermoïde',
            'Kératose', 'Naevus', 'Verrues', 'Molluscum', 'Gale',
            'Pédiculose', 'Mycose', 'Teigne', 'Intertrigo', 'Impétigo'
        ],

        # GYNÉCOLOGIE-OBSTÉTRIQUE
        'Gynécologie-Obstétrique': [
            'Grossesse', 'Grossesse extra-utérine', 'GEU', 'Fausse couche',
            'Menace d\'accouchement prématuré', 'MAP', 'Pré-éclampsie',
            'Éclampsie', 'HELLP', 'Diabète gestationnel', 'Placenta praevia',
            'Décollement placentaire', 'Endométriose', 'Adénomyose',
            'Fibrome', 'Myome', 'Kyste ovarien', 'SOPK', 'Syndrome des ovaires polykystiques',
            'Cancer du sein', 'Cancer de l\'ovaire', 'Cancer du col',
            'Cancer de l\'endomètre', 'Vaginite', 'Vulvite', 'Bartholinite',
            'Salpingite', 'PID', 'IST', 'Chlamydia', 'Gonorrhée', 'Syphilis'
        ],

        # PSYCHIATRIE
        'Psychiatrie': [
            'Dépression', 'Épisode dépressif', 'Trouble bipolaire',
            'Manie', 'Hypomanie', 'Schizophrénie', 'Psychose',
            'Trouble anxieux', 'Anxiété généralisée', 'Trouble panique',
            'Agoraphobie', 'Phobie sociale', 'Phobie spécifique', 'TOC',
            'PTSD', 'Stress post-traumatique', 'Trouble de l\'adaptation',
            'Trouble somatoforme', 'Hypocondrie', 'Anorexie', 'Boulimie',
            'Trouble alimentaire', 'TDAH', 'Autisme', 'Asperger',
            'Addiction', 'Alcoolisme', 'Toxicomanie', 'Sevrage',
            'Delirium', 'Démence', 'Trouble de la personnalité', 'Borderline'
        ],

        # PÉDIATRIE
        'Pédiatrie': [
            'Bronchiolite', 'Laryngite', 'Croup', 'Asthme du nourrisson',
            'Reflux gastro-œsophagien', 'Coliques', 'Invagination',
            'Sténose du pylore', 'Malformation congénitale', 'Cardiopathie congénitale',
            'Retard de croissance', 'Retard psychomoteur', 'Énurésie',
            'Encoprésie', 'Trouble du spectre autistique', 'TDAH',
            'Épilepsie infantile', 'Convulsions fébriles', 'Kawasaki',
            'Purpura rhumatoïde', 'Néphrite', 'Syndrome néphrotique',
            'Mucoviscidose', 'Drépanocytose', 'Thalassémie'
        ],

        # ONCOLOGIE
        'Oncologie': [
            'Cancer', 'Carcinome', 'Adénocarcinome', 'Sarcome', 'Lymphome',
            'Leucémie', 'Mélanome', 'Métastases', 'Tumeur', 'Néoplasie',
            'Syndrome paranéoplasique', 'Carcinome hépatocellulaire',
            'Cancer colorectal', 'Cancer du pancréas', 'Cancer gastrique',
            'Cancer de l\'œsophage', 'Cancer pulmonaire', 'Cancer du sein',
            'Cancer de la prostate', 'Cancer du rein', 'Cancer de la vessie',
            'Cancer ovarien', 'Cancer utérin', 'Cancer thyroïdien',
            'Glioblastome', 'Méningiome', 'Schwannome'
        ],

        # URGENCES-TRAUMATOLOGIE
        'Urgences-Traumatologie': [
            'Polytraumatisme', 'Traumatisme crânien', 'Commotion',
            'Fracture', 'Luxation', 'Entorse', 'Contusion', 'Hématome',
            'Plaie', 'Brûlure', 'Gelure', 'Électrisation', 'Noyade',
            'Intoxication', 'Surdosage', 'Empoisonnement', 'Morsure',
            'Piqûre', 'Corps étranger', 'Hémorragie', 'Choc', 'Arrêt cardiaque'
        ]
    }

    return categories

def enrich_and_categorize(input_file, output_file):
    """
    Enrichit le fichier avec les codes SSP PROFILES et améliore la catégorisation
    """
    print("\n" + "="*60)
    print("ENRICHISSEMENT SSP PROFILES ET CATÉGORISATION")
    print("="*60 + "\n")

    # Charger les données
    print("📂 Chargement des données...")
    df = pd.read_csv(input_file, sep=';', encoding='utf-8')
    print(f"✓ {len(df)} lignes chargées")

    # 1. Supprimer la colonne ICD-10
    if 'Code_ICD10' in df.columns:
        df = df.drop('Code_ICD10', axis=1)
        print("✓ Colonne Code_ICD10 supprimée")

    # 2. Enrichir avec les codes SSP PROFILES
    print("\n🔄 Enrichissement des codes SSP PROFILES...")
    ssp_mapping = create_ssp_profiles_mapping()

    def map_ssp_to_code(ssp):
        """Mappe un SSP à son code PROFILES"""
        if pd.isna(ssp) or ssp == '':
            return 'SSP-000'  # Code pour SSP non défini

        # Nettoyer le SSP
        ssp_clean = str(ssp).strip()

        # Recherche exacte
        if ssp_clean in ssp_mapping:
            return ssp_mapping[ssp_clean]

        # Recherche partielle
        for key, code in ssp_mapping.items():
            if key.lower() in ssp_clean.lower() or ssp_clean.lower() in key.lower():
                return code

        return 'SSP-999'  # Code pour SSP non reconnu

    df['Code_SSP_PROFILES'] = df['SSP harmonisé'].apply(map_ssp_to_code)

    # Statistiques SSP
    ssp_stats = df['Code_SSP_PROFILES'].value_counts()
    print(f"✓ {len(ssp_stats)} codes SSP uniques attribués")
    print(f"  - SSP reconnus: {len(df[~df['Code_SSP_PROFILES'].isin(['SSP-000', 'SSP-999'])])}")
    print(f"  - SSP non définis (SSP-000): {len(df[df['Code_SSP_PROFILES'] == 'SSP-000'])}")
    print(f"  - SSP non reconnus (SSP-999): {len(df[df['Code_SSP_PROFILES'] == 'SSP-999'])}")

    # 3. Améliorer la catégorisation thématique
    print("\n🏥 Amélioration de la catégorisation thématique...")
    categories = create_thematic_categories()

    def categorize_diagnosis(diag):
        """Catégorise un diagnostic selon les groupes thématiques"""
        if pd.isna(diag):
            return 'Non classé'

        diag_str = str(diag).lower()

        # Recherche dans chaque catégorie
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword.lower() in diag_str or diag_str in keyword.lower():
                    return category

        # Catégorisation par SSP si diagnostic non trouvé
        return 'Autre'

    # Appliquer la nouvelle catégorisation
    df['Groupe_Thematique_V2'] = df['Diagnostic principal harmonisé'].apply(categorize_diagnosis)

    # Si toujours "Autre", essayer avec le diagnostic générique
    mask_autre = df['Groupe_Thematique_V2'] == 'Autre'
    df.loc[mask_autre, 'Groupe_Thematique_V2'] = df.loc[mask_autre, 'Diagnostic générique harmonisé'].apply(categorize_diagnosis)

    # Statistiques de catégorisation
    cat_stats = df['Groupe_Thematique_V2'].value_counts()
    print("\n📊 Nouvelle répartition thématique:")
    for cat, count in cat_stats.items():
        percentage = (count / len(df)) * 100
        print(f"  - {cat}: {count} cas ({percentage:.1f}%)")

    # Calculer l'amélioration
    autre_percentage = (cat_stats.get('Autre', 0) / len(df)) * 100
    print(f"\n✨ Groupe 'Autre' réduit à {autre_percentage:.1f}% (objectif: <20%)")

    # 4. Traiter les doublons
    print("\n🔄 Traitement des doublons...")
    duplicates = df[df['Est_Doublon'] == True].copy()

    # Initialiser la colonne
    df['Doublon_Supprime'] = False

    if not duplicates.empty:
        print(f"  {len(duplicates)} doublons détectés")
        # Marquer les doublons avec un indicateur de priorité
        for idx, row in duplicates.iterrows():
            # Garder le plus récent ou le plus complet
            similar = df[
                (df['Diagnostic principal harmonisé'] == row['Diagnostic principal harmonisé']) &
                (df['Année'] == row['Année'])
            ]
            if len(similar) > 1:
                # Garder celui avec le plus d'informations
                info_count = similar.notna().sum(axis=1)
                best_idx = info_count.idxmax()
                # Marquer tous sauf le meilleur
                for sim_idx in similar.index:
                    if sim_idx != best_idx:
                        df.loc[sim_idx, 'Doublon_Supprime'] = True

        doublons_supprimes = df[df['Doublon_Supprime'] == True]
        print(f"  ✓ {len(doublons_supprimes)} doublons marqués pour suppression")

    # 5. Réorganiser les colonnes
    print("\n📋 Réorganisation des colonnes...")
    cols_order = [
        'Année', 'Catégorie', 'Station',
        'SSP', 'SSP harmonisé', 'Code_SSP_PROFILES',
        'Diagnostic générique', 'Diagnostic générique harmonisé',
        'Diagnostic principal', 'Diagnostic principal harmonisé',
        'Groupe_Thematique', 'Groupe_Thematique_V2',
        'Description', 'Anamnèse',
        'SSP_PROFILES',  # Gardé pour référence
        'Est_Doublon', 'Doublon_Supprime'
    ]

    # Garder seulement les colonnes qui existent
    cols_final = [col for col in cols_order if col in df.columns]
    df = df[cols_final]

    # 6. Sauvegarder le fichier enrichi
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_file.replace('.csv', f'_{timestamp}.csv')

    df.to_csv(output_file, sep=';', encoding='utf-8', index=False)
    print(f"\n✅ Fichier enrichi sauvegardé: {output_file}")

    # 7. Générer un rapport
    report_file = output_file.replace('.csv', '_rapport.txt')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("="*60 + "\n")
        f.write("RAPPORT D'ENRICHISSEMENT SSP PROFILES\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*60 + "\n\n")

        f.write("1. SUPPRESSION ICD-10\n")
        f.write("-"*30 + "\n")
        f.write("✓ Colonne Code_ICD10 supprimée\n\n")

        f.write("2. ENRICHISSEMENT SSP PROFILES\n")
        f.write("-"*30 + "\n")
        f.write(f"Total de cas: {len(df)}\n")
        f.write(f"Codes SSP attribués:\n")
        for code, count in ssp_stats.head(10).items():
            f.write(f"  - {code}: {count} cas\n")
        f.write("\n")

        f.write("3. CATÉGORISATION THÉMATIQUE\n")
        f.write("-"*30 + "\n")
        f.write("Ancienne répartition:\n")
        f.write("  - Autre: 92.2%\n\n")
        f.write("Nouvelle répartition:\n")
        for cat, count in cat_stats.items():
            percentage = (count / len(df)) * 100
            f.write(f"  - {cat}: {count} cas ({percentage:.1f}%)\n")
        f.write(f"\nRéduction du groupe 'Autre': 92.2% → {autre_percentage:.1f}%\n")

        f.write("\n4. TRAITEMENT DES DOUBLONS\n")
        f.write("-"*30 + "\n")
        if 'Doublon_Supprime' in df.columns:
            f.write(f"Doublons marqués pour suppression: {df['Doublon_Supprime'].sum()}\n")
        else:
            f.write("Aucun doublon à supprimer\n")

        f.write("\n="*60 + "\n")
        f.write("FIN DU RAPPORT\n")
        f.write("="*60 + "\n")

    print(f"📄 Rapport généré: {report_file}")

    return output_file

if __name__ == "__main__":
    # Fichiers d'entrée et sortie
    input_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Harmonise_20251024_154128.csv"
    output_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Enrichi.csv"

    # Exécuter l'enrichissement
    enriched_file = enrich_and_categorize(input_file, output_file)

    print("\n✨ Enrichissement terminé avec succès!")