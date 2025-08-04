# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ECOS (Examen Clinique Objectif Structuré) evaluation system for Swiss medical examinations. It provides tools to generate standardized clinical case evaluation grids in HTML format.

## Instructions pour Claude Code

**PRINCIPE FONDAMENTAL** : Claude Code doit traiter l'intégralité du workflow en une seule session, de l'extraction PDF à la génération finale, sans déléguer à d'autres outils sauf impossibilité technique absolue.

### Ordre de priorité pour l'extraction PDF :
1. **PREMIER** : Tentative de lecture directe du fichier PDF
2. **SECOND** : Utilisation de bibliothèques d'extraction (pdf-parse, etc.)  
3. **DERNIER RECOURS** : Demander le copier-coller à l'utilisateur

### Règles de retranscription pour copier-coller manuel :
Si l'extraction automatique échoue et que l'utilisateur doit copier-coller le contenu :

**Règle 1 - Réponses/comportement du patient** :
Tout ce qui concerne les réponses attendues ou le comportement du patient doit être retranscrit entre crochets [].
```
Exemple : "Beginn [seit ca 1 Monat]"
```

**CONVENTION IMPORTANTE** :
- **Parenthèses ()** = détails explicatifs
- **Crochets []** = réponses du patient
- Les crochets sont automatiquement colorés en bleu dans les grilles générées
- **EXCEPTION** : Commentaire/info patient = entre crochets [], SAUF dans la propriété JSON "patientComment" où les crochets ne sont PAS utilisés

**Règle 2 - Sous-critères** :
S'il y a des sous-critères qui font partie d'une seule ligne dans la grille, mettre un tiret " - " devant chaque sous-critère.
**IMPORTANT** : Les puces (•) dans les retranscriptions doivent être traitées comme des tirets (-) indiquant des sous-critères groupés sous un seul critère principal. Dans le JSON, utiliser la propriété "details" avec un tableau pour regrouper ces éléments.
```
Exemple :
Critère 1
Critère 2
  - Sous-critère i
  - Sous-critère ii 
  - Sous-critère iii
Critère 3
```

**Structure JSON pour les sous-critères** :
```json
{
  "id": "e2",
  "text": "Palpation",
  "details": [
    "Processus coracoïde",
    "Articulation acromio-claviculaire",
    "Coiffe des rotateurs (tubercule majeur et mineur)",
    "Biceps"
  ]
}
```

### Traduction obligatoire :
- **TOUJOURS** traduire directement sans passer par le navigateur
- **JAMAIS** suggérer d'utiliser Claude AI web sauf échec technique démontré

## Key Commands

### First step: Generate JSON files from PDF
1. **Extraction automatique** : Lire directement chaque fichier PDF du dossier "A_traiter"
2. **Traduction intégrée** : Traduire automatiquement de l'allemand au français dans la même session
   Points clés de la traduction :
   - Utilisation du vouvoiement approprié
   - Terminologie médicale française précise
3. Générer feuille-porte en français `feuille-porte/html/[titre] - Feuille Porte.html` en respectant EXACTEMENT la structure HTML et le style CSS du modèle `Chablon/Model - Feuille Porte.html`:
    - Structure HTML avec classe `feuille-porte`
    - Titre aligné à droite avec couleur #bfbfbf et classe `titre-station`
    - Marges spécifiques : h2 avec `margin: 60px 0 100px 0`
    - Section contexte avec `margin: 100px 0 100px 0`
    - Section tâches en position absolue : `position: absolute; top: 560px`
    - Police Arial et line-height spécifiques
    - Styles d'impression avec @media print
4. Générer JSON en français `json_files/[titre].json` en respectant la structure standardisée fournie dans `Chablon/Model - Grille ECOS.json` comme modèle

### Format standardisé pour les fichiers JSON feuille-porte
Les fichiers JSON feuille-porte doivent respecter strictement ce format :

```json
{
  "titre": "[Titre du cas]",
  "contexte": "[Lieu/Service]",
  "description": "[Nom], [âge] ans, [présentation clinique]",
  "signesVitaux": {
    "tensionArterielle": "[valeur] mmHg",
    "temperature": "[valeur]°C",
    "frequenceRespiratoire": "[valeur]/min",
    "frequenceCardiaque": "[valeur] bpm",
    "imc": "[valeur] kg/m²"
  },
  "taches": [
    "Prendre une anamnèse ciblée",
    "Réaliser un examen clinique ciblé (ne pas réaliser d'examen rectal)",
    "Expliquer votre impression clinique et le plan d'examens complémentaires au patient"
  ]
}
```

