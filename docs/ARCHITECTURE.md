# 🏗️ Architecture de la Plateforme ECOS

## Vue d'ensemble

Plateforme SaaS moderne pour la révision de cas cliniques ECOS, avec système d'abonnement, génération automatique de cas, et analytics avancés.

---

## 📐 Architecture Technique

### **Stack Technologique**

#### **Frontend**
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS + Framer Motion
- **Paiements**: Stripe.js
- **Graphiques**: Recharts
- **Formulaires**: React Hook Form + Zod

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM/Query**: pg (native driver)
- **Authentication**: JWT + bcrypt
- **Paiements**: Stripe SDK
- **Email**: Nodemailer
- **Logging**: Winston
- **PDF Processing**: pdf-parse

#### **Infrastructure**
- **Conteneurisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS / Azure / GCP
- **CDN**: CloudFront / Azure CDN
- **Storage**: S3 / Azure Blob Storage
- **Monitoring**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 🗂️ Structure du Projet

```
ecos-grid-generator/
├── backend/                          # API Node.js/Express
│   ├── config/                       # Configuration
│   │   ├── database.js              # PostgreSQL connection pool
│   │   └── stripe.js                # Stripe configuration
│   ├── controllers/                  # Business logic
│   │   ├── authController.js        # Authentification
│   │   ├── casesController.js       # Gestion des cas
│   │   ├── paymentsController.js    # Paiements Stripe
│   │   ├── progressController.js    # Suivi progression
│   │   └── generateController.js    # Génération de cas
│   ├── middleware/                   # Middleware Express
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js          # Error handling
│   │   ├── validation.js            # Input validation
│   │   └── rateLimit.js             # Rate limiting
│   ├── models/                       # Data models (si ORM)
│   ├── routes/                       # API routes
│   │   ├── auth.js
│   │   ├── cases.js
│   │   ├── categories.js
│   │   ├── specialties.js
│   │   ├── user.js
│   │   ├── progress.js
│   │   ├── payments.js
│   │   ├── generate.js
│   │   ├── statistics.js
│   │   └── feedback.js
│   ├── services/                     # Services métier
│   │   ├── emailService.js          # Envoi d'emails
│   │   ├── pdfService.js            # Traitement PDF
│   │   ├── generateService.js       # Génération de cas
│   │   └── stripeService.js         # Logique Stripe
│   ├── utils/                        # Utilitaires
│   │   ├── logger.js                # Winston logger
│   │   ├── appError.js              # Custom errors
│   │   └── helpers.js               # Helper functions
│   ├── tests/                        # Tests unitaires/intégration
│   ├── .env.example                 # Variables d'environnement
│   ├── server.js                    # Point d'entrée
│   └── package.json
│
├── frontend/                         # Application React
│   ├── public/                       # Assets statiques
│   ├── src/
│   │   ├── assets/                  # Images, fonts, etc.
│   │   ├── components/              # Composants réutilisables
│   │   │   ├── common/              # Boutons, Cards, Modals
│   │   │   ├── cases/               # Composants liés aux cas
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   └── payments/            # Stripe components
│   │   ├── pages/                   # Pages de l'application
│   │   │   ├── HomePage.jsx
│   │   │   ├── CatalogPage.jsx
│   │   │   ├── CaseDetailPage.jsx
│   │   │   ├── CaseViewerPage.jsx   # Viewer interactif
│   │   │   ├── GeneratePage.jsx     # Upload + génération
│   │   │   ├── PricingPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   └── dashboard/
│   │   │       ├── DashboardPage.jsx
│   │   │       ├── ProgressPage.jsx
│   │   │       ├── BookmarksPage.jsx
│   │   │       └── StatisticsPage.jsx
│   │   ├── layouts/                 # Layouts
│   │   │   ├── MainLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCases.js
│   │   │   └── useProgress.js
│   │   ├── stores/                  # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── casesStore.js
│   │   │   └── progressStore.js
│   │   ├── services/                # API calls
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── casesService.js
│   │   │   └── paymentsService.js
│   │   ├── utils/                   # Utilitaires frontend
│   │   ├── styles/                  # CSS global
│   │   ├── App.jsx                  # App principale
│   │   └── main.jsx                 # Point d'entrée
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/                         # Scripts DB
│   ├── schema.sql                   # Schéma PostgreSQL
│   ├── migrations/                  # Migrations
│   └── seeds/                       # Données de test
│
├── scripts/                          # Scripts utilitaires
│   ├── import_cases_to_db.py       # Import des JSON vers DB
│   ├── generate_pdf.js             # Génération PDF
│   └── migrate_data.js             # Migration de données
│
├── json_files/                       # Cas cliniques JSON
│   ├── AMBOSS/
│   ├── RESCOS/
│   ├── German/
│   └── ...
│
├── docker/                           # Configuration Docker
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf                   # Nginx reverse proxy
│
├── .github/                          # GitHub Actions
│   └── workflows/
│       ├── ci.yml                   # Tests + Linting
│       └── deploy.yml               # Déploiement
│
├── docs/                             # Documentation
│   ├── API.md                       # Documentation API
│   ├── DEPLOYMENT.md                # Guide de déploiement
│   └── USER_GUIDE.md                # Guide utilisateur
│
├── docker-compose.yml               # Docker Compose
├── .gitignore
├── README.md
├── CLAUDE.md                        # Instructions Claude
├── ARCHITECTURE.md                  # Ce fichier
└── LICENSE

```

