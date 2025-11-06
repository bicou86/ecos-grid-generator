#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'export vers la plateforme ECOS pour utilisation en formation
Génère des fichiers JSON structurés compatibles avec le générateur de grilles ECOS
"""

import pandas as pd
import json
import os
from datetime import datetime
import re

def clean_filename(text):
    """Nettoie le texte pour créer un nom de fichier valide"""
    if pd.isna(text) or text == '':
        return 'Sans_titre'
    # Supprimer les caractères spéciaux
    text = re.sub(r'[^\w\s-]', '', str(text))
    text = re.sub(r'[-\s]+', '_', text)
    # Limiter la longueur
    return text[:100]

def create_ecos_json_structure(row):
    """
    Crée la structure JSON complète pour un cas ECOS
    Compatible avec le générateur de grilles HTML/PDF
    """

    # Extraire les informations de base
    titre = row.get('Diagnostic principal harmonisé', 'Cas ECOS')
    annee = row.get('Année', '')
    categorie = row.get('Groupe_Thematique_V3', 'Non classé')

    # Créer la structure JSON selon le modèle ECOS
    ecos_case = {
        "title": f"{titre} - {annee}",
        "context": {
            "setting": f"Service de {categorie.lower()}",
            "patient": row.get('Description', 'Patient se présentant pour consultation'),
            "vitals": {}  # Sera rempli si des signes vitaux sont disponibles
        },
        "sections": {}
    }

    # Ajouter les signes vitaux s'ils existent
    # (Dans ce cas, nous n'avons pas ces données, mais la structure est prête)

    # Section Anamnèse
    anamnese_criteria = []

    # Critère principal - Motif de consultation
    if row.get('SSP harmonisé'):
        anamnese_criteria.append({
            "id": "a1",
            "text": "Motif principal de consultation",
            "binaryOnly": True,
            "patientComment": row.get('SSP harmonisé', '')
        })

    # Critère - Anamnèse générale
    if row.get('Anamnèse'):
        anamnese_criteria.append({
            "id": "a2",
            "text": "Anamnèse",
            "details": [line.strip() for line in str(row.get('Anamnèse', '')).split('.') if line.strip()][:5]
        })

    # Critère - Anamnèse détaillée du PDF
    if row.get('Anamnèse_Détaillée_PDF'):
        details = [line.strip() for line in str(row.get('Anamnèse_Détaillée_PDF', '')).split(',') if line.strip()]
        if details:
            anamnese_criteria.append({
                "id": "a3",
                "text": "Éléments d'anamnèse complémentaires",
                "details": details[:10]  # Limiter à 10 éléments
            })

    # Ajouter les antécédents et habitudes de vie standards
    anamnese_criteria.extend([
        {"id": "a4", "text": "Antécédents médicaux"},
        {"id": "a5", "text": "Antécédents chirurgicaux"},
        {"id": "a6", "text": "Allergies"},
        {"id": "a7", "text": "Médicaments actuels"},
        {"id": "a8", "text": "Antécédents familiaux"},
        {"id": "a9", "text": "Habitudes de vie", "details": ["Tabac", "Alcool", "Activité physique"]}
    ])

    if anamnese_criteria:
        ecos_case["sections"]["anamnese"] = {
            "weight": 0.25,
            "criteria": anamnese_criteria
        }

    # Section Examen Clinique
    examen_criteria = []

    if row.get('Examen_Clinique_PDF'):
        # Parser l'examen clinique
        examen_text = str(row.get('Examen_Clinique_PDF', ''))
        examen_elements = [e.strip() for e in re.split(r'[,;]', examen_text) if e.strip()]

        if examen_elements:
            examen_criteria.append({
                "id": "e1",
                "text": "Inspection générale",
                "binaryOnly": True
            })

            # Regrouper les éléments d'examen
            if len(examen_elements) > 0:
                examen_criteria.append({
                    "id": "e2",
                    "text": "Examen physique ciblé",
                    "details": examen_elements[:8]
                })

    # Ajouter les examens standards
    examen_criteria.extend([
        {"id": "e3", "text": "Signes vitaux"},
        {"id": "e4", "text": "Examen cardiovasculaire"},
        {"id": "e5", "text": "Examen pulmonaire"},
        {"id": "e6", "text": "Examen abdominal"},
        {"id": "e7", "text": "Examen neurologique sommaire"}
    ])

    if examen_criteria:
        ecos_case["sections"]["examen"] = {
            "weight": 0.25,
            "criteria": examen_criteria
        }

    # Section Management
    management_criteria = []

    # Diagnostic différentiel
    if row.get('Diagnostic_Différentiel_PDF'):
        dd_text = str(row.get('Diagnostic_Différentiel_PDF', ''))
        dd_list = [d.strip() for d in re.split(r'[,;]', dd_text) if d.strip()]

        if dd_list:
            dd_section = {
                "title": "Diagnostics différentiels à considérer",
                "categories": [{
                    "name": "Diagnostics principaux",
                    "items": [
                        {
                            "text": dd,
                            "cause": "À évaluer selon présentation clinique",
                            "test": "Examens selon suspicion clinique"
                        }
                        for dd in dd_list[:5]  # Limiter à 5 diagnostics
                    ]
                }]
            }

            management_criteria.append({
                "id": "m1",
                "text": "Diagnostics différentiels",
                "ddSection": dd_section
            })

    # Examens complémentaires
    if row.get('Examens_Complémentaires_PDF'):
        examens_text = str(row.get('Examens_Complémentaires_PDF', ''))
        examens_list = [e.strip() for e in re.split(r'[,;-]', examens_text) if e.strip()]

        if examens_list:
            management_criteria.append({
                "id": "m2",
                "text": "Examens complémentaires",
                "details": examens_list[:8]
            })

    # Prise en charge
    if row.get('Prise_en_Charge_PDF'):
        pec_text = str(row.get('Prise_en_Charge_PDF', ''))
        pec_elements = [p.strip() for p in re.split(r'[,;]', pec_text) if p.strip()]

        if pec_elements:
            therapy_section = {
                "categories": [{
                    "title": "Plan de traitement",
                    "content": "\n".join(pec_elements[:5])
                }]
            }

            management_criteria.append({
                "id": "m3",
                "text": "Prise en charge thérapeutique",
                "therapySection": therapy_section
            })

    # Ajouter les éléments standards de management
    management_criteria.extend([
        {"id": "m4", "text": "Plan d'investigation"},
        {"id": "m5", "text": "Traitement symptomatique"},
        {"id": "m6", "text": "Conseils au patient"},
        {"id": "m7", "text": "Suivi proposé"}
    ])

    if management_criteria:
        ecos_case["sections"]["management"] = {
            "weight": 0.25,
            "criteria": management_criteria
        }

    # Section Clôture (optionnelle)
    ecos_case["sections"]["cloture"] = {
        "weight": 0,
        "criteria": [
            {
                "id": "c1",
                "text": "Clôture de la consultation",
                "content": "Résumer les points clés, vérifier la compréhension du patient et planifier le suivi"
            }
        ]
    }

    # Ajouter les annexes si disponibles
    annexes = {}

    # Informations pour l'expert
    if any([row.get(col) for col in ['Anamnèse_Détaillée_PDF', 'Examen_Clinique_PDF', 'Diagnostic_Différentiel_PDF']]):
        points_cles = []
        if row.get('Anamnèse_Détaillée_PDF'):
            points_cles.append("Anamnèse détaillée importante")
        if row.get('Examen_Clinique_PDF'):
            points_cles.append("Examen clinique complet nécessaire")
        if row.get('Diagnostic_Différentiel_PDF'):
            points_cles.append("Diagnostic différentiel à explorer")

        annexes["informationsExpert"] = {
            "titre": "Informations pour l'expert évaluateur",
            "pointsCles": points_cles,
            "pieges": ["Ne pas oublier l'anamnèse complète", "Explorer tous les diagnostics différentiels"]
        }

    # Scénario pour patient standardisé
    annexes["scenarioPatienteStandardisee"] = {
        "titre": f"Scénario - {titre}",
        "nom": "Patient standardisé",
        "age": "Selon cas",
        "contexte": row.get('Description', ''),
        "motifConsultation": {
            "plaintePrincipale": row.get('SSP harmonisé', 'Symptôme principal'),
            "autreChose": "Éléments selon le cas clinique"
        }
    }

    if annexes:
        ecos_case["annexes"] = annexes

    # Ajouter les métadonnées
    ecos_case["metadata"] = {
        "year": annee,
        "category": categorie,
        "ssp_code": row.get('Code_SSP_PROFILES', ''),
        "completeness": row.get('Score_Complétude_Pct', 0),
        "source": "Base de données ECOS harmonisée",
        "version": "3.0",
        "date_generation": datetime.now().strftime('%Y-%m-%d')
    }

    return ecos_case

def export_to_ecos_platform(input_file):
    """
    Exporte les cas ECOS vers la plateforme de formation
    Génère des fichiers JSON individuels et un fichier maître
    """

    print("\n" + "="*60)
    print("EXPORT VERS PLATEFORME ECOS FORMATION")
    print("="*60 + "\n")

    # Charger les données
    print("📂 Chargement des données...")
    df = pd.read_csv(input_file, sep=';', encoding='utf-8')
    print(f"✓ {len(df)} cas chargés")

    # Créer les répertoires de sortie
    output_dir = os.path.join(os.path.dirname(input_file), '..', 'json_files_v3')
    os.makedirs(output_dir, exist_ok=True)

    feuille_porte_dir = os.path.join(os.path.dirname(input_file), '..', 'feuille-porte', 'json')
    os.makedirs(feuille_porte_dir, exist_ok=True)

    print(f"\n📁 Répertoire de sortie: {output_dir}")
    print(f"📁 Répertoire feuilles-porte: {feuille_porte_dir}")

    # Statistiques
    exported_count = 0
    high_quality_count = 0
    errors = []

    # Liste pour le fichier maître
    master_list = []

    print("\n🔄 Génération des fichiers JSON...")

    for idx, row in df.iterrows():
        try:
            # Générer la structure JSON ECOS
            ecos_json = create_ecos_json_structure(row)

            # Créer le nom de fichier
            titre = clean_filename(row.get('Diagnostic principal harmonisé', f'Cas_{idx}'))
            annee = row.get('Année', 'XXXX')
            filename = f"{titre}_{annee}.json"
            filepath = os.path.join(output_dir, filename)

            # Sauvegarder le fichier JSON principal
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(ecos_json, f, ensure_ascii=False, indent=2)

            # Créer la feuille-porte JSON
            feuille_porte = {
                "titre": ecos_json["title"],
                "contexte": ecos_json["context"]["setting"],
                "description": ecos_json["context"]["patient"],
                "signesVitaux": ecos_json["context"].get("vitals", {}),
                "taches": [
                    "Prendre une anamnèse ciblée",
                    "Réaliser un examen clinique ciblé",
                    f"Établir un diagnostic différentiel et proposer une prise en charge"
                ]
            }

            fp_filename = f"{titre}_{annee}_feuille_porte.json"
            fp_filepath = os.path.join(feuille_porte_dir, fp_filename)

            with open(fp_filepath, 'w', encoding='utf-8') as f:
                json.dump(feuille_porte, f, ensure_ascii=False, indent=2)

            # Ajouter à la liste maître
            master_entry = {
                "id": f"ECOS_{annee}_{idx:03d}",
                "titre": ecos_json["title"],
                "annee": annee,
                "categorie": row.get('Groupe_Thematique_V3', ''),
                "ssp": row.get('SSP harmonisé', ''),
                "code_ssp": row.get('Code_SSP_PROFILES', ''),
                "completude": float(row.get('Score_Complétude_Pct', 0)),
                "fichier_json": filename,
                "fichier_feuille_porte": fp_filename
            }
            master_list.append(master_entry)

            exported_count += 1

            # Compter les cas de haute qualité
            if float(row.get('Score_Complétude_Pct', 0)) >= 50:
                high_quality_count += 1

            # Afficher la progression
            if (idx + 1) % 50 == 0:
                print(f"  ✓ {idx + 1}/{len(df)} cas traités...")

        except Exception as e:
            error_msg = f"Erreur ligne {idx}: {str(e)}"
            errors.append(error_msg)
            continue

    # Créer le fichier maître
    master_file = os.path.join(output_dir, 'ECOS_Master_Index.json')
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": {
                "total_cases": len(master_list),
                "high_quality_cases": high_quality_count,
                "generation_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "version": "3.0"
            },
            "cases": master_list
        }, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Export terminé!")
    print(f"  - Cas exportés: {exported_count}/{len(df)}")
    print(f"  - Cas haute qualité (≥50%): {high_quality_count}")
    print(f"  - Fichiers JSON générés: {exported_count * 2} (cas + feuilles-porte)")
    print(f"  - Fichier maître: {master_file}")

    if errors:
        print(f"\n⚠️ {len(errors)} erreurs rencontrées:")
        for error in errors[:5]:  # Afficher max 5 erreurs
            print(f"  - {error}")

    # Générer un script HTML pour tester les grilles
    generate_test_page(output_dir, master_list)

    print("\n🎓 Les fichiers sont prêts pour utilisation dans la plateforme ECOS!")

    return master_file

def generate_test_page(output_dir, cases_list):
    """
    Génère une page HTML de test pour visualiser les cas ECOS
    """

    html_content = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test des Cas ECOS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        .cases-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .case-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .case-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .case-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .case-meta {
            font-size: 0.9em;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .case-links {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .case-link {
            padding: 5px 10px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.85em;
        }
        .case-link:hover {
            background: #1d4ed8;
        }
        .completeness {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
        }
        .high { background: #10b981; color: white; }
        .medium { background: #f59e0b; color: white; }
        .low { background: #ef4444; color: white; }
        .stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>🎓 Test des Cas ECOS Générés</h1>

    <div class="stats">
        <h2>Statistiques</h2>
        <p>Total de cas: <strong>""" + str(len(cases_list)) + """</strong></p>
        <p>Cas haute qualité (≥50%): <strong>""" + str(sum(1 for c in cases_list if c['completude'] >= 50)) + """</strong></p>
        <p>Date de génération: <strong>""" + datetime.now().strftime('%Y-%m-%d %H:%M') + """</strong></p>
    </div>

    <div class="cases-grid">
"""

    for case in cases_list[:50]:  # Limiter à 50 cas pour la page de test
        completeness_class = 'high' if case['completude'] >= 75 else 'medium' if case['completude'] >= 50 else 'low'

        html_content += f"""
        <div class="case-card">
            <div class="case-title">{case['titre']}</div>
            <div class="case-meta">
                <div>Année: {case['annee']} | Catégorie: {case['categorie']}</div>
                <div>SSP: {case['ssp']} ({case['code_ssp']})</div>
                <div>Complétude: <span class="completeness {completeness_class}">{case['completude']:.0f}%</span></div>
            </div>
            <div class="case-links">
                <a href="json_files_v3/{case['fichier_json']}" class="case-link" target="_blank">📄 JSON</a>
                <a href="../Chablon/Generateur_de_Grilles_ECOS.html?file=../json_files_v3/{case['fichier_json']}"
                   class="case-link" target="_blank">📊 Générer Grille</a>
            </div>
        </div>
        """

    html_content += """
    </div>

    <script>
        console.log('Page de test ECOS chargée');
        console.log('Pour générer une grille, utilisez le générateur avec le fichier JSON correspondant');
    </script>
</body>
</html>
"""

    test_page_path = os.path.join(output_dir, '..', 'test_cases_ecos.html')
    with open(test_page_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"📄 Page de test créée: {test_page_path}")

if __name__ == "__main__":
    # Utiliser le fichier enrichi final
    input_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/data-stat/ECOS_Cas_Enrichi_20251024_155919_V3_complet_20251024_160106_FINAL_20251024_161033.csv"

    master_file = export_to_ecos_platform(input_file)

    print("\n✨ Export vers la plateforme ECOS terminé avec succès!")