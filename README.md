# ECOS Platform & Grid Generator

Plateforme complète pour la formation aux ECOS (Examens Cliniques Objectifs Structurés) comprenant :
- **Plateforme Web** : Application React/Node.js pour la révision interactive
- **Grid Generator** : Outils de génération de grilles d'évaluation depuis des PDFs

## 🚀 Démarrage Rapide

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
./start-ecos.sh
```

Le script détecte automatiquement votre environnement et propose :
1. **Mode Docker** (recommandé) - Configuration complète en containers
2. **Mode Développement Local** - Backend + Frontend en local
3. **Informations système** - Vérifier les dépendances installées

### Option 2 : Démarrage manuel

#### Avec Docker

```bash
cd platform
docker-compose up -d
```

Accès :
- Frontend : http://localhost
- API : http://localhost/api/v1
- Adminer : http://localhost:8080

#### En développement local

```bash
# Terminal 1 - Backend
cd platform/backend
npm install
npm run dev

# Terminal 2 - Frontend
cd platform/frontend
npm install
npm run dev
```

Accès :
- Frontend : http://localhost:3001
- API : http://localhost:3000/api/v1

### Arrêter les services

```bash
./stop-ecos.sh
```

## 📁 Structure du Projet

```
ecos-grid-generator/
├── platform/                    # Plateforme web complète
│   ├── backend/                 # API Node.js/Express + PostgreSQL
│   ├── frontend/                # Application React/Vite
│   ├── docker/                  # Configuration Docker
│   └── docker-compose.yml       # Orchestration des services
│
├── Chablon/                     # Templates et modèles
│   ├── Model - Grille ECOS.html # Modèle de grille d'évaluation
│   ├── Model - Feuille Porte.html # Modèle de feuille-porte
│   └── Generateur_de_Grilles_ECOS.html # Générateur automatique
│
├── json_files/                  # Fichiers JSON des cas cliniques
│   ├── AMBOSS/                  # Cas AMBOSS
│   ├── RESCOS/                  # Cas RESCOS
│   └── USMLE/                   # Cas USMLE
│
├── generated/                   # Fichiers générés
│   ├── grilles/                 # Grilles d'évaluation HTML/PDF
│   └── feuille-porte/           # Feuilles-porte HTML/PDF
│
├── scripts/                     # Scripts d'analyse et migration
│   ├── generation/              # Scripts de génération
│   ├── migration/               # Scripts de migration
│   └── standardization/         # Standardisation des données
│
├── data-stat/                   # Données statistiques
│   ├── -ECOS-2013-2017.pdf     # Archive des cas ECOS
│   └── ECOS-2013-2017-final.csv # Données extraites (174 cas)
│
├── docs/                        # Documentation complète
│   ├── ARCHITECTURE.md          # Architecture technique
│   ├── API_DOCUMENTATION.md     # Documentation API
│   ├── DEPLOYMENT.md            # Guide de déploiement
│   └── reports/                 # Rapports techniques archivés
│
├── templates/                   # Templates réutilisables
│   ├── generators/              # Générateurs
│   └── models/                  # Modèles de données
│
├── CLAUDE.md                    # Instructions pour Claude Code
└── README.md                    # Ce fichier
```

## 🎯 Fonctionnalités

### Plateforme Web

- **Gestion de cas cliniques** : 496+ cas ECOS structurés
- **Recherche et filtrage** : Par source, spécialité, système
- **Suivi de progression** : Notes, favoris, historique
- **Mode révision** : Identification des lacunes
- **Mode examen** : Minuteur 13 minutes avec alertes
- **Authentification** : JWT + refresh tokens
- **Paiements** : Intégration Stripe
- **API RESTful** : Documentation complète

### Grid Generator

- **Extraction PDF** : Lecture automatique de cas cliniques
- **Traduction** : Allemand → Français (terminologie médicale)
- **Génération JSON** : Structure standardisée
- **Export HTML/PDF** : Grilles interactives + PDFs imprimables
- **Notation dynamique** : Calcul temps réel des scores
- **Codes couleur** : Diagnostics, examens, commentaires

## 🛠️ Technologies

### Plateforme Web

- **Frontend** : React 18, Vite, TailwindCSS, React Router
- **Backend** : Node.js, Express, PostgreSQL, Redis
- **Containerisation** : Docker, Docker Compose
- **Monitoring** : Prometheus, Grafana (optionnel)
- **Reverse Proxy** : Nginx
- **Base de données** : PostgreSQL 15

### Grid Generator

- **Templates** : HTML5, CSS3, JavaScript ES6+
- **Génération PDF** : Puppeteer
- **Traduction** : Claude AI
- **Parsing** : pdf-parse, Custom extractors

## 📊 Services Docker

La plateforme utilise une architecture microservices avec Docker Compose :

| Service | Description | Port |
|---------|-------------|------|
| **postgres** | Base de données PostgreSQL 15 | 5432 |
| **redis** | Cache et sessions | 6379 |
| **backend** | API Node.js/Express | 3000 |
| **frontend** | Application React | 3001 |
| **nginx** | Reverse proxy | 80, 443 |
| **adminer** | Gestion base de données (dev) | 8080 |
| **prometheus** | Monitoring (optionnel) | 9090 |
| **grafana** | Dashboards (optionnel) | 3002 |

## 🔧 Configuration

### Variables d'environnement

Copier `.env.example` vers `.env` et configurer :

```bash
# Base de données
DB_HOST=postgres
DB_NAME=ecos_platform
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_password
```

### Profils Docker

- **Standard** : postgres, redis, backend, frontend, nginx
- **Dev** : + adminer (gestion base de données)
- **Monitoring** : + prometheus, grafana (métriques)

## 📖 Documentation Complète

- [Architecture](docs/ARCHITECTURE.md) - Architecture technique détaillée
- [API](docs/API_DOCUMENTATION.md) - Documentation des endpoints
- [Déploiement](docs/DEPLOYMENT.md) - Guide de déploiement
- [Quick Start Platform](docs/QUICK_START_PLATFORM.md) - Guide complet plateforme
- [Claude Instructions](CLAUDE.md) - Instructions pour Claude Code

## 🔄 Réorganisation du Projet

Si le projet n'est pas encore organisé avec la nouvelle structure :

```bash
./reorganize-project.sh
```

Ce script :
- Crée une structure `/grid-generator/` séparée
- Archive les anciennes versions (v1-v5)
- Consolide la documentation
- Nettoie les fichiers temporaires
- Crée une sauvegarde avant toute modification

## 🧪 Tests

### Backend

```bash
cd platform/backend
npm test
npm run test:coverage
```

### Frontend

```bash
cd platform/frontend
npm test
npm run test:e2e
```

### Santé de la plateforme

```bash
cd platform
./test-platform-health.sh
```

## 📈 Monitoring (Profil monitoring)

Accéder à Grafana : http://localhost:3002
- User : admin
- Password : admin (ou valeur de `GRAFANA_PASSWORD`)

Dashboards inclus :
- Métriques système (CPU, RAM, disque)
- Performances backend (requêtes/s, latence)
- État base de données

## 🐛 Dépannage

### Ports déjà utilisés

```bash
# Vérifier les ports occupés
lsof -i :3000
lsof -i :3001

