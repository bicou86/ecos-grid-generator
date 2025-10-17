# Système de Génération de Grilles ECOS

Système automatisé pour la génération de grilles d'évaluation ECOS (Examen Clinique Objectif Structuré) pour les examens médicaux suisses.

## 🎯 Fonctionnalités

- **Génération automatique** de grilles ECOS standardisées à partir de fichiers JSON
- **Traduction intégrée** de cas cliniques (allemand → français)
- **Système de notation dynamique** avec calcul en temps réel
- **Mode examen** avec minuteur ECOS (13 minutes)
- **Export PDF** automatique des grilles et feuilles-porte
- **Structure standardisée** pour tous les cas cliniques

## 📁 Structure du Projet

```
├── A_traiter/                          # PDFs à traiter (cas en allemand)
├── A_reformatter/                      # HTMLs à reformatter
├── Chablon/                            # Templates et générateurs
│   ├── Model - Feuille Porte.html     # Template feuille-porte
│   ├── Model - Grille ECOS.html       # Template grille ECOS
│   ├── Model - Grille ECOS.json       # Structure JSON type
│   └── Generateur_de_Grilles_ECOS_*.html  # Générateurs (v4, v5, v6)
├── json_files/                         # Fichiers JSON générés
├── feuille-porte/                      # Feuilles-porte générées
│   ├── html/                           
│   └── pdf/                            
├── grilles_generees/                   # Grilles ECOS générées
│   ├── html/                           
│   └── pdf/                            
└── migrate_*.js                        # Scripts de migration
```

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone [URL_DU_REPO]
cd [NOM_DU_REPO]
```

2. Installez les dépendances (si nécessaire) :
```bash
npm install
```

## 📖 Utilisation

### 1. Génération depuis un PDF (allemand)

Placez le PDF dans le dossier `A_traiter/`, puis :
- Extraction automatique du contenu
- Traduction en français
- Génération du JSON structuré
- Création automatique des grilles HTML/PDF

### 2. Génération depuis un JSON existant

Ouvrez `Chablon/Generateur_de_Grilles_ECOS_v6.html` et suivez les instructions.

### 3. Migration de structure

Pour migrer vers la structure v3 mixte :
```bash
node migrate_40_files_mixte.js
```

## 📊 Structure des Données

### Format JSON Principal

```json
{
  "title": "Titre du cas",
  "context": {
    "setting": "Lieu clinique",
    "patient": "Description patient",
    "vitals": {
      "ta": "140/90 mmHg",
      "fc": "72 bpm",
      "fr": "16/min",
      "temperature": "37.2°C"
    }
  },
  "sections": {
    "anamnese": { "weight": 0.25, "criteria": [...] },
    "examen": { "weight": 0.25, "criteria": [...] },
    "management": { "weight": 0.25, "criteria": [...] },
    "cloture": { "weight": 0, "criteria": [...] }
  },
  "annexes": {
    "informationsExpert": {...},
    "scenarioPatienteStandardisee": {...},
    "theoriePratique": {...}
  }
}
```

## 🔧 Fonctionnalités Techniques

### Système de Notation
- **Critères binaires** : 0 ou 2 points
- **Critères graduels** : 0, 1 ou 2 points  
- **Pondération automatique** : 25% par section
- **Note globale** : A (≥90%), B (80-89%), C (70-79%), D (60-69%), E (<60%)

### Mode Examen
- Minuteur 13 minutes avec alertes sonores
- Verrouillage automatique des checkboxes
- Coloration selon les scores après fin du temps

### Codes Couleur
- 🔴 Diagnostics différentiels
- 🟢 Examens complémentaires
- 🔵 Commentaires patient [entre crochets]
- 🟡 Phrases types du candidat

## 🛠️ Scripts Utiles

- `migrate_annexes_to_v3_mixte.js` : Migration vers structure v3
- `migrate_40_files_mixte.js` : Migration batch 40 fichiers
- `analyze_migration_losses.js` : Analyse des pertes de données

## 📝 Conventions

- **Nomenclature fichiers** : `[Titre] - Grille ECOS.html`
- **Signes vitaux** : ta, fc, fr, temperature (labels standardisés)
- **Vouvoiement** systématique dans les traductions
- **Terminologie médicale** française standardisée

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence [À DÉFINIR].

## 👥 Auteurs

- Damien Fulliquet - Développement initial

## 🙏 Remerciements

- Claude AI pour l'assistance au développement
- Communauté médicale suisse pour les retours