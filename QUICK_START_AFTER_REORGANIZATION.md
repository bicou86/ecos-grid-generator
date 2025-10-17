# 🚀 Guide de Démarrage Rapide - Après Réorganisation

Ce guide vous aide à démarrer après la réorganisation du 16 octobre 2025.

---

## ✅ Ce qui a changé

### Chemins mis à jour

| Avant | Après |
|-------|-------|
| `backend/` | `platform/backend/` |
| `frontend/` | `platform/frontend/` |
| `docker/` | `platform/docker/` |
| `docker-compose.yml` | `platform/docker-compose.yml` |
| `json_files/` | `generated/json/` |
| `Chablon/` | `templates/` |
| Scripts Python (racine) | `scripts/*/` |

---

## 🌐 Démarrer la Plateforme Web

### Option 1 : Docker Compose (Recommandé)

```bash
# Depuis la racine du projet
cd platform

# Vérifier que .env existe
ls -la .env

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend frontend
```

**Services disponibles :**
- Frontend : http://localhost:3001
- Backend API : http://localhost:3000
- PostgreSQL : localhost:5432
- Adminer (DB UI) : http://localhost:8080 (avec profil `dev`)

### Option 2 : Démarrage Manuel

```bash
# Terminal 1 - Backend
cd platform/backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 node server-simple.js

# Terminal 2 - Frontend
cd platform/frontend
npm run dev
```

---

## 📄 Utiliser le Générateur de Grilles

### Méthode 1 : Depuis un JSON existant

```bash
# 1. Ouvrir le générateur dans un navigateur
open templates/generators/Generateur_de_Grilles_ECOS.html

# 2. Charger un JSON depuis
# generated/json/AMBOSS/[votre_cas].json

# 3. Cliquer sur "Générer la grille"

# 4. La grille est générée automatiquement
```

### Méthode 2 : Depuis un PDF

```bash
# 1. Placer le PDF dans source-data/pdf/
cp ~/Downloads/mon_cas.pdf source-data/pdf/

# 2. Exécuter le script de génération approprié
python scripts/generation/process_amboss_files.py    # Pour cas AMBOSS
# OU
python scripts/generation/process_usmle_files.py     # Pour cas USMLE
# OU
python scripts/generation/process_rescos_files.py    # Pour cas RESCOS

# 3. Le JSON est créé dans generated/json/[SOURCE]/

# 4. Utiliser le générateur HTML (voir Méthode 1)
```

---

## 🔧 Scripts Utilitaires

### Génération

```bash
# Traiter des PDFs AMBOSS
python scripts/generation/process_amboss_files.py

# Traiter des cas RESCOS
python scripts/generation/process_rescos_files.py
```

### Validation

```bash
# Vérifier la cohérence des thérapies
python scripts/validation/check_therapy_coherence.py

# Tester les propriétés complexes
python scripts/validation/test_complex_properties.py
```

### Standardisation

```bash
# Standardiser la terminologie médicale
python scripts/standardization/standardize_json_terminology.py generated/json/AMBOSS/

# Standardiser les feuilles-porte
python scripts/standardization/standardize_feuille_porte_json.py generated/json/RESCOS/
```

---

## 🗂️ Organisation des Fichiers

### Où trouver quoi ?

```bash
# Documentation
cd docs/                      # Toute la documentation
cd docs/archive/              # Historique

# Scripts
cd scripts/generation/        # Générer JSON depuis PDF
cd scripts/validation/        # Tester et valider
cd scripts/standardization/   # Standardiser

# Templates
cd templates/generators/      # Générateurs HTML
cd templates/models/          # Modèles JSON de référence

# Fichiers générés
cd generated/json/            # JSON des cas
cd generated/grilles/html/    # Grilles HTML
cd generated/grilles/pdf/     # Grilles PDF

# Sources (non versionnées)
cd source-data/pdf/           # PDFs originaux
cd source-data/html/raw/      # HTML bruts

# Plateforme
cd platform/backend/          # API Node.js
cd platform/frontend/         # App React
cd platform/docker/           # Config Docker
```

---

## 🐛 Résolution de Problèmes

### Erreur : "backend/ not found" dans Docker

**Solution :** Le `docker-compose.yml` a été corrigé. Lancez :

```bash
cd platform
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erreur : Variables d'environnement manquantes

**Solution :** Vérifiez que `platform/.env` existe :

```bash
cd platform
ls -la .env

# Si manquant, le créer depuis l'exemple
cp backend/.env.example .env
# Puis éditer avec vos valeurs
```

### Erreur : Module Python non trouvé

**Solution :** Activez l'environnement virtuel :

```bash
source .venv/bin/activate
pip install -r platform/backend/requirements.txt  # si existe
```

### Erreur : Port déjà utilisé

**Solution :** Arrêtez les services en conflit :

```bash
# PostgreSQL sur port 5432
lsof -ti:5432 | xargs kill

# Backend sur port 3000
lsof -ti:3000 | xargs kill

# Frontend sur port 5173 ou 3001
lsof -ti:5173 | xargs kill
lsof -ti:3001 | xargs kill
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Vue d'ensemble complète |
| [REORGANIZATION_COMPLETE.md](REORGANIZATION_COMPLETE.md) | Détails de la réorganisation |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Guide complet |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Dépannage détaillé |

---

## ✅ Checklist de Démarrage

- [ ] J'ai mis à jour mes alias shell/scripts avec les nouveaux chemins
- [ ] J'ai testé le démarrage de la plateforme (Docker ou manuel)
- [ ] J'ai vérifié que les générateurs HTML fonctionnent
- [ ] J'ai testé un script de génération (process_*.py)
- [ ] J'ai lu la nouvelle structure dans README.md
- [ ] Je peux naviguer facilement dans la nouvelle organisation

---

## 🎯 Commandes Essentielles

```bash
# Démarrer tout (plateforme)
cd platform && docker-compose up -d

# Arrêter tout
cd platform && docker-compose down

# Générer une grille (ouvrir dans navigateur)
open templates/generators/Generateur_de_Grilles_ECOS.html

# Traiter un PDF
python scripts/generation/process_amboss_files.py

# Voir les logs plateforme
cd platform && docker-compose logs -f

# Statut des services
cd platform && docker-compose ps
```

---

**🎉 Vous êtes prêt à utiliser la nouvelle structure !**

Pour toute question, consultez la documentation complète dans `docs/` ou créez une issue.