# Arrêter les processus
./stop-ecos.sh
```

### Erreurs Docker

```bash
# Nettoyer les containers
docker-compose -f platform/docker-compose.yml down -v

# Reconstruire
docker-compose -f platform/docker-compose.yml build --no-cache
docker-compose -f platform/docker-compose.yml up -d
```

### Base de données

```bash
# Accéder à PostgreSQL
docker-compose -f platform/docker-compose.yml exec postgres psql -U postgres -d ecos_platform

# Réinitialiser la base
docker-compose -f platform/docker-compose.yml down -v
docker-compose -f platform/docker-compose.yml up -d
```

### Logs

```bash
# Tous les services
docker-compose -f platform/docker-compose.yml logs -f

# Service spécifique
docker-compose -f platform/docker-compose.yml logs -f backend
docker-compose -f platform/docker-compose.yml logs -f frontend
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Conventions de Code

### Git Commits

```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatage
refactor: Refactorisation
test: Tests
chore: Maintenance
```

### Code Style

- **JavaScript** : ESLint avec configuration custom
- **React** : Functional components + Hooks
- **CSS** : TailwindCSS + BEM pour custom CSS
- **API** : RESTful avec versioning (`/api/v1`)

## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- Rate limiting sur les endpoints sensibles
- Validation des entrées avec Joi/Zod
- Headers de sécurité (helmet.js)
- CORS configuré
- Protection CSRF
- Sanitization des données

## 📊 Performance

- **Backend** : Cache Redis pour requêtes fréquentes
- **Frontend** : Code splitting, lazy loading
- **Base de données** : Index optimisés, connexion pool
- **Images** : Compression et lazy loading
- **API** : Pagination sur toutes les listes

## 📄 Licence

Ce projet est sous licence [À DÉFINIR].

## 👥 Auteurs

- Damien Fulliquet - Développement initial et architecture

## 🙏 Remerciements

- Claude AI pour l'assistance au développement
- Communauté médicale suisse pour les retours
- AMBOSS, RESCOS, USMLE pour les cas cliniques

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la [documentation complète](docs/)
- Vérifier les [problèmes connus](docs/TROUBLESHOOTING.md)

---

**Version** : 2.0.1
**Dernière mise à jour** : Novembre 2025
**Status** : ✅ Production Ready