**Notes importantes :**
- La propriété `signesVitaux` est optionnelle - à inclure seulement si présente dans le document original
- Séparer le contexte (lieu) de la description (patient et motif)
- Utiliser "taches" (au pluriel), pas "tache"
- Les unités standardisées : bpm pour FC, /min pour FR
- Formulation minuscule pour les exclusions d'examen

### Structure JSON standardisée pour cas AMBOSS
Pour tous les cas AMBOSS (et futurs cas similaires), utiliser la structure détaillée basée sur `json_files/Douleur thoracique - Homme de 46 ans.json` :

**Structure de l'anamnèse standardisée :**
```json
"anamnese": {
  "weight": 0.25,
  "criteria": [
    {"id": "a1", "text": "Motif principal", "binaryOnly": true},
    {"id": "a2", "text": "Caractérisation de la douleur/symptôme principal", "details": [...]},
    {"id": "a3", "text": "Symptômes associés", "details": [...]},
    {"id": "a4", "text": "Recherche de symptômes spécifiques", "details": [...]},
    {"id": "a5", "text": "Antécédents médicaux"},
    {"id": "a6", "text": "Antécédents chirurgicaux"},
    {"id": "a7", "text": "Allergies"},
    {"id": "a8", "text": "Médicaments"},
    {"id": "a9", "text": "Hospitalisations"},
    {"id": "a10", "text": "Contacts malades"},
    {"id": "a11", "text": "Antécédents familiaux", "details": [...]},
    {"id": "a12", "text": "Habitudes et mode de vie", "details": [...]}
  ]
}
```

**Regroupement obligatoire en "details" :**
- Utiliser systématiquement `"details": [...]` pour regrouper les sous-critères
- Format : `"Sous-critère [réponse patient entre crochets]"`
- Les `details` remplacent les critères individuels multiples

**Sections spécialisées dans les critères :**
- `ddSection` : TOUJOURS dans un critère de management
- `therapySection` : Dans un critère de management si pertinent
- `redflagsSection` : Dans un critère de management si pertinent
- Ces sections ne sont JAMAIS au niveau racine des sections

### Second step: Generate HTML and PDF files automatically
Claude Code génère automatiquement les fichiers finaux à partir du JSON :
- **Grille HTML** : `grilles_generees/html/[titre] - Grille ECOS.html` : Grille d'évaluation interactive suivant EXACTEMENT le modèle `Chablon/Model - Grille ECOS.html`
- **Grille PDF** : `grilles_generees/pdf/[titre] - Grille ECOS.pdf` : Version PDF de la grille pour impression (générée avec Puppeteer)
- **Feuille-porte PDF** : `feuille-porte/pdf/[titre] - Feuille Porte.pdf` : Version PDF de la feuille-porte pour impression (générée avec Puppeteer)

**WORKFLOW AUTOMATIQUE COMPLET** :
1. Lecture JSON → Génération HTML → Génération PDF
2. **4 fichiers finaux** créés automatiquement en une seule commande
3. **JavaScript fonctionnel** avec calculs de scores en temps réel
4. **PDF haute qualité** avec formatting préservé

**STRUCTURE OBLIGATOIRE pour la grille ECOS** (basée sur `Chablon/Model - Grille ECOS.html`) :
- Header bleu avec contexte et signes vitaux **adaptatifs** (grid responsive selon vitaux disponibles)
- Sections avec bordures et headers colorés
- Grid CSS pour les critères (5 colonnes : critères, Oui, ±, Non, Points)
- **Support intégré** pour ddSection et therapySection dans les critères
- Section communication avec échelle A-E (6 colonnes)
- Section totaux avec 3 blocs (Score Total, % par Section, Note Globale)
- Couleurs dynamiques selon les notes (A=vert, B=bleu, C=jaune, D=orange, E=rouge)
- JavaScript pour calcul en temps réel avec pondération (25%, 25%, 25%, 25%)
- **Bouton "Imprimer en PDF"** intégré (bouton flottant en bas à droite)

### Apply the structure to html files already in French
1. Reverse the clinical data of each html files in "A_reformatter" to generate a JSON
2. Generate ECOS Grid so all the cases have the same format

