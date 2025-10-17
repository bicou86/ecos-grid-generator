# Scripts Utilitaires

Ce dossier contient tous les **scripts Python et JavaScript** utilisés pour le traitement, la validation et la standardisation des cas cliniques ECOS.

## 📁 Structure

```
scripts/
├── generation/         # Génération JSON depuis sources
├── migration/          # Migration de structures JSON
├── validation/         # Tests et validation
├── standardization/    # Standardisation terminologie
└── utils/              # Utilitaires divers
```

---

## 🔧 Dossier `generation/`

Scripts pour extraire et convertir les sources en JSON structuré.

### Scripts principaux

| Script | Description | Source |
|--------|-------------|--------|
| `process_amboss_files.py` | Traite les PDFs AMBOSS (DE → FR) | PDF allemands |
| `process_german_files.py` | Traite les cas allemands génériques | PDF allemands |
| `process_thieme_files.py` | Traite les PDFs Thieme (DE → FR) | PDF allemands |
| `process_usmle_files.py` | Traite les cas USMLE (EN → FR) | PDF anglais |
| `process_usmle_triage_files.py` | Traite les cas USMLE Triage | PDF anglais |
| `process_rescos_files.py` | Traite les cas RESCOS (FR) | HTML français |
| `match_german_feuille_porte.py` | Matching feuilles-porte allemandes | JSON |
| `match_rescos_feuille_porte.py` | Matching feuilles-porte RESCOS | JSON |
| `match_rescos_advanced.py` | Matching avancé RESCOS | JSON |

### Usage

```bash
# Exemple : Traiter tous les PDFs AMBOSS dans source-data/pdf/
python scripts/generation/process_amboss_files.py

# Les JSON générés sont créés dans generated/json/AMBOSS/
```

---

## 🔄 Dossier `migration/`

Scripts pour migrer les structures JSON anciennes vers les nouvelles versions.

### Scripts

- Migration v1 → v2
- Migration v2 → v3
- Migration vers structure mixte
- Corrections de schéma

**Note** : Ces scripts ne sont généralement exécutés qu'une fois lors des mises à jour majeures.

---

## ✅ Dossier `validation/`

Scripts de test et validation des structures JSON et du contenu.

### Scripts principaux

| Script | Description |
|--------|-------------|
| `check_cloture_labels.py` | Vérifie les labels de clôture |
| `check_therapy_coherence.py` | Vérifie la cohérence des thérapies |
| `check_therapy_content_issues.py` | Détecte les problèmes de contenu thérapeutique |
| `test_complex_properties.py` | Teste les propriétés complexes |
| `test_improved_sections.py` | Teste les sections améliorées |
| `test_mnemo_fix.py` | Teste les corrections de mnémoniques |
| `test_rescos3.py` | Tests spécifiques RESCOS v3 |
| `test_resume_generation.py` | Teste la génération de résumés |
| `test_therapy_colors.py` | Teste la coloration des thérapies |

### Usage

```bash
# Exécuter un test
python scripts/validation/check_therapy_coherence.py

# Valider tous les JSON AMBOSS
python scripts/validation/test_complex_properties.py generated/json/AMBOSS/
```

---

## 📝 Dossier `standardization/`

Scripts pour standardiser la terminologie et les formats.

### Scripts principaux

| Script | Description |
|--------|-------------|
| `standardize_json_terminology.py` | Standardise la terminologie médicale |
| `standardize_feuille_porte_json.py` | Standardise les feuilles-porte |
| `standardize_german_titles.py` | Standardise les titres allemands |
| `standardize_rescos_titles.py` | Standardise les titres RESCOS |
| `standardize_cloture_usmle.py` | Standardise les clôtures USMLE |
| `standardize_contre_arguments.py` | Standardise les arguments CONTRE |

### Remplacements automatiques

Ces scripts appliquent les règles de standardisation définies dans [CLAUDE.md](../CLAUDE.md) :

**Imagerie :**
- TDM → CT
- angio-TDM → angio-CT
- Échographie → US

**Biologie :**
- Hémoccult → Test FIT
- CK-(MB) → CK-MB
- formule sanguine → FSC

**Unités :**
- pouls → fc (fréquence cardiaque)
- /min pour FR, bpm pour FC

### Usage

```bash
# Standardiser tous les JSON d'un dossier
python scripts/standardization/standardize_json_terminology.py generated/json/AMBOSS/

# Standardiser un fichier spécifique
python scripts/standardization/standardize_feuille_porte_json.py generated/json/RESCOS/Ictere.json
```

---

## 🛠️ Dossier `utils/`

Utilitaires divers pour corrections et conversions.

### Corrections

Scripts préfixés par `fix_*` :
- `fix_amboss_32_therapy.py` : Correction thérapie cas AMBOSS #32
- `fix_arguments_contre_escaping.py` : Correction échappement arguments
- `fix_cloture_labels.py` : Correction labels de clôture
- `fix_generator.py` : Corrections du générateur
- `fix_remaining_treatments.py` : Corrections traitements restants
- `fix_rescos_cloture.py` : Corrections clôture RESCOS

### Conversions

Scripts préfixés par `convert_*` :
- `convert_therapy_sections.py` : Conversion sections thérapeutiques
- `convert_all_therapy_to_content.py` : Conversion thérapie → contenu

### Mises à jour

Scripts préfixés par `update_*` :
- `update_presentation_enhanced.py` : Mise à jour présentation améliorée
- `update_presentation_function.py` : Mise à jour fonction présentation
- `update_thieme_titles.py` : Mise à jour titres Thieme

### Nettoyage

Scripts préfixés par `clean_*` :
- `clean_therapy_sections.py` : Nettoyage sections thérapeutiques

### Autres

- `analyze_and_restore_cloture.py` : Analyse et restauration clôture
- `final_therapy_cleanup.py` : Nettoyage final thérapies
- `generate_test_grid.py` : Génération grille de test
- `import_cases_to_db.py` : Import des cas en base de données
- `restore_therapy_sections.py` : Restauration sections thérapeutiques
- `restructure_therapy_sections.py` : Restructuration thérapies

---

## 🔗 Workflow typique

### 1. Génération depuis PDF

```bash
# Placer le PDF dans source-data/pdf/
python scripts/generation/process_amboss_files.py
```

### 2. Standardisation

```bash
# Standardiser la terminologie
python scripts/standardization/standardize_json_terminology.py generated/json/AMBOSS/
```

### 3. Validation

```bash
# Vérifier la cohérence
python scripts/validation/check_therapy_coherence.py
```

### 4. Correction si nécessaire

```bash
# Appliquer des corrections spécifiques
python scripts/utils/fix_remaining_treatments.py
```

### 5. Génération finale

```bash
# Utiliser le générateur HTML pour créer les grilles
# Ouvrir templates/generators/Generateur_de_Grilles_ECOS.html
```

---

## 📚 Voir aussi

- [CLAUDE.md](../CLAUDE.md) : Règles de standardisation complètes
- [Templates](../templates/) : Générateurs et modèles
- [Documentation](../docs/) : Documentation complète
- [Generated](../generated/) : Fichiers générés

---

## ⚙️ Configuration

Certains scripts nécessitent des variables d'environnement :

```bash
# Pour l'import en base de données
export DB_HOST=localhost
export DB_PASSWORD=votre_password
export DB_USER=postgres
export DB_NAME=ecos_db

python scripts/utils/import_cases_to_db.py
```

Voir [platform/backend/.env.example](../platform/backend/.env.example) pour la configuration complète.
