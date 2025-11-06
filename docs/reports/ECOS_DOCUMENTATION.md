# 📚 Documentation Complète - Système ECOS

## 🎯 Vue d'ensemble

Le système ECOS (Examen Clinique Objectif Structuré) est maintenant entièrement harmonisé, enrichi et prêt pour une utilisation en formation médicale. Cette documentation détaille toutes les fonctionnalités développées.

## 🚀 Démarrage Rapide

### 1. Interface de Consultation Interactive

```bash
# Lancer l'interface web
cd platform/ecos-viewer
python3 server.py

# L'interface s'ouvre automatiquement dans votre navigateur
# Accessible sur http://localhost:8080
```

### 2. Accès Direct aux Fichiers

- **Base de données finale** : `data-stat/ECOS_Cas_Enrichi_*_FINAL_*.csv`
- **Fichiers JSON pour formation** : `json_files_v3/`
- **Feuilles-porte JSON** : `feuille-porte/json/`
- **Page de test des cas** : `test_cases_ecos.html`

## 📊 Données Harmonisées et Enrichies

### Transformations Effectuées

1. **Suppression des codes ICD-10** ✅
   - Remplacés par les codes SSP PROFILES standardisés

2. **Enrichissement SSP PROFILES** ✅
   - 265 codes SSP standardisés appliqués
   - 66.6% des cas avec codes SSP reconnus
   - Format : `SSP-001` à `SSP-265`

3. **Catégorisation Thématique Affinée** ✅
   - Groupe "Autre" réduit de **92.2% → 13.1%**
   - 17 catégories médicales définies
   - Distribution équilibrée entre spécialités

4. **Gestion des Doublons** ✅
   - 5 doublons identifiés et traités
   - Dataset propre disponible (369 cas uniques)

5. **Intégration des PDFs** ✅
   - 21 cas enrichis avec données détaillées
   - 7 nouvelles colonnes d'informations cliniques
   - Score de complétude calculé pour chaque cas

### Statistiques Finales

- **Total de cas** : 374
- **Période couverte** : 2011-2025
- **Cas haute qualité (≥50%)** : 20
- **Catégories médicales** : 17
- **Fichiers JSON générés** : 748

## 🖥️ Interface de Consultation Interactive

### Fonctionnalités

#### 🔍 Recherche et Filtrage
- Recherche textuelle dans tous les champs
- Filtres par année, catégorie, code SSP
- Filtre par niveau de complétude
- Réinitialisation en un clic

#### 📈 Visualisations
- Graphique de distribution par catégorie
- Évolution temporelle des cas
- Top 10 des diagnostics les plus fréquents

#### 👁️ Modes de Vue
1. **Vue Cartes** : Aperçu visuel avec barres de complétude
2. **Vue Tableau** : Format tabulaire compact
3. **Vue Détaillée** : Informations complètes par cas

#### 📥 Options d'Export
- **CSV** : Export avec séparateur point-virgule
- **JSON** : Format structuré pour intégration
- **PDF** : Document imprimable
- **ECOS Formation** : Format spécial pour plateforme

### Architecture Technique

```
platform/ecos-viewer/
├── index.html         # Interface principale
├── styles.css         # Styles et mise en page
├── app.js            # Logique JavaScript
└── server.py         # Serveur Python simple
```

## 🎓 Export Plateforme ECOS Formation

### Structure des Fichiers JSON

Chaque cas ECOS est exporté dans un format structuré compatible avec le générateur de grilles :

```json
{
  "title": "Diagnostic - Année",
  "context": {
    "setting": "Service médical",
    "patient": "Description du patient",
    "vitals": {}
  },
  "sections": {
    "anamnese": {
      "weight": 0.25,
      "criteria": [...]
    },
    "examen": {
      "weight": 0.25,
      "criteria": [...]
    },
    "management": {
      "weight": 0.25,
      "criteria": [...]
    },
    "cloture": {
      "weight": 0,
      "criteria": [...]
    }
  },
  "annexes": {
    "informationsExpert": {...},
    "scenarioPatienteStandardisee": {...}
  },
  "metadata": {
    "year": "2024",
    "category": "Cardiologie",
    "ssp_code": "SSP-021",
    "completeness": 75.5
  }
}
```

### Utilisation avec le Générateur de Grilles

1. **Ouvrir le générateur** : `Chablon/Generateur_de_Grilles_ECOS.html`
2. **Charger un fichier JSON** : Sélectionner depuis `json_files_v3/`
3. **Générer la grille** : HTML et PDF automatiques
4. **Utiliser en formation** : Mode examen avec timer 13 minutes

## 📁 Structure des Répertoires