---

## 🔄 Flux de Données

### **1. Authentification**

```
User → Frontend (Login) → Backend API (/auth/login)
                              ↓
                        Verify credentials (bcrypt)
                              ↓
                        Generate JWT tokens
                              ↓
                        Return tokens + user data
                              ↓
Frontend stores in state + localStorage
```

### **2. Consultation d'un cas**

```
User → Catalog Page → API GET /cases
                         ↓
                   PostgreSQL query
                         ↓
                   Return cases list
                         ↓
User selects case → API GET /cases/:id/full
                         ↓
                   Verify subscription
                         ↓
                   Return full case data
                         ↓
Frontend renders interactive viewer
```

### **3. Génération d'un cas**

```
User uploads PDF → Frontend (/generate)
                      ↓
                API POST /generate
                      ↓
              multer saves file
                      ↓
            pdf-parse extracts text
                      ↓
      Python script processes content
                      ↓
        Generate JSON structure
                      ↓
      Insert into PostgreSQL
                      ↓
    Return generated case ID
                      ↓
  Frontend redirects to case viewer
```

### **4. Paiement**

```
User → Pricing Page → Select plan
                         ↓
              API POST /payments/create-checkout
                         ↓
                 Stripe create session
                         ↓
              Return session URL
                         ↓
     Frontend redirects to Stripe Checkout
                         ↓
              User completes payment
                         ↓
         Stripe webhook → Backend
                         ↓
            Update user subscription
                         ↓
          Send confirmation email
```

---

## 🗄️ Base de Données

### **Tables Principales**

1. **users** - Utilisateurs avec abonnements
2. **clinical_cases** - Cas cliniques avec sections JSONB
3. **categories** - Catégories (AMBOSS, RESCOS, etc.)
4. **specialties** - Spécialités médicales
5. **case_specialties** - Relation many-to-many
6. **tags** - Tags pour recherche
7. **case_tags** - Relation many-to-many
8. **user_progress** - Progression individuelle par cas
9. **user_statistics** - Statistiques agrégées
10. **payments** - Historique des paiements
11. **generated_cases** - Cas générés via upload
12. **feedback** - Retours utilisateurs
13. **audit_logs** - Logs d'audit

### **Index Optimisations**

- Full-text search sur `clinical_cases.search_vector`
- Index sur `users.email` et `subscription_status`
- Index sur `clinical_cases.slug`, `category_id`, `source`
- Index sur `user_progress` pour requêtes rapides

---

## 🔐 Sécurité

### **Authentication & Authorization**

- **JWT tokens** : Access token (7 jours) + Refresh token (30 jours)
- **Password hashing** : bcrypt avec salt rounds = 12
- **Role-based access** : student, teacher, admin, contributor
- **Middleware auth** : Vérification JWT sur routes protégées

### **Protection des données**

- **HTTPS** : Obligatoire en production
- **Helmet.js** : Headers de sécurité HTTP
- **CORS** : Configuration stricte
- **Rate limiting** : 100 req/15min par IP
- **Input validation** : express-validator + Zod
- **SQL injection** : Parameterized queries (pg)
- **XSS protection** : React sanitization

### **Paiements**

- **Stripe** : PCI-DSS compliant
- **Webhook signature** : Vérification Stripe
- **Secure tokens** : Pas de données sensibles côté client

---

## 📊 Analytics & Monitoring

### **Métriques à tracker**

- **Performance** :
  - Response time API
  - Database query time
  - Frontend page load time

- **Business** :
  - Nombre d'utilisateurs actifs (DAU/MAU)
  - Taux de conversion (free → premium)
  - Churn rate
  - Revenue (MRR/ARR)
  - Cas complétés par utilisateur

- **Technique** :
  - Error rate
  - CPU/Memory usage
  - Database connections
  - Cache hit rate