### Structure complète des annexes obligatoires pour cas AMBOSS
**Annexes obligatoires dans l'ordre :**
1. **Images** : Toutes les images `AMBOSS-[numéro]-img[X]-[description].jpg` du dossier `grilles_generees/html/images/`
2. **scenarioPatienteStandardisee** : Instructions détaillées pour le patient standardisé
3. **informationsExpert** : Points clés et pièges pour l'expert
4. **theoriePratique** : Sections théoriques avec `rappelsTherapeutiques` et `examensComplementaires`

**Structure des sections théoriques :**
```json
"theoriePratique": {
  "sections": [...],
  "rappelsTherapeutiques": [
    "Point thérapeutique 1",
    "Point thérapeutique 2"
  ],
  "examensComplementaires": [
    "Examen 1 : description technique",
    "Examen 2 : description technique"
  ]
}
```

**Section communication automatique :**
- La section `communication` est SUPPRIMÉE du JSON
- Elle est automatiquement générée par le générateur
- Seule la section `cloture` est conservée pour les défis spécifiques

### Processing French ECOS/RESCOS cases (no translation needed)
Claude Code doit également traiter des cas ECOS déjà en français avec des défis spécifiques :

**DÉFIS SPÉCIFIQUES** :
- **Structure variable** : PDF français peuvent avoir des formats très différents (grilles tabulaires, texte libre, formats mixtes)
- **Extraction adaptative** : Analyser chaque PDF individuellement pour identifier sa structure
- **Standardisation** : Adapter le contenu au format JSON unifié malgré la variabilité

**WORKFLOW FRANÇAIS** :
1. **Analyse structurelle automatique** : Identifier le type de document (RESCOS, examen fédéral, format libre)
2. **Extraction intelligente** : 
   - Détecter les sections Anamnèse/Status/Management/Communication
   - Extraire critères d'évaluation et seuils de notation
   - Récupérer contexte patient et consignes
3. **Standardisation JSON** : Même structure finale que pour les cas allemands
4. **Génération** : Créer les 4 fichiers finaux standardisés

**EXEMPLES DE FORMATS RENCONTRÉS** :
- Format RESCOS (Ictère, Fièvre) : Grilles HTML structurées
- Format examen fédéral : PDFs avec feuilles-porte séparées  
- Format mixte : Informations à reconstituer

**DOSSIER SÉPARÉ** : Utiliser `A_traiter_francais/` pour distinguer du workflow de traduction

### Validation automatique
Claude Code doit vérifier :
- Terminologie médicale française précise
- Vouvoiement systématique
- Structure JSON conforme au modèle
- Nomenclature des fichiers cohérente

## Architecture

### Data Flow
1. **Input**: PDF with clinical case in German to translate and adapt to generate JSON file with clinical case data in French
2. **Processing**: JavaScript in `Chablon/Generateur_de_Grilles_ECOS.html` transforms JSON to HTML automatically 
3. **Output**: Standalone HTML file with embedded CSS/JS for interactive scoring + PDF versions

### JSON Structure
```json
{
  "title": "Case title",
  "context": {
    "setting": "Clinical setting",
    "patient": "Patient description",
    "vitals": { /* vital signs */ }
  },
  "sections": {
    "anamnese": { "weight": 0.25, "criteria": [...] },
    "examen": { "weight": 0.25, "criteria": [...] },
    "management": { "weight": 0.25, "criteria": [...] }
  }
}
```

### Gestion des signes vitaux dans le JSON
- **SI** les signes vitaux sont mentionnés dans le PDF → les inclure avec leurs valeurs
- **SI** les signes vitaux ne sont PAS mentionnés dans le PDF → **NE PAS inclure la propriété vitals** dans le JSON
- **SI** seulement certains signes vitaux sont mentionnés → inclure seulement ceux mentionnés

**CONVENTIONS OBLIGATOIRES pour les signes vitaux :**
- **Labels standardisés** : Toujours utiliser "ta", "fc", "fr", "temperature"
- **Unités standardisées** :
  - `"ta": "[valeur] mmHg"` (ex: "140/90 mmHg")
  - `"fc": "[valeur] bpm"` (ex: "72 bpm") - JAMAIS "/min"
  - `"fr": "[valeur]/min"` (ex: "16/min")
  - `"temperature": "[valeur]°C"` (ex: "37.2°C")