```
ecos-grid-generator/
├── data-stat/
│   ├── ECOS_Cas_*.csv              # Données harmonisées
│   ├── ECOS_Rapport_*.txt          # Rapports d'analyse
│   └── ECOS_Mapping_*.json         # Mappings appliqués
├── json_files_v3/
│   ├── ECOS_Master_Index.json      # Index principal
│   └── [374 fichiers JSON]         # Cas individuels
├── feuille-porte/
│   └── json/
│       └── [374 feuilles-porte]    # Instructions patients
├── platform/
│   └── ecos-viewer/                # Interface interactive
├── scripts/
│   ├── harmonize_ecos_cases.py     # Harmonisation
│   ├── enrich_ssp_profiles.py      # Enrichissement SSP
│   ├── refine_categorization.py    # Catégorisation
│   ├── integrate_pdf_content.py    # Intégration PDFs
│   └── export_to_ecos_platform.py  # Export formation
└── test_cases_ecos.html            # Page de test
```

## 🔧 Scripts Utilitaires

### 1. Harmonisation Complète
```bash
python3 scripts/harmonize_ecos_cases.py
```

### 2. Enrichissement SSP
```bash
python3 scripts/enrich_ssp_profiles.py
```

### 3. Affinement Catégorisation
```bash
python3 scripts/refine_categorization.py
```

### 4. Intégration PDFs
```bash
python3 scripts/integrate_pdf_content.py
```

### 5. Export Formation
```bash
python3 scripts/export_to_ecos_platform.py
```

## 📈 Métriques de Qualité

### Score de Complétude
- **Calcul** : Basé sur la présence de données dans les champs clés
- **Pondération** : Données PDF valent double
- **Seuils** :
  - ≥ 75% : Haute qualité ✅
  - 50-75% : Qualité moyenne ⚠️
  - < 50% : À compléter ❌

### Top 5 Cas les Plus Complets
1. Spondylarthrite ankylosante (2014) : 100%
2. Épicondylite latérale (2016) : 94.4%
3. Dermohypodermite (2013) : 88.9%
4. Eczéma (2013) : 88.9%
5. Syndrome de Stevens-Johnson (2016) : 88.9%

## 🌐 API et Intégration

### Endpoints Disponibles (si serveur déployé)
```
GET /data-stat/*.csv           # Données CSV
GET /json_files_v3/*.json      # Cas JSON
GET /api/cases                 # Liste des cas (à implémenter)
GET /api/cases/:id            # Détails d'un cas (à implémenter)
```

### Formats Supportés
- CSV (séparateur `;`)
- JSON
- HTML
- PDF (via générateur)

## 🚀 Déploiement en Production

### Option 1 : Serveur Local
```bash
cd platform/ecos-viewer
python3 server.py
```

### Option 2 : Docker (à implémenter)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python3", "platform/ecos-viewer/server.py"]
```

### Option 3 : Intégration Plateforme Existante
- Importer les fichiers JSON dans votre LMS
- Utiliser le générateur de grilles existant
- Adapter les styles CSS selon votre charte

## 📝 Notes pour les Formateurs

### Utilisation en Examen
1. Sélectionner les cas par niveau de difficulté
2. Utiliser le timer 13 minutes intégré
3. Activer le mode examen (désactive les aides)
4. Exporter les résultats en PDF

### Personnalisation
- Modifier les critères d'évaluation dans le JSON
- Ajuster les pondérations (25% par section)
- Ajouter des images via le champ `annexes.images`
- Créer des scénarios patient personnalisés

## 🆘 Support et Maintenance

### Problèmes Courants

**Interface ne charge pas les données**
- Vérifier que le serveur Python est lancé
- Vérifier les chemins des fichiers CSV
- Ouvrir la console du navigateur pour les erreurs

**Export JSON incomplet**
- Vérifier la complétude des données source
- Augmenter les seuils de filtrage si nécessaire

**Grilles ECOS non générées**
- Vérifier la structure JSON
- Utiliser le validateur JSON intégré

## 📚 Ressources Complémentaires

- [Documentation PROFILES](data-stat/PROFILES_ImpGuide_vf2.pdf)
- [Exemples ECOS 2013-2017](data-stat/ECOS-Anciens%20sujets-2013-2017.pdf)
- [Guide Swiss Medical](data-stat/smw_2020_20201.pdf)

## 🏆 Résultat Final

Le système ECOS est maintenant :
- ✅ **Harmonisé** : Données cohérentes et standardisées
- ✅ **Enrichi** : Informations cliniques détaillées ajoutées
- ✅ **Catégorisé** : 17 spécialités médicales identifiées
- ✅ **Codifié** : SSP PROFILES appliqués (265 codes)
- ✅ **Interactif** : Interface web moderne et responsive
- ✅ **Exportable** : Multiples formats pour différents usages
- ✅ **Prêt pour la formation** : 748 fichiers JSON générés

---

**Version** : 3.0
**Date** : 24 octobre 2025
**Auteur** : Système ECOS Grid Generator

Pour toute question ou amélioration, consultez le fichier [CLAUDE.md](CLAUDE.md) pour les instructions de développement.