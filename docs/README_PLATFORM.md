# 🏥 ECOS Platform - Plateforme de Révisions Médicales

> Système SaaS moderne pour la révision de cas cliniques ECOS avec génération automatique, analytics avancés, et système d'abonnement.

[![CI/CD](https://github.com/damienfulliquet/ecos-grid-generator/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/damienfulliquet/ecos-grid-generator/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

---

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Déploiement](#-déploiement)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## 🎯 Aperçu

**ECOS Platform** est une plateforme SaaS complète permettant aux étudiants en médecine de réviser efficacement les cas cliniques ECOS. La plateforme propose :

- **496 cas cliniques** répartis en 8 catégories
- **Génération automatique** de nouveaux cas via upload PDF
- **Système d'abonnement** avec paiements Stripe
- **Analytics détaillés** de progression et performance
- **Interface moderne** React avec visualisations interactives

### 🎥 Démonstration

![ECOS Platform Demo](docs/images/demo.gif)

---

## ✨ Fonctionnalités

### 🔐 Authentification & Gestion Utilisateurs
- ✅ Inscription/Connexion avec JWT
- ✅ Rôles : Student, Teacher, Admin, Contributor
- ✅ Gestion de profil et préférences
- ✅ Reset de mot de passe par email

### 📚 Catalogue de Cas
- ✅ 496 cas cliniques structurés
- ✅ 8 catégories (AMBOSS, RESCOS, German, etc.)
- ✅ 15 spécialités médicales
- ✅ Filtres avancés (catégorie, spécialité, difficulté)
- ✅ Recherche full-text multilingue
- ✅ Tags intelligents

### 🎓 Expérience d'Apprentissage
- ✅ Viewer interactif avec minuteur ECOS 13 minutes
- ✅ Mode révision vs mode examen
- ✅ Calcul automatique des scores
- ✅ Feedback détaillé par section
- ✅ Bookmarks et favoris
- ✅ Historique de progression

### 📊 Analytics & Statistiques
- ✅ Dashboard utilisateur personnalisé
- ✅ Graphiques de progression
- ✅ Statistiques par spécialité
- ✅ Comparaison avec peers
- ✅ Streaks de révision

### 🤖 Génération Automatique
- ✅ Upload de PDFs (cas cliniques)
- ✅ Extraction automatique du contenu
- ✅ Génération de structure JSON
- ✅ Prévisualisation avant publication
- ✅ Support multilingue (DE→FR)

### 💳 Système d'Abonnement
- ✅ 4 plans (Free, Mensuel, Annuel, Lifetime)
- ✅ Intégration Stripe complète
- ✅ Webhooks pour synchronisation
- ✅ Gestion automatique des abonnements

### 📤 Exports
- ✅ Export PDF des grilles
- ✅ Export DOCX (roadmap)
- ✅ Export SCORM pour LMS (roadmap)

---

## 🛠️ Technologies

### Frontend
```json
{
  "framework": "React 18",
  "build": "Vite",
  "routing": "React Router v6",
  "state": "Zustand + React Query",
  "styling": "Tailwind CSS",
  "animations": "Framer Motion",
  "charts": "Recharts",
  "forms": "React Hook Form + Zod",
  "payments": "@stripe/react-stripe-js"
}
```

### Backend
```json
{
  "runtime": "Node.js 18",
  "framework": "Express.js",
  "database": "PostgreSQL 15",
  "auth": "JWT + bcrypt",
  "validation": "express-validator",
  "logging": "Winston",
  "payments": "Stripe SDK",
  "email": "Nodemailer",
  "pdf": "pdf-parse"
}
```

### Infrastructure
```json
{
  "containers": "Docker + Docker Compose",
  "ci_cd": "GitHub Actions",
  "cloud": "AWS / Azure / GCP",
  "proxy": "Nginx",
  "monitoring": "Prometheus + Grafana",
  "cache": "Redis"
}
```

---

## 📦 Installation

### Prérequis

- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 15.0
- **Docker** ≥ 20.10 (optionnel mais recommandé)
- **npm** ≥ 9.0.0
- **Python** ≥ 3.10 (pour scripts d'import)

### Installation Locale (sans Docker)

#### 1. Cloner le repository

```bash
git clone https://github.com/damienfulliquet/ecos-grid-generator.git
cd ecos-grid-generator
```

#### 2. Configuration de la base de données

```bash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE ecos_platform;"

# Appliquer le schéma
psql -U postgres -d ecos_platform -f DATABASE_SCHEMA.sql

# Importer les cas cliniques (496 cas)
python3 import_cases_to_db.py
```

#### 3. Configuration du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier .env.example et configurer
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le serveur
npm run dev
```

#### 4. Configuration du Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier .env.example et configurer
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le serveur de développement
npm run dev
```

#### 5. Accéder à l'application

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000
- **API Health** : http://localhost:3000/health
- **API Docs** : http://localhost:3000/api/v1/

---

### Installation avec Docker (Recommandé)

#### 1. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

#### 2. Lancer l'infrastructure complète

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier que les services sont actifs
docker-compose ps
```

#### 3. Importer les données

```bash
# Attendre que PostgreSQL soit prêt (30 secondes)
sleep 30

# Importer les 496 cas cliniques
docker-compose exec backend python3 /app/import_cases_to_db.py
```

#### 4. Accéder aux services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost | - |
| **Backend API** | http://localhost/api/v1 | - |
| **Adminer** (DB Admin) | http://localhost:8080 | postgres / postgres |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3002 | admin / admin |

#### 5. Arrêter les services

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ PERTE DE DONNÉES)
docker-compose down -v
```

---

## ⚙️ Configuration

### Variables d'Environnement Backend

Créer un fichier `.env` dans `/backend/` :

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecos_platform
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid ou SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxx
EMAIL_FROM=noreply@ecos-platform.ch

# Frontend
FRONTEND_URL=http://localhost:3001
```

### Variables d'Environnement Frontend

Créer un fichier `.env` dans `/frontend/` :

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚀 Utilisation

### Pour les Étudiants

1. **Créer un compte** : Inscription gratuite
2. **Explorer le catalogue** : 496 cas disponibles
3. **Réviser** : Mode révision avec feedback immédiat
4. **S'entraîner** : Mode examen avec minuteur 13 minutes
5. **Suivre sa progression** : Dashboard analytics

### Pour les Contributeurs

1. **Se connecter avec compte contributeur**
2. **Uploader un PDF** : Cas clinique en allemand ou français
3. **Génération automatique** : Le système extrait et structure
4. **Réviser le cas** : Vérifier et ajuster si nécessaire
5. **Publier** : Le cas devient accessible

### Pour les Administrateurs

1. **Dashboard admin** : Vue d'ensemble de la plateforme
2. **Gestion des utilisateurs** : Rôles et abonnements
3. **Modération des cas** : Validation et publication
4. **Analytics** : Métriques business et techniques
5. **Gestion des paiements** : Suivi des abonnements

---

## 📖 API Documentation

### Endpoints Principaux

#### Authentification

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

#### Cas Cliniques

```http
GET    /api/v1/cases              # Liste avec filtres et pagination
GET    /api/v1/cases/featured     # Cas mis en avant
GET    /api/v1/cases/search?q=    # Recherche full-text
GET    /api/v1/cases/:id          # Détails d'un cas (public)
GET    /api/v1/cases/:id/full     # Cas complet (authentifié)
POST   /api/v1/cases              # Créer un cas (contributeur)
PUT    /api/v1/cases/:id          # Mettre à jour (contributeur)
DELETE /api/v1/cases/:id          # Supprimer (admin)
```

#### Progression Utilisateur

```http
GET  /api/v1/progress             # Ma progression
POST /api/v1/progress/:caseId     # Enregistrer tentative
GET  /api/v1/progress/statistics  # Mes statistiques
```

#### Paiements

```http
POST /api/v1/payments/create-checkout  # Créer session Stripe
POST /api/v1/payments/webhook          # Webhook Stripe
GET  /api/v1/payments/history          # Historique paiements
```

#### Génération

```http
POST   /api/v1/generate/upload         # Upload PDF
GET    /api/v1/generate/:id/status     # Statut génération
GET    /api/v1/generate/:id/preview    # Prévisualiser
POST   /api/v1/generate/:id/publish    # Publier
```

### Exemples de Requêtes

#### Récupérer tous les cas AMBOSS

```bash
curl -X GET "http://localhost:3000/api/v1/cases?category=amboss&limit=20" \
  -H "Content-Type: application/json"
```

#### Recherche full-text

```bash
curl -X GET "http://localhost:3000/api/v1/cases/search?q=douleur+thoracique" \
  -H "Content-Type: application/json"
```

#### Créer un compte

```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "etudiant@example.com",
    "password": "SecurePass123!",
    "first_name": "Jean",
    "last_name": "Dupont"
  }'
```

---

## 🌐 Déploiement

### Déploiement sur AWS (ECS)

#### Prérequis

- Compte AWS configuré
- AWS CLI installé
- Docker images buildées

#### 1. Créer l'infrastructure

```bash
# Créer le cluster ECS
aws ecs create-cluster --cluster-name ecos-production

# Créer la task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Créer le service
aws ecs create-service --cli-input-json file://aws/service.json
```

#### 2. Configurer RDS PostgreSQL

```bash
# Créer une instance RDS
aws rds create-db-instance \
  --db-instance-identifier ecos-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password YourSecurePassword \
  --allocated-storage 50
```

#### 3. Déployer via GitHub Actions

```bash
# Push vers main déclenche le déploiement automatique
git push origin main
```

### Déploiement sur Azure

#### 1. Créer les ressources

```bash
# Créer un resource group
az group create --name ecos-rg --location westeurope

# Créer Azure Container Registry
az acr create --name ecosacr --resource-group ecos-rg --sku Basic

# Créer Azure Database for PostgreSQL
az postgres flexible-server create \
  --resource-group ecos-rg \
  --name ecos-db \
  --location westeurope \
  --admin-user postgres \
  --admin-password YourSecurePassword \
  --version 15
```

#### 2. Déployer les containers

```bash
# Build et push les images
az acr build --registry ecosacr --image ecos-backend:latest ./backend
az acr build --registry ecosacr --image ecos-frontend:latest ./frontend

# Créer App Service
az webapp create \
  --resource-group ecos-rg \
  --plan ecos-plan \
  --name ecos-app \
  --deployment-container-image-name ecosacr.azurecr.io/ecos-backend:latest
```

---

## 📊 Monitoring & Logs

### Prometheus Metrics

Accéder à **Prometheus** : http://localhost:9090

**Métriques disponibles** :
- `http_requests_total` - Nombre total de requêtes
- `http_request_duration_seconds` - Durée des requêtes
- `db_query_duration_seconds` - Durée des requêtes DB
- `active_users_count` - Utilisateurs actifs
- `cases_completed_total` - Cas complétés

### Grafana Dashboards

Accéder à **Grafana** : http://localhost:3002

**Dashboards inclus** :
- API Performance
- Database Performance
- User Activity
- Business Metrics (MRR, Churn, etc.)

### Logs Centralisés

```bash
# Logs backend
docker-compose logs -f backend

# Logs frontend
docker-compose logs -f frontend

# Logs nginx
docker-compose logs -f nginx

# Logs postgres
docker-compose logs -f postgres
```

---

## 🧪 Tests

### Backend Tests

```bash
cd backend

# Tous les tests
npm test

# Tests avec coverage
npm test -- --coverage

# Tests unitaires seulement
npm test -- --testPathPattern=unit

# Tests d'intégration
npm test -- --testPathPattern=integration
```

### Frontend Tests

```bash
cd frontend

# Tous les tests
npm test

# Tests avec UI
npm test -- --ui

# Tests e2e (Playwright)
npm run test:e2e
```

---

## 🤝 Contributing

Nous accueillons les contributions ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

### Workflow

1. **Fork** le projet
2. **Créer une branche** (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'feat: add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir une Pull Request**

### Standards de Code

- **JavaScript** : ESLint + Prettier
- **Python** : PEP 8 + flake8
- **Commits** : Conventional Commits
- **Tests** : Coverage > 80%

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

**Créateur & Mainteneur** : Damien Fulliquet

**Contributeurs** :
- Voir la liste complète sur [GitHub Contributors](https://github.com/damienfulliquet/ecos-grid-generator/graphs/contributors)

---

## 📞 Support

- **Email** : support@ecos-platform.ch
- **Documentation** : https://docs.ecos-platform.ch
- **Discord** : https://discord.gg/ecos-platform
- **GitHub Issues** : https://github.com/damienfulliquet/ecos-grid-generator/issues

---

## 🎯 Roadmap

### Q1 2025
- [x] Base de données PostgreSQL
- [x] API REST Node.js
- [x] Frontend React
- [x] Authentification JWT
- [x] Paiements Stripe
- [ ] Launch Beta

### Q2 2025
- [ ] Génération automatique de cas
- [ ] Analytics avancés
- [ ] Application mobile (React Native)
- [ ] API publique pour institutions

### Q3 2025
- [ ] Système de collaboration
- [ ] Révision par pairs
- [ ] Exports DOCX/SCORM
- [ ] Intégration LMS

### Q4 2025
- [ ] IA pour recommendations
- [ ] Quiz adaptatifs
- [ ] Certifications

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=damienfulliquet/ecos-grid-generator&type=Date)](https://star-history.com/#damienfulliquet/ecos-grid-generator&Date)

---

<p align="center">
  Made with ❤️ for medical students
  <br>
  <a href="https://ecos-platform.ch">ecos-platform.ch</a>
</p>