### **Outils**

- **Prometheus** : Collecte de métriques
- **Grafana** : Dashboards de visualisation
- **Sentry** : Error tracking
- **Google Analytics** : Tracking utilisateur
- **Mixpanel** : Product analytics

---

## 🚀 Déploiement

### **Environnements**

1. **Development** : Local (localhost)
2. **Staging** : Cloud (pre-production)
3. **Production** : Cloud (live)

### **Pipeline CI/CD**

```
GitHub Push → GitHub Actions
                  ↓
            Run tests (Jest/Vitest)
                  ↓
            Lint code (ESLint)
                  ↓
            Build Docker images
                  ↓
            Push to Container Registry
                  ↓
        Deploy to Cloud (AWS/Azure/GCP)
                  ↓
        Run smoke tests
                  ↓
            Notify team (Slack)
```

### **Infrastructure Cloud**

#### **Option AWS**
- **Compute** : ECS (Fargate) ou EC2
- **Database** : RDS PostgreSQL
- **Storage** : S3
- **CDN** : CloudFront
- **Load Balancer** : ALB
- **DNS** : Route 53
- **Monitoring** : CloudWatch

#### **Option Azure**
- **Compute** : App Service ou AKS
- **Database** : Azure Database for PostgreSQL
- **Storage** : Blob Storage
- **CDN** : Azure CDN
- **Load Balancer** : Azure Load Balancer
- **DNS** : Azure DNS
- **Monitoring** : Application Insights

---

## 💰 Modèle de Tarification

### **Plans d'abonnement**

1. **Gratuit** :
   - 10 cas/mois
   - Pas d'accès aux cas premium
   - Pas de génération de cas

2. **Mensuel** (29.90 CHF/mois) :
   - Accès illimité à tous les cas
   - Génération de 5 cas/mois
   - Statistiques avancées

3. **Annuel** (199.00 CHF/an - économie 33%) :
   - Tout du plan mensuel
   - Génération de 100 cas/an
   - Support prioritaire

4. **Lifetime** (499.00 CHF - paiement unique) :
   - Accès à vie
   - Génération illimitée
   - Support VIP

---

## 🔄 Migration de Données

### **Import initial des 496 cas**

```bash
# 1. Créer la base de données
psql -U postgres -c "CREATE DATABASE ecos_platform;"

# 2. Appliquer le schéma
psql -U postgres -d ecos_platform -f DATABASE_SCHEMA.sql

# 3. Importer les cas depuis JSON
python3 import_cases_to_db.py
```

### **Vérification**

```sql
SELECT
    cat.name as category,
    COUNT(*) as count
FROM clinical_cases cc
JOIN categories cat ON cc.category_id = cat.id
GROUP BY cat.name
ORDER BY count DESC;
```

---

## 📈 Roadmap

### **Phase 1 : MVP** (2-3 mois)
- ✅ Base de données PostgreSQL
- ✅ API REST Node.js/Express
- ✅ Frontend React moderne
- ✅ Authentification JWT
- ✅ Paiements Stripe
- ✅ Catalogue de cas
- ✅ Viewer interactif

### **Phase 2 : Génération** (1-2 mois)
- 🔲 Upload PDF
- 🔲 Extraction automatique
- 🔲 Génération JSON
- 🔲 Prévisualisation
- 🔲 Édition manuelle

### **Phase 3 : Analytics** (1 mois)
- 🔲 Dashboard utilisateur
- 🔲 Statistiques de progression
- 🔲 Comparaison avec pairs
- 🔲 Recommendations IA

### **Phase 4 : Collaboration** (2 mois)
- 🔲 Partage de cas
- 🔲 Révision par pairs
- 🔲 Commentaires
- 🔲 Ratings

### **Phase 5 : Export & E-learning** (1 mois)
- 🔲 Export DOCX
- 🔲 Export SCORM
- 🔲 Intégration LMS
- 🔲 Quizzes interactifs

---

## 🤝 Contribution

### **Workflow**

1. Fork le repository
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### **Standards de code**

- **JavaScript/React** : ESLint + Prettier
- **Python** : PEP 8
- **SQL** : Uppercase keywords, lowercase identifiers
- **Commits** : Conventional Commits (feat:, fix:, docs:, etc.)

---

## 📞 Support & Contact

- **Email** : support@ecos-platform.ch
- **Documentation** : https://docs.ecos-platform.ch
- **GitHub Issues** : https://github.com/damienfulliquet/ecos-grid-generator/issues

---

**Dernière mise à jour** : Octobre 2025
**Version** : 1.0.0
**Auteur** : Damien Fulliquet
