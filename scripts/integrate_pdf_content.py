#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour intégrer les informations des PDFs de référence
dans la base de données ECOS enrichie
"""

import pandas as pd
from datetime import datetime
import json

# Données extraites du PDF ECOS-Anciens sujets-2013-2017
PDF_ENRICHMENT_DATA = {
    # 2013
    'Épaule douloureuse': {
        'year': 2013,
        'category': 'Rhumatologie',
        'detailed_anamnesis': "Caractériser la douleur, mobilité, mécanisme, signes d'inflammation, main dominante, infection récente, ATCD, profession",
        'clinical_exam': "Inspection, palpation, tests de triage, mobilité active/passive (passive préservée), test de Jobe, vasculaire/neuro si trauma",
        'differential_diagnosis': "Lésion coiffe des rotateurs, rupture du sus-épineux, conflit sous-acromial, capsulite rétractile, tendinite calcifiante, tendinite longue portion",
        'workup': "Radiographie, éventuellement US et IRM pour tissus mous",
        'management': "Réduire le sport, physiothérapie, AINS + glucocorticoïdes locaux, chirurgie si rupture chez jeune"
    },
    'Lombalgie aiguë': {
        'year': 2013,
        'category': 'Rhumatologie',
        'detailed_anamnesis': "Caractériser douleur, rechercher symptômes neuro, symptômes systémiques (symptômes B), troubles sphinctériens",
        'clinical_exam': "Inspection/palpation/percussion rachis, flexion/extension/inclinaison latérale/rotation, Ott et Schober, Lasègue, examen neuro rapide MI, TR",
        'differential_diagnosis': "Fracture ostéoporotique, métastases osseuses, hernie",
        'workup': "Radiographie, éventuellement CT ou IRM",
        'management': "Si fracture stable - repos selon douleur, AINS, physiothérapie"
    },
    'Dermohypodermite': {
        'year': 2013,
        'category': 'Dermatologie',
        'patient_description': "Femme 65 ans avec douleur et rougeur jambe depuis 2j avec AEG, œdème, adénopathie fémorale",
        'detailed_anamnesis': "Localisation, étendue, évolution, douleur, chaleur, rougeur, œdème, FIÈVRE? Frissons?, blessures (porte d'entrée), immunosuppression, diabète, hygiène",
        'clinical_exam': "Inspection, palpation (y compris ganglions!), rougeur-chaleur-œdème-douleur, marquer la lésion pour suivre réponse aux antibiotiques, chercher porte d'entrée entre orteils",
        'differential_diagnosis': "Eczéma de contact allergique aigu, thrombophlébite, acrodermatite chronique atrophiante, fasciite nécrosante",
        'workup': "Labo - VS, CRP, GB, US si suspicion thrombose, prélèvement bactériologique au niveau probable porte d'entrée, hémocultures si fièvre",
        'management': "Si visage - hospitalisation (risque thrombose sinus caverneux), repos, surélévation, pansements frais et humides, Co-Amox 10j"
    },
    'Prurit généralisé': {
        'year': 2013,
        'category': 'Dermatologie',
        'patient_description': "Homme 30 ans avec prurit généralisé depuis hier après consommation de crevettes",
        'detailed_anamnesis': "Localisation, évolution, caractère migratoire et éphémère, facteurs déclenchants/aggravants/soulageants, épisode antérieur, symptômes associés (douleur, voyage), antécédents familiaux, fièvre, palpitations dyspnée, dysphonie/angiœdème, troubles du transit/N/V/diarrhée, perte de connaissance, allergies, nouveaux médicaments, histoire personnelle",
        'clinical_exam': "Inspection peau muqueuse poils ongles, ganglions, palpations avec gants, examen cardiopulmonaire, abdominal",
        'differential_diagnosis': "Urticaire (réaction d'hypersensibilité type 1), maladie de Lyme, vascularite urticarienne",
        'workup': "FSC, tryptase, sérologie Lyme, prick test +/- tests épicutanés, IgE totales après prick test, journal des allergies",
        'management': "Antihistaminique oral (ex: Zyrtec, Loratadine), prednisone orale, corticoïdes topiques (crème)"
    },
    'Ostéomyélite': {
        'year': 2013,
        'category': 'Pédiatrie',
        'patient_description': "Fièvre 39°C + douleur jambe/genou - père anxieux pendant consultation",
        'clinical_exam': "Œdème fémoral distal léger, genou légèrement rouge et chaud, radiographie normale",
        'workup': "Labo - leucocytose, neutrophilie, VS et CRP élevées",
        'differential_diagnosis': "Arthrite septique, tumeur osseuse",
        'management': "Repos/immobiliser membre, hospitaliser et antibiotiques IV, si complications → chirurgie"
    },
    'Bronchiolite RSV': {
        'year': 2013,
        'category': 'Pédiatrie',
        'patient_description': "Nourrisson 3 mois - dyspnée avec geignement, tirage, marbrures + AEG sévère, période - fin décembre",
        'detailed_anamnesis': "Fièvre élevée, dyspnée, tachypnée, cyanose, geignement, battement des ailes du nez, toux, rhinorrhée, écoulement oreille, touche les oreilles, éruption, contact, voyage, crèche, signes de déshydratation (bouche/yeux secs, urines, yeux enfoncés), allaitement? Combien de fois/jour?, vaccins, grossesse, accouchement (S, P, PC, adaptation), développement",
        'clinical_exam': "Tachypnée, battement des ailes du nez, cyanose, expiration prolongée",
        'workup': "Frottis nasopharyngé pour test rapide, labo, +/- hémocultures, bandelette urinaire, culture",
        'management': "Hospitaliser pour surveiller risque d'apnée, hydratation, O2 + (B2 mimétique, éventuellement adrénaline, éventuellement glucocorticoïdes)"
    },
    # 2014
    'Fracture du col fémoral': {
        'year': 2014,
        'category': 'Urgences-Traumatologie',
        'detailed_anamnesis': "Caractériser douleur, mécanisme trauma/chute, TC, perte de connaissance, lésions cutanées, capacité à se relever après chute, capacité d'appui, autres douleurs articulaires, œdème, rougeur, chaleur, état général, cinétique, bilan fracture pathologique, évaluation gériatrique (AVQ, moyens de marche)",
        'clinical_exam': "Jambe raccourcie et en rotation externe, inspection/palpation, mouvements actifs/passifs, pouls, temps de recoloration capillaire, sensibilité, examen des articulations voisines, comparaison controlatérale",
        'differential_diagnosis': "Luxation hanche, fracture bassin, contusion, lésion genou, coxarthrose, arthrite de hanche",
        'workup': "Radio hanche/bassin + genou, densitométrie",
        'management': "Chirurgie +/- prothèse"
    },
    'Spondylarthrite ankylosante': {
        'year': 2014,
        'category': 'Rhumatologie',
        'patient_description': "Homme 40 ans avec douleurs dorsales",
        'key_features': "Douleurs sacro-iliaques et vertébrales, présentes la nuit, raideur matinale, amélioration avec mouvement",
        'detailed_anamnesis': "Enthésopathies (Achille et tubérosité tibiale), arthrites d'autres articulations proximales du tronc, iritis/uvéite, MICI (Crohn)",
        'clinical_exam': "Inspection/palpation (y compris sacro-iliaque)/percussion, flexion/extension/inclinaison latérale/rotation du rachis, distance doigt-sol et Schober (aussi rachis cervical), marche, examen mobilité hanches, signe de Lasègue + force/sensibilité MI, TR pour sphincters, signe de Mennell, FABER, test de Gaenslen, test de Yeoman, recherche insuffisance aortique",
        'differential_diagnosis': "Ostéoporose, hernie discale, spondylite, arthrite réactionnelle, rhumatisme psoriasique",
        'workup': "Sang - CRP et VS élevées selon activité, anémie légère possible, HLA B27, IRM (GOLD STANDARD), radiographie montre modifications liées à l'inflammation (plus tard)",
        'management': "L'activité physique est le plus important - physiothérapie et sport, AINS selon besoin, corticoïdes si crise sévère, anti-TNF alpha en cas réservés"
    },
    'Syphilis secondaire': {
        'year': 2014,
        'category': 'Infectiologie',
        'patient_description': "Homme 40 ans avec éruption cutanée",
        'detailed_anamnesis': "Primaire - chancre indolore, lésion génitale, condylomes plans, Secondaire - éruption maculopapuleuse, palmoplantaire, alopécie en plaques, fièvre, myalgie, fatigue, angine non spécifique, adénopathies généralisées non douloureuses, granulomes mous, Tertiaire - atteinte vasculaire (anévrysme aorte, vaisseaux cérébraux), atteinte neurologique (douleur, déficit neurologique), pour toute éruption toujours rechercher IST: VIH syphilis",
        'clinical_exam': "Inspection peau muqueuse poils ongles, ganglions, palpations avec gants, inspection génitale IMPORTANTE",
        'differential_diagnosis': "VIH, mononucléose infectieuse, gonorrhée, éruption maculopapuleuse sur paumes et plantes typique de syphilis",
        'workup': "VDRL TPHA sérologie, dépistage autres IST",
        'management': "Pénicilline IM, conseil prévention - utiliser préservatifs"
    },
    # 2015
    'Fracture de la fibula': {
        'year': 2015,
        'category': 'Urgences-Traumatologie',
        'detailed_anamnesis': "Caractériser douleur, hématome, tuméfaction, rougeur, chaleur, capacité de marcher, première fois/ATCD entorse, troubles sensitifs, ATTENTION syndrome des loges",
        'clinical_exam': "Inspection, palpation, status cheville, palper toute la jambe, hématome et tuméfaction, mobilité douloureuse (passive/active), marche, ne pas oublier pouls + neuro (sensitif)",
        'differential_diagnosis': "Fracture tibia, fracture calcanéum, entorse",
        'workup': "Radio fibula F/P + radio cheville F/P",
        'management': "Prévoir contrôle ortho à 1 semaine, repos, glace, surélévation, Weber A + B (non déplacée) plâtre 6 semaines, béquilles, prophylaxie antithrombotique, sinon chirurgie"
    },
    'Dermite atopique': {
        'year': 2015,
        'category': 'Dermatologie',
        'cardinal_symptoms': "Prurit, sécheresse cutanée, localisation (typique dans les plis), histoire dermato, atopie - allergie, asthme souvent association avec rhinoconjonctivite allergique, asthme allergique, et allergies alimentaires, histoire familiale",
        'clinical_exam': "Inspection dermato plis cou et visage, sécheresse cutanée, dermographisme blanc, chéilite sèche, double pli sous-orbitaire, perte des sourcils latéraux",
        'differential_diagnosis': "Dermite séborrhéique, dermite de contact allergique, gale",
        'workup': "IgE totales, éosinophiles, prick test",
        'management': "Éviction des déclencheurs, émollients, utiliser produits non irritants, Poussée: corticoïdes topiques, immunosuppresseurs topiques, Si sévère: photothérapie"
    },
    # 2016
    'Arthrite septique': {
        'year': 2016,
        'category': 'Rhumatologie',
        'patient_description': "Douleur articulation genou droite depuis 1j → Urgences",
        'detailed_anamnesis': "Iatrogène, trauma, IST, présentation classique articulation inflammée (rougeur, chaleur, tuméfaction, fièvre, frissons), le plus souvent genou et hanche, Lyme (érythème migrant, forêt), Reiter (symptômes urinaires, yeux, ATCD infection)",
        'clinical_exam': "Dolor, tumor, rougeur, etc., status genou (inspection, palpation, signe du flot, testing ligaments, ménisques, mouvements actifs/passifs, marche)",
        'differential_diagnosis': "Goutte, pseudogoutte, Reiter (yeux, urine, arthrite), arthrite de Lyme",
        'workup': "Sang - CRP, VS, radio en 2 plans, ponction articulaire",
        'management': "Hospitalisation, immobiliser membre + antibiotiques IV + prophylaxie thromboembolique + antalgie"
    },
    'Épicondylite latérale': {
        'year': 2016,
        'patient_description': "Jeune patient avec douleur au coude",
        'features': "Douleur à l'effort et à la pression, douleur aggravée par supination, fermeture du poing, et extension dorsale du poignet",
        'detailed_anamnesis': "Caractériser douleur, trauma/ATCD trauma, première fois, caractéristiques douleur inflammatoire/mécanique, important de vérifier tolérance gastrique avant AINS",
        'clinical_exam': "Status coude, spécifique - douleur latérale à l'extension du coude contre résistance, douleur à la palpation épicondyle latéral lors flexion dorsale poignet, inspection, palpation, mouvements passifs (actifs) (flexion/extension/pronation-supination), force, sensibilité, réflexes, pouls, tests spécifiques, comparer deux côtés",
        'differential_diagnosis': "Bursite (AINS, repos)",
        'workup': "Radio ne montre généralement rien",
        'management': "Arrêt sport, repos, AINS court terme, physiothérapie, (éventuellement corticoïdes injectés)"
    },
    'Syndrome de Stevens-Johnson': {
        'year': 2016,
        'category': 'Dermatologie',
        'patient_description': "Patient prenant allopurinol depuis 1 mois, status = description image → URGENCE DERMATOLOGIQUE!!",
        'timeline': "1-3 semaines après exposition médicamenteuse - fièvre, symptômes grippaux (mal de gorge, myalgie, arthralgie), puis 1-3 semaines après - macules érythémateuses prurigineuses et douloureuses souvent visage et tronc, bulles, vésicules",
        'detailed_anamnesis': "Localisation, évolution, description, douleur, prurit, atteinte muqueuse: ulcères buccaux/génitaux, conjonctivite, ulcère cornéen (photophobie, douleur), attention atteinte ophtalmique! (conjonctivite ulcéreuse, kératite, iritis, uvéite, parfois cécité), infections récentes, médicaments pris",
        'clinical_exam': "Status dermato - exanthème maculeux sur tronc, peut devenir vésiculobulleux avec détachement épidermique secondaire, érosions muqueuses",
        'differential_diagnosis': "Herpès simplex, toxidermie médicamenteuse, pemphigus, si >30% corps atteint: NET",
        'workup': "Clinique (biopsie cutanée)",
        'management': "Arrêter médicament causal, hydratation, soins de peau, antibiotiques si sepsis, corticoïdes systémiques! Traitement symptomatique topique, consultation dermato et ophtalmo"
    },
    # 2017
    'Polymyalgia rheumatica': {
        'year': 2017,
        'category': 'Rhumatologie',
        'features': "Symptômes B et symptômes dépressifs, douleurs symétriques (surtout nuit) + raideur matinale épaules et hanches, attention développement possible Horton! Demander céphalée, troubles vision, douleur mastication, douleur cuir chevelu",
        'clinical_exam': "Rachis + GALS",
        'differential_diagnosis': "Fibromyalgie, dermato/polymyosite, myosite à inclusions (IBM), PR",
        'workup': "Sang - VS fortement élevée et CRP, éventuellement anémie, ANA négatifs, FR négatif, CK normale, échographie - typiquement bursite sous-acromiale bilatérale",
        'management': "Prednisone!"
    },
    'Psoriasis': {
        'year': 2017,
        'category': 'Dermatologie',
        'detailed_anamnesis': "Localisation, facteurs déclenchants/aggravants/améliorants, prurit, desquamation, suintement, douleur associée (douleur articulaire!! mal de dos!), médicaments, utilisation de lotions ou allergènes, allergies, histoire, Köbner: apparition lésion après trauma, Signe de la bougie: grattage lésion fait tomber squames et plus apparaissent (comme cire bougie, ne s'arrête jamais), Auspitz: saignement lésion quand gratte dernière couche épiderme",
        'features': "Psoriasis - plaques érythémateuses bien délimitées avec desquamation blanchâtre; surtout sur surfaces extérieures articulaires, cuir chevelu, paumes et plantes; ongles piquetés et taches d'huile, plusieurs formes - plaque, gouttes, érythrodermique psoriasis (rare et sévère)",
        'differential_diagnosis': "Eczéma",
        'management': "Traitement: thérapie topique - Vit D, corticoïdes; UVB/PUVA; thérapie systémique (biologiques, ciclosporine A, MTX, rétinoïdes)"
    }
}

def enrich_database_from_pdf(enriched_file):
    """
    Enrichit la base de données avec les informations extraites des PDFs
    """
    print("\n" + "="*60)
    print("INTÉGRATION DES DONNÉES PDF DANS LA BASE ECOS")
    print("="*60 + "\n")

    # Charger les données enrichies
    df = pd.read_csv(enriched_file, sep=';', encoding='utf-8')
    print(f"📂 {len(df)} cas chargés")

    # Ajouter des colonnes pour les nouvelles informations
    new_columns = [
        'Anamnèse_Détaillée_PDF',
        'Examen_Clinique_PDF',
        'Diagnostic_Différentiel_PDF',
        'Examens_Complémentaires_PDF',
        'Prise_en_Charge_PDF',
        'Description_Patient_PDF',
        'Caractéristiques_Clés_PDF'
    ]

    for col in new_columns:
        if col not in df.columns:
            df[col] = ''

    # Enrichir les données année par année
    print("\n🔄 Enrichissement à partir des données PDF...")
    enriched_count = 0

    for case_name, case_data in PDF_ENRICHMENT_DATA.items():
        year = case_data.get('year')
        category = case_data.get('category', '')

        # Chercher les correspondances dans le dataframe
        # D'abord essayer par nom de diagnostic
        matches = df[
            (df['Année'] == year) &
            (df['Diagnostic principal harmonisé'].str.contains(case_name[:10], case=False, na=False))
        ]

        # Si pas de match, essayer par catégorie et année
        if matches.empty and category:
            matches = df[
                (df['Année'] == year) &
                (df['Groupe_Thematique_V3'] == category)
            ]

        if not matches.empty:
            # Enrichir les lignes correspondantes
            for idx in matches.index:
                if 'detailed_anamnesis' in case_data:
                    df.loc[idx, 'Anamnèse_Détaillée_PDF'] = case_data['detailed_anamnesis']
                if 'clinical_exam' in case_data:
                    df.loc[idx, 'Examen_Clinique_PDF'] = case_data['clinical_exam']
                if 'differential_diagnosis' in case_data:
                    df.loc[idx, 'Diagnostic_Différentiel_PDF'] = case_data['differential_diagnosis']
                if 'workup' in case_data:
                    df.loc[idx, 'Examens_Complémentaires_PDF'] = case_data['workup']
                if 'management' in case_data:
                    df.loc[idx, 'Prise_en_Charge_PDF'] = case_data['management']
                if 'patient_description' in case_data:
                    df.loc[idx, 'Description_Patient_PDF'] = case_data['patient_description']
                if 'key_features' in case_data or 'features' in case_data:
                    df.loc[idx, 'Caractéristiques_Clés_PDF'] = case_data.get('key_features', case_data.get('features', ''))

                enriched_count += 1

    print(f"✓ {enriched_count} cas enrichis avec données PDF")

    # Statistiques d'enrichissement
    print("\n📊 Statistiques d'enrichissement:")
    for col in new_columns:
        filled = df[col].notna() & (df[col] != '')
        count = filled.sum()
        percentage = (count / len(df)) * 100
        if count > 0:
            print(f"  - {col}: {count} cas ({percentage:.1f}%)")

    # Créer un score de complétude
    df['Score_Complétude'] = 0
    base_columns = ['Diagnostic principal harmonisé', 'SSP harmonisé', 'Description', 'Anamnèse']
    pdf_columns = new_columns

    for col in base_columns:
        df.loc[df[col].notna() & (df[col] != ''), 'Score_Complétude'] += 1

    for col in pdf_columns:
        df.loc[df[col].notna() & (df[col] != ''), 'Score_Complétude'] += 2  # Pondération plus forte pour données PDF

    df['Score_Complétude_Pct'] = (df['Score_Complétude'] / (len(base_columns) + 2*len(pdf_columns))) * 100

    # Afficher les cas les plus complets
    print("\n🏆 Top 10 cas les plus complets:")
    top_cases = df.nlargest(10, 'Score_Complétude_Pct')
    for _, row in top_cases.iterrows():
        print(f"  - {row['Année']} | {row['Diagnostic principal harmonisé']}: {row['Score_Complétude_Pct']:.1f}%")

    # Sauvegarder le fichier enrichi final
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = enriched_file.replace('.csv', f'_FINAL_{timestamp}.csv')
    df.to_csv(output_file, sep=';', encoding='utf-8', index=False)
    print(f"\n💾 Base de données finale sauvegardée: {output_file}")

    # Créer aussi une version Excel pour faciliter la consultation
    excel_file = output_file.replace('.csv', '.xlsx')
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        # Feuille principale
        df.to_excel(writer, sheet_name='Données_Complètes', index=False)

        # Feuille avec cas enrichis seulement
        enriched_df = df[df['Score_Complétude_Pct'] > 30]
        enriched_df.to_excel(writer, sheet_name='Cas_Enrichis', index=False)

        # Statistiques
        stats_df = pd.DataFrame({
            'Métrique': [
                'Total cas',
                'Cas enrichis PDF',
                'Score complétude moyen',
                'Cas avec anamnèse détaillée',
                'Cas avec examen clinique',
                'Cas avec diagnostic différentiel',
                'Cas avec examens complémentaires',
                'Cas avec prise en charge'
            ],
            'Valeur': [
                len(df),
                enriched_count,
                f"{df['Score_Complétude_Pct'].mean():.1f}%",
                (df['Anamnèse_Détaillée_PDF'] != '').sum(),
                (df['Examen_Clinique_PDF'] != '').sum(),
                (df['Diagnostic_Différentiel_PDF'] != '').sum(),
                (df['Examens_Complémentaires_PDF'] != '').sum(),
                (df['Prise_en_Charge_PDF'] != '').sum()
            ]
        })
        stats_df.to_excel(writer, sheet_name='Statistiques', index=False)

    print(f"📊 Fichier Excel créé: {excel_file}")

    # Générer rapport final complet
    report_file = output_file.replace('.csv', '_RAPPORT_COMPLET.txt')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("RAPPORT FINAL COMPLET - HARMONISATION ET ENRICHISSEMENT ECOS\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*80 + "\n\n")

        f.write("RÉSUMÉ EXÉCUTIF\n")
        f.write("-"*40 + "\n")
        f.write(f"Total de cas traités: {len(df)}\n")
        f.write(f"Cas enrichis avec données PDF: {enriched_count}\n")
        f.write(f"Score de complétude moyen: {df['Score_Complétude_Pct'].mean():.1f}%\n")
        f.write(f"Cas hautement complets (>50%): {(df['Score_Complétude_Pct'] > 50).sum()}\n\n")

        f.write("TRANSFORMATIONS EFFECTUÉES\n")
        f.write("-"*40 + "\n")
        f.write("1. Suppression codes ICD-10\n")
        f.write("2. Enrichissement avec codes SSP PROFILES (265 codes)\n")
        f.write("3. Catégorisation thématique affinée (Autre: 92.2% → 13.1%)\n")
        f.write("4. Gestion des doublons (5 doublons traités)\n")
        f.write("5. Intégration données PDF 2013-2017\n\n")

        f.write("DONNÉES PDF INTÉGRÉES\n")
        f.write("-"*40 + "\n")
        f.write("Source: ECOS-Anciens sujets-2013-2017.pdf\n")
        f.write("Période couverte: 2013-2017\n")
        f.write(f"Cas documentés: {len(PDF_ENRICHMENT_DATA)}\n")
        f.write(f"Cas enrichis dans la base: {enriched_count}\n\n")

        f.write("QUALITÉ DES DONNÉES FINALES\n")
        f.write("-"*40 + "\n")
        for col in new_columns:
            filled = (df[col] != '').sum()
            if filled > 0:
                f.write(f"  {col}: {filled} cas\n")

        f.write("\n" + "="*80 + "\n")
        f.write("RECOMMANDATIONS POUR L'UTILISATION\n")
        f.write("-"*40 + "\n")
        f.write("1. Utiliser le fichier Excel pour consultation manuelle\n")
        f.write("2. Filtrer par Score_Complétude_Pct pour cas les plus riches\n")
        f.write("3. Les colonnes _PDF contiennent les données enrichies\n")
        f.write("4. Utiliser Code_SSP_PROFILES pour analyses standardisées\n")
        f.write("5. Groupe_Thematique_V3 pour analyses par spécialité\n")

        f.write("\n" + "="*80 + "\n")

    print(f"📄 Rapport complet généré: {report_file}")

    return output_file

if __name__ == "__main__":
    # Utiliser le dernier fichier enrichi
    enriched_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Enrichi_20251024_155919_V3_complet_20251024_160106.csv"

    final_file = enrich_database_from_pdf(enriched_file)

    print("\n✅ Intégration des données PDF terminée avec succès!")