- **Remplacements automatiques** : "pouls" → "fc", "frequence_respiratoire" → "fr"

**Exemples :**
```json
// Cas 1: Aucun signe vital mentionné
"context": {
  "setting": "Cabinet de médecine générale",
  "patient": "Homme de 70 ans consultant pour contrôle"
}

// Cas 2: Seulement température mentionnée  
"context": {
  "setting": "Cabinet de médecine générale", 
  "patient": "Homme de 70 ans consultant pour contrôle",
  "vitals": {
    "temperature": "38.2°C"
  }
}

// Cas 3: Plusieurs signes vitaux mentionnés
"context": {
  "setting": "Cabinet de médecine générale",
  "patient": "Homme de 70 ans consultant pour contrôle", 
  "vitals": {
    "ta": "140/90 mmHg",
    "fc": "72 bpm",
    "fr": "16/min",
    "temperature": "37.1°C"
  }
}
```

### Scoring System
- **Binary criteria**: `"binaryOnly": true` → 0 or 2 points only
- **Graduated criteria**: Default → 0, 1, or 2 points
- **Section score calculation**: Sum 0, 1, or 2 points per criteria for each criteria / MaxPoint (MaxPoint = Number of criteria * 2)
- **Communication section**: Automatically added (25% weight, A-E scale)
- **Total score calculation**: Apply the "weight" of the section to the section score in %
- **Grade calculation**: A (≥90%), B (80-89%), C (70-79%), D (60-69%), E (<60%)

### Key Features in Generated Grids
- **Real-time score calculation** with dynamic section percentages
- **Visual grade indicators** with color-coded totals (A-E)
- **Missing item tracking** with detailed feedback
- **Patient response coloration** : brackets `[text]` automatically colored in blue
- **Expandable details** for complex criteria with ddSection and therapySection
- **Adaptive vital signs display** (responsive grid based on available vitals)
- **Dual mode system** : Revision mode (always active) vs Exam mode (timer-controlled)
- **13-minute ECOS timer** with audio feedback (start/stop/reset controls, audio cues at start, 2-min warning, and end)
- **Automatic scoring post-timer** (checkboxes disabled before/after timer, automatic coloration based on scores after timer ends)
- **Smart lacune detection** : "🎯 Identifier les lacunes" button for revision mode
- **Integrated PDF printing** button (floating button, bottom-right position)
- **Consistent file naming** : `[titre] - Grille ECOS.html` and `[titre] - Feuille Porte.html`
- **Advanced sections support** :
  - ddSection (diagnostic differentials with categories and tests)
  - therapySection (treatment protocols with structured content)
  - redflagsSection (warning signs with descriptions)
  - scoringRule (custom scoring instructions)

### Key structure in Generated Grids
ECOS grids follow a standard 4-section format with a constant coefficient ("weight") for each section independently of the number of questions/criteria per section
- **Anamnèse** (25%): History taking
- **Examen clinique** (25%): Clinical examination  
- **Management** (25%): Treatment and planning
- **Communication** (25%): Patient interaction skills

### File Organization
```
├── A_traiter/                          # PDF files to process
├── A_reformatter/                      # HTML files to reformat
├── Chablon/
│   ├── Model - Feuille Porte.html      # Template for door sheets
│   ├── Model - Grille ECOS.html        # Template for ECOS grids
│   ├── Model - Grille ECOS.json        # JSON structure template
│   └── Generateur_de_Grilles_ECOS.html # Generator tool
├── json_files/                         # Generated JSON files
├── feuille-porte/
│   ├── html/                          # HTML door sheets
│   └── pdf/                           # PDF door sheets
└── grilles_generees/
    ├── html/                          # HTML grids
    └── pdf/                           # PDF grids
```

## Règles de formatage et coloration

### Enrichissement des commentaires patient
Pour tous les cas ECOS, enrichir les détails de l'examen clinique avec les résultats trouvés dans la note de consultation. Par exemple :
- "Recherche de turgescence jugulaire" → "Recherche de turgescence jugulaire [Pas de TJ]"
- "Auscultation carotidienne" → "Auscultation carotidienne [Pas de souffle]"

