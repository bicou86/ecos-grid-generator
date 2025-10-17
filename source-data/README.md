# Source Data

Ce dossier contient les **données sources** à partir desquelles les grilles ECOS sont générées.

## 📁 Structure

```
source-data/
├── pdf/          # PDFs originaux à traiter
├── html/         # Fichiers HTML à reformatter
└── archive/      # Archives et données historiques
```

## 📄 Dossier `pdf/`

Placez ici les PDFs de cas cliniques à traiter :
- Cas AMBOSS (allemand)
- Cas Thieme (allemand)
- Cas USMLE (anglais)
- Cas RESCOS (français)
- Autres sources

**Format attendu** : Fichiers PDF avec contenu extractible (pas de scans images).

## 🌐 Dossier `html/`

Fichiers HTML bruts nécessitant reformattage ou restructuration.

### Sous-dossier `html/raw/`

Contient les fichiers HTML importés depuis diverses sources qui doivent être :
- Standardisés
- Reformattés selon le template ECOS
- Convertis en JSON structuré

## 📦 Dossier `archive/`

Anciennes données conservées pour référence :
- `Doc_originaux/` : Documents sources originaux
- `Stat/` : Statistiques et analyses historiques
- Autres fichiers d'archive

## ⚠️ Important

**Ce dossier n'est PAS versionné dans Git** (voir `.gitignore`).

Les fichiers sources peuvent contenir :
- Du contenu protégé par copyright
- Des données volumineuses
- Du contenu temporaire

Seuls les fichiers générés (JSON, HTML, PDF) dans `generated/` sont versionnés.

## 🔄 Workflow

1. **Ajouter** le PDF/HTML source dans le dossier approprié
2. **Exécuter** le script de traitement :
   ```bash
   python scripts/generation/process_[source]_files.py
   ```
3. **Vérifier** la sortie dans `generated/json/`
4. **Générer** les grilles avec le générateur HTML

## 📋 Exemples

### Traiter un PDF AMBOSS

```bash
# 1. Copier le PDF
cp ~/Downloads/amboss-case-42.pdf source-data/pdf/

# 2. Traiter
python scripts/generation/process_amboss_files.py

# 3. Résultat
# generated/json/AMBOSS/[titre].json
# generated/grilles/html/[titre] - Grille ECOS.html
```

### Reformatter un HTML RESCOS

```bash
# 1. Copier le HTML
cp ~/Downloads/rescos-fievre.html source-data/html/

# 2. Traiter
python scripts/generation/process_rescos_files.py

# 3. Résultat
# generated/json/RESCOS/[titre].json
```

## 🔗 Voir aussi

- [Scripts de génération](../scripts/generation/)
- [Documentation complète](../docs/)
- [Templates de sortie](../templates/)