### Code couleur obligatoire dans les grilles générées
1. **Diagnostics différentiels** (dans ddSection) : Rouge (RVB: 169, 34, 23)
2. **Examens complémentaires** : Vert (RVB: 52, 105, 46)
   - Inclut : ECG, CT, IRM, toxicologie urinaire, radiographie thoracique/pulmonaire/abdominale, US, échographie, échocardiographie, angio-CT thoracique/pulmonaire/abdominal, CK, CK-MB, Échocardiographie transthoracique (ETT), etc.
3. **Questions difficiles du patient** : Entre crochets [] et colorés en bleu (RVB: 44, 90, 160)
4. **Exemples de phrases du candidat** (Clôture type et Réponse type) : Vert clair (RVB: 112, 188, 123)
5. **Commentaires patient** : Entre crochets [] et colorés en bleu (RVB: 44, 90, 160)
6. **Arguments dans ddSection** : Gris foncé (RVB: 100, 100, 100)
7. **exemplesPhrases** (phrases types du candidat) : Vert clair (RVB: 112, 188, 123) avec légère transparence

### Section Clôture obligatoire
Ajouter entre Management et Communication une section "Clôture" comprenant :
- Clôture type : Exemple de phrase de clôture de consultation
- Questions difficiles à poser : Questions délicates du patient (entre crochets)
- Réponse type du candidat : Exemple de réponse appropriée

### Structure des diagnostics différentiels (ddSection)
**Format obligatoire :**
- **TOUJOURS inclure un "title"** dans ddSection (ex: "Diagnostics différentiels à considérer")
- Utiliser "Arguments POUR:\n\t..." au lieu de "Anamnèse / Signes cliniques:\n\t..."
- Ajouter un taquet de tabulation devant chaque argument
- Utiliser "□" à la place des tirets "-"
- Les arguments sont automatiquement colorés en gris bleué dans le générateur

**Exemple :**
```json
"ddSection": {
  "title": "Diagnostics différentiels à considérer",
  "categories": [
    {
      "name": "Causes prioritaires",
      "items": [
        {
          "text": "Diagnostic 1",
          "cause": "Arguments POUR:\n\t□ Symptôme 1\n\t□ Symptôme 2",
          "test": "→ Examen recommandé"
        }
      ]
    }
  ]
}
```

## Préférences orthographiques et terminologie

### Remplacements terminologiques obligatoires
Les termes suivants doivent TOUJOURS être remplacés lors de la traduction et génération des JSON :

**Imagerie et examens :**
- "TDM" → "CT"
- "angio-TDM" → "angio-CT"
- "CT crâne" → "CT cérébral"
- "IRM crâne" → "IRM cérébrale"
- "TEP TDM" → "PET scan"
- "TEP-scan" → "PET scan"
- "Échographie" → "US"
- "CPRE" → "ERCP"

**Biologie et marqueurs :**
- "Hémoccult" → "Test FIT (recherche de sang occulte dans les selles)"
- "CK-(MB)" → "CK-MB"
- "formule sanguine" → "FSC"
- "Numération" → "NFS"
- "anticorps anti-nucléaires" → "anticorps anti-nucléaires (ANA)"
- "PAL" → "phosphatases alcalines (PAL)"
- "PA" → "phosphatases alcalines (PAL)"
- "GGT" → "Gamma-GT"

**Pathologies :**
- "Maladie inflammatoire chronique de l'intestin" → "Maladie inflammatoire chronique de l'intestin (MICI)"

## Structures JSON de référence

### Structure des sections principales (structure_sections.json)
Les sections principales d'évaluation suivent cette structure standardisée :

```json
{
  "sections": {
    "anamnese": {
      "weight": 0.25,
      "title": "Anamnèse",  // Titre personnalisé optionnel
      "criteria": [
        {
          "id": "",
          "text": "",
          "subheader": "",
          "binaryOnly": false,
          "patientComment": "",
          "details": [],
          "scoringRule": "",
          "description": "",  // Description en italique avant le critère
          "exemplesPhrases": [],  // Phrases types du candidat en vert clair
          "ddSection": {
            "title": "",
            "categories": [
              {
                "name": "",
                "subcategory": "",  // Sous-catégorie optionnelle
                "conditions": [],   // Conditions pour la catégorie
                "items": [
                  {
                    "text": "",
                    "cause": "",
                    "test": "",
                    "treatment": "",  // Traitement proposé
                    "details": "",    // Détails supplémentaires
                    "duration": ""    // Durée du traitement
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "examen": { /* structure similaire */ },
    "management": {
      /* structure similaire avec en plus : */
      "criteria": [{
        "therapySection": {
          "categories": [{
            "title": "",
            "content": "",
            "name": "",      // Alternative à title
            "items": [{      // Structure détaillée des traitements
              "treatment": "",
              "details": "",
              "duration": ""
            }]
          }]
        },
        "redflagsSection": {
          "title": "",
          "items": [{
            "text": "",
            "description": ""
          }]
        }
      }]
    },
    "cloture": {
      "weight": 0,
      "criteria": [{
        "id": "",
        "text": "",
        "content": ""
      }]
    },
    "presentation": { /* pour cas non-ECOS standard */ },
    "raisonnement": { /* pour cas non-ECOS standard */ },
    "examens": { /* pour cas non-ECOS standard */ }
  }
}
```

### Structure des annexes (structure_annexes.json)
Les annexes contiennent toutes les informations supplémentaires :

```json
{
  "annexes": {
    "images": [{
      "id": "",         // Identifiant unique
      "title": "",
      "description": "",
      "data": "",       // Chemin base64 ou relatif
      "filename": ""    // Alternative à data
    }],
    "scenarioPatienteStandardisee": {
      "titre": "",
      "nom": "",
      "age": "",
      "contexte": "",
      "motifConsultation": {
        "plaintePrincipale": "",
        "autreChose": ""
      },
      "histoireActuelle": {
        // Sections possibles (peuvent être string ou array) :
        "evenementPrincipal": "",
        "prodromes": "",
        "postcritique": "",
        "symptomesAbsents": "",
        "symptomesPrincipaux": [],
        "symptomePrincipal": [],
        "douleurAbdominale": [],
        "signesAssocies": [],
        "symptomesAssocies": [],
        "reponseAuxSymptomes": [],
        "representationMaladie": [],
        "contextePsychosocial": [],
        "stress": [],
        "famille": [],
        "violence": [],
        "agressionPhysique": [],
        "agressionSexuelle": [],
        "traitements": {},
        "consommationSubstances": "",
        "contexteProfessionnel": ""
        // ... et bien d'autres
      },
      "simulation": {
        "attitude": [],
        "examenPhysique": [],
        "durantEntretien": [],
        "durantStatus": [],
        "durantExamen": [],
        "durantConsultation": [],
        "durantAppel": []
      },
      "anamneseSystemes": {
        "generale": [],
        "neurologique": [],
        "cardiovasculaire": [],
        "digestive": [],
        "psychiatrique": [],
        "urinaire": [],
        "gynecologique": [],
        "osteoArticulaire": [],
        "pulmonaire": [],        // Nouvelle section
        "genitourinaire": []     // Nouvelle section
      },
      "habitudes": {
        // Peut être un objet avec propriétés ou un tableau
        "medicaments": "",
        "tabac": "",
        "alcool": "",
        "cafe": "",
        "drogues": "",
        "sexualite": "",
        "activite": "",
        "autonomie": "",
        "alimentation": "",
        "activite_sexuelle": "",
        "social": "",
        "profession": "",
        "toxiques": ""
      },
      "informationsPersonnelles": {  // Nouvelle section
        "profession": "",
        "hobbies": "",
        "poids": "",
        "orientationSexuelle": "",
        "etatCivil": "",
        "etatEsprit": ""
      },
      "histoireMedicale": [],
      "expositions": {},
      "exposition": {},
      "alimentation": {},
      "histoireGynecologique": [],
      "informationsSurEnfant": {},
      "contexteSocial": {},
      "antecedents": {},
      "antecedentsMedicaux": {},
      "antecedentsEnfant": {},
      "traitements": {
        "actuels": [],
        "observance": "",
        "allergies": [],
        "psychiatriques": "",
        "effetsSecondaires": "",
        "iatrogenes": ""
      },
      "histoireSexuelle": {},
      "habitudesVie": {},
      "medicaments": {},
      "symptomesAssocies": {},
      "inquietudes": {
        "principales": [],
        "questions": []
      }
    },
    "informationsExpert": {
      "titre": "",
      "dossierMedical": "",
      "rolesInterventions": [],  // Sans liste à puces dans le générateur
      "pointsCles": [],
      "pieges": []
    },
    "theoriePratique": {
      "titre": "",
      "sections": [{
        "titre": "",
        "contenu": "",
        "points": []
      }],
      "rappelsTherapeutiques": [],
      "examensComplementaires": []
    },
    "defi": {                    // Section optionnelle
      "titre": "",
      "description": "",
      "reponseType": ""
    },
    "contexteSocial": {},        // Peut être au niveau racine
    "questionsEtReponses": {     // Pour cas non-USMLE/AMBOSS
      "challenges": [{
        "id": "",
        "text": "",
        "content": ""
      }]
    }
  }
}
```

### Notes importantes sur les structures
- Les propriétés peuvent être soit des chaînes, soit des tableaux selon le contexte
- Le générateur gère automatiquement les deux formats
- Les sections sont affichées uniquement si elles contiennent des données
- L'ordre d'affichage suit généralement l'ordre de déclaration dans le JSON

## Structures JSON de référence

### Structure des sections principales (structure_sections.json)
Les sections principales d'évaluation suivent cette structure standardisée :

```json
{
  "sections": {
    "anamnese": {
      "weight": 0.25,
      "title": "Anamnèse",  // Titre personnalisé optionnel
      "criteria": [
        {
          "id": "",
          "text": "",
          "subheader": "",
          "binaryOnly": false,
          "patientComment": "",
          "details": [],
          "scoringRule": "",
          "description": "",  // Description en italique avant le critère
          "exemplesPhrases": [],  // Phrases types du candidat en vert clair
          "ddSection": {
            "title": "",
            "categories": [
              {
                "name": "",
                "subcategory": "",  // Sous-catégorie optionnelle
                "conditions": [],   // Conditions pour la catégorie
                "items": [
                  {
                    "text": "",
                    "cause": "",
                    "test": "",
                    "treatment": "",  // Traitement proposé
                    "details": "",    // Détails supplémentaires
                    "duration": ""    // Durée du traitement
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "examen": { /* structure similaire */ },
    "management": {
      /* structure similaire avec en plus : */
      "criteria": [{
        "therapySection": {
          "categories": [{
            "title": "",
            "content": "",
            "name": "",      // Alternative à title
            "items": [{      // Structure détaillée des traitements
              "treatment": "",
              "details": "",
              "duration": ""
            }]
          }]
        },
        "redflagsSection": {
          "title": "",
          "items": [{
            "text": "",
            "description": ""
          }]
        }
      }]
    },
    "cloture": {
      "weight": 0,
      "criteria": [{
        "id": "",
        "text": "",
        "content": ""
      }]
    },
    "presentation": { /* pour cas non-ECOS standard */ },
    "raisonnement": { /* pour cas non-ECOS standard */ },
    "examens": { /* pour cas non-ECOS standard */ }
  }
}
```

### Structure des annexes (structure_annexes.json)
Les annexes contiennent toutes les informations supplémentaires :

```json
{
  "annexes": {
    "images": [{
      "id": "",         // Identifiant unique
      "title": "",
      "description": "",
      "data": "",       // Chemin base64 ou relatif
      "filename": ""    // Alternative à data
    }],
    "scenarioPatienteStandardisee": {
      "titre": "",
      "nom": "",
      "age": "",
      "contexte": "",
      "motifConsultation": {
        "plaintePrincipale": "",
        "autreChose": ""
      },
      "histoireActuelle": {
        // Sections possibles (peuvent être string ou array) :
        "evenementPrincipal": "",
        "prodromes": "",
        "postcritique": "",
        "symptomesAbsents": "",
        "symptomesPrincipaux": [],
        "symptomePrincipal": [],
        "douleurAbdominale": [],
        "signesAssocies": [],
        "symptomesAssocies": [],
        "reponseAuxSymptomes": [],
        "representationMaladie": [],
        "contextePsychosocial": [],
        "stress": [],
        "famille": [],
        "violence": [],
        "agressionPhysique": [],
        "agressionSexuelle": [],
        "traitements": {},
        "consommationSubstances": "",
        "contexteProfessionnel": ""
        // ... et bien d'autres
      },
      "simulation": {
        "attitude": [],
        "examenPhysique": [],
        "durantEntretien": [],
        "durantStatus": [],
        "durantExamen": [],
        "durantConsultation": [],
        "durantAppel": []
      },
      "anamneseSystemes": {
        "generale": [],
        "neurologique": [],
        "cardiovasculaire": [],
        "digestive": [],
        "psychiatrique": [],
        "urinaire": [],
        "gynecologique": [],
        "osteoArticulaire": [],
        "pulmonaire": [],        // Nouvelle section
        "genitourinaire": []     // Nouvelle section
      },
      "habitudes": {
        // Peut être un objet avec propriétés ou un tableau
        "medicaments": "",
        "tabac": "",
        "alcool": "",
        "cafe": "",
        "drogues": "",
        "sexualite": "",
        "activite": "",
        "autonomie": "",
        "alimentation": "",
        "activite_sexuelle": "",
        "social": "",
        "profession": "",
        "toxiques": ""
      },
      "informationsPersonnelles": {  // Nouvelle section
        "profession": "",
        "hobbies": "",
        "poids": "",
        "orientationSexuelle": "",
        "etatCivil": "",
        "etatEsprit": ""
      },
      "histoireMedicale": [],
      "expositions": {},
      "exposition": {},
      "alimentation": {},
      "histoireGynecologique": [],
      "informationsSurEnfant": {},
      "contexteSocial": {},
      "antecedents": {},
      "antecedentsMedicaux": {},
      "antecedentsEnfant": {},
      "traitements": {
        "actuels": [],
        "observance": "",
        "allergies": [],
        "psychiatriques": "",
        "effetsSecondaires": "",
        "iatrogenes": ""
      },
      "histoireSexuelle": {},
      "habitudesVie": {},
      "medicaments": {},
      "symptomesAssocies": {},
      "inquietudes": {
        "principales": [],
        "questions": []
      }
    },
    "informationsExpert": {
      "titre": "",
      "dossierMedical": "",
      "rolesInterventions": [],  // Sans liste à puces dans le générateur
      "pointsCles": [],
      "pieges": []
    },
    "theoriePratique": {
      "titre": "",
      "sections": [{
        "titre": "",
        "contenu": "",
        "points": []
      }],
      "rappelsTherapeutiques": [],
      "examensComplementaires": []
    },
    "defi": {                    // Section optionnelle
      "titre": "",
      "description": "",
      "reponseType": ""
    },
    "contexteSocial": {},        // Peut être au niveau racine
    "questionsEtReponses": {     // Pour cas non-USMLE/AMBOSS
      "challenges": [{
        "id": "",
        "text": "",
        "content": ""
      }]
    }
  }
}
```

### Notes importantes sur les structures
- Les propriétés peuvent être soit des chaînes, soit des tableaux selon le contexte
- Le générateur gère automatiquement les deux formats
- Les sections sont affichées uniquement si elles contiennent des données
- L'ordre d'affichage suit généralement l'ordre de déclaration dans le JSON
- **exemplesPhrases** : Nouveau champ optionnel pour les critères et la clôture
  - Contient des exemples de phrases que le candidat pourrait dire
  - Affiché en vert clair (rgb(112, 188, 123)) avec transparence légère
  - Format : tableau de chaînes entre guillemets

## Technical Improvements and Fixes

### JavaScript and Scoring Corrections (July 2025)
**Problèmes résolus dans les générateurs :**
- ✅ **Erreurs syntaxe JavaScript** : Correction guillemets mal échappés dans `document.querySelector()`
- ✅ **Template literals supprimés** : Remplacement par concaténation de chaînes pour compatibilité
- ✅ **Regex coloration brackets** : Correction `/\[([^\]]+)\]/g` pour coloration bleue
- ✅ **Transformation automatique désactivée** : Plus de conversion parenthèses → crochets
- ✅ **Calculs de scores dynamiques** : Nombres de critères basés sur JSON réel
- ✅ **Critères d'évaluation globale** : Ajout automatique désactivé pour éviter les doublons
- ✅ **Génération PDF Puppeteer** : Module `generate-pdf.js` fonctionnel avec options optimisées

### Workflow Validation Établi
1. **Étape 1** : Génération avec brackets `[]` pour toutes les réponses patients
2. **Étape 2** : Validation manuelle et correction (parenthèses vs brackets)
3. **Étape 3** : Génération finale avec coloration automatique

### ESLint Configuration
The project uses ESLint with custom quote configuration:
- Single quotes preferred with `{ "avoidEscape": true }` option
- Allows using double quotes when it avoids escaping characters

### Performance Optimizations
- **PDF generation** : A4 format with optimized margins (10mm/9mm/10mm/10mm)
- **CSS print styles** : Responsive design with @media print optimizations
- **JavaScript efficiency** : Event-driven scoring with minimal DOM manipulation