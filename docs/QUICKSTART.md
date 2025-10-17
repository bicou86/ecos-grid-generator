# 🚀 Quick Start Guide - ECOS Platform

Guide de démarrage rapide pour lancer la plateforme ECOS en moins de 10 minutes.

---

## 📋 Prérequis

Assurez-vous d'avoir installé :

- ✅ **Docker** et **Docker Compose** ([Installer Docker](https://docs.docker.com/get-docker/))
- ✅ **Git** ([Installer Git](https://git-scm.com/downloads))

C'est tout ! Docker se chargera du reste. 🎉

---

## ⚡ Démarrage en 3 étapes

### 1️⃣ Cloner le repository

```bash
git clone https://github.com/damienfulliquet/ecos-grid-generator.git
cd ecos-grid-generator
```

### 2️⃣ Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables essentielles
nano .env
```

**Configuration minimale** (remplacer les valeurs) :

```env
# Database
DB_PASSWORD=change_this_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
JWT_REFRESH_SECRET=your_refresh_token_secret_also_very_long

# Stripe (obtenir sur https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optionnel pour le développement)
EMAIL_PASSWORD=your_sendgrid_api_key_or_smtp_password
```

> 💡 **Astuce** : Pour le développement local, vous pouvez utiliser les valeurs par défaut sauf pour Stripe et JWT secrets.

### 3️⃣ Lancer l'application

```bash
# Démarrer tous les services
docker-compose up -d

# Suivre les logs (optionnel)
docker-compose logs -f
```

**Temps estimé** : 2-3 minutes pour le premier lancement (téléchargement des images Docker).

---

## 🎊 C'est prêt !

Accédez à la plateforme :

| Service | URL | Notes |
|---------|-----|-------|
| 🌐 **Application Web** | http://localhost | Frontend React |
| 🔧 **API Backend** | http://localhost/api/v1 | API REST |
| 💾 **Adminer** (DB Admin) | http://localhost:8080 | postgres / postgres |
| 📊 **Grafana** (Monitoring) | http://localhost:3002 | admin / admin |
| 🔍 **Prometheus** | http://localhost:9090 | Métriques |

---

## 📥 Importer les 496 cas cliniques

Une fois les services démarrés, importer les données :

```bash
# Attendre que PostgreSQL soit prêt (vérifier les logs)
docker-compose logs postgres | grep "database system is ready"

# Importer les cas depuis les fichiers JSON
python3 import_cases_to_db.py

# OU via Docker
docker-compose exec backend python3 /app/import_cases_to_db.py
```

**Sortie attendue** :

```
====================================================
🏥 IMPORT DES CAS CLINIQUES ECOS
====================================================
✓ Connexion à la base de données établie

📂 Catégorie: AMBOSS
  ✓ Importé: AMBOSS-1 - Douleurs abdominales - Femme 47 ans
  ✓ Importé: AMBOSS-2 - ...
  ...

====================================================
📊 RÉSUMÉ DE L'IMPORT
====================================================
Total de fichiers traités: 496
✓ Importés: 496
⚠️  Ignorés: 0
✗ Erreurs: 0
====================================================
```

---

## 👤 Créer un compte administrateur

### Via l'API

```bash
curl -X POST "http://localhost/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecos-platform.ch",
    "password": "AdminSecure123!",
    "first_name": "Admin",
    "last_name": "ECOS",
    "role": "admin"
  }'
```

### Via l'interface web

1. Aller sur http://localhost
2. Cliquer sur **"S'inscrire"**
3. Remplir le formulaire
4. Se connecter avec les identifiants

> 🔒 **Sécurité** : Par défaut, le premier compte créé devient admin. Changez cela en production !

---

## 🧪 Tester l'API

### Vérifier la santé du système

```bash
curl http://localhost/health
```

**Réponse attendue** :

```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T10:30:00.000Z",
  "uptime": 145.23,
  "environment": "development"
}
```

### Récupérer les cas AMBOSS

```bash
curl "http://localhost/api/v1/cases?category=amboss&limit=5" | jq
```

### Rechercher des cas

```bash
curl "http://localhost/api/v1/cases/search?q=douleur+thoracique" | jq
```

---

## 🛠️ Commandes Utiles

### Gestion des services

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f [service]

# Voir l'état des services
docker-compose ps
```

### Gestion de la base de données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U postgres -d ecos_platform

# Backup de la base de données
docker-compose exec postgres pg_dump -U postgres ecos_platform > backup.sql

# Restore de la base de données
cat backup.sql | docker-compose exec -T postgres psql -U postgres ecos_platform
```

### Logs et Debugging

```bash
# Logs en temps réel de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f postgres

# Dernières 100 lignes de logs
docker-compose logs --tail=100 backend

# Entrer dans un container
docker-compose exec backend sh
docker-compose exec postgres bash
```

---

## 🔧 Configuration Avancée

### Activer les services de monitoring

```bash
# Lancer avec Prometheus et Grafana
docker-compose --profile monitoring up -d

# Accéder à Grafana
open http://localhost:3002  # Login: admin / admin
```

### Mode développement (hot reload)

```bash
# Arrêter les services
docker-compose down

# Modifier docker-compose.yml pour monter les volumes en mode dev
# Redémarrer
docker-compose up -d
```

### Configurer Stripe en mode test

1. Créer un compte Stripe : https://dashboard.stripe.com/register
2. Aller dans **Developers** → **API keys**
3. Copier **Publishable key** et **Secret key**
4. Coller dans `.env` :
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
5. Configurer le webhook :
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/payments/webhook
   ```
6. Copier le **Webhook signing secret** dans `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 🐛 Troubleshooting

### Problème : Port déjà utilisé

**Erreur** : `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution** :

```bash
# Changer les ports dans docker-compose.yml
# Par exemple, PostgreSQL 5432 → 5433
ports:
  - "5433:5432"
```

### Problème : Import des cas échoue

**Erreur** : `Connection refused`

**Solution** :

```bash
# Vérifier que PostgreSQL est prêt
docker-compose logs postgres

# Attendre 30 secondes et réessayer
sleep 30
python3 import_cases_to_db.py
```

### Problème : Frontend ne se charge pas

**Erreur** : Page blanche ou erreur CORS

**Solution** :

```bash
# Vérifier les logs frontend
docker-compose logs frontend

# Vérifier les variables d'environnement
docker-compose exec frontend env | grep VITE

# Rebuild le frontend
docker-compose up -d --build frontend
```

### Problème : Authentification échoue

**Erreur** : `Invalid token` ou `JWT malformed`

**Solution** :

```bash
# Vérifier que JWT_SECRET est bien défini
docker-compose exec backend env | grep JWT_SECRET

# Générer un nouveau secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Mettre à jour .env et redémarrer
docker-compose restart backend
```

---

## 📚 Ressources

- **Documentation complète** : [ARCHITECTURE.md](ARCHITECTURE.md)
- **Guide API** : [API.md](docs/API.md)
- **Guide de déploiement** : [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Contribuer** : [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 💡 Prochaines Étapes

Maintenant que la plateforme tourne, vous pouvez :

1. ✅ **Explorer le catalogue** - Parcourir les 496 cas disponibles
2. ✅ **Tester le viewer** - Ouvrir un cas et essayer le mode révision
3. ✅ **Créer des comptes** - Tester les différents rôles (student, teacher, admin)
4. ✅ **Configurer Stripe** - Tester les paiements en mode test
5. ✅ **Générer un nouveau cas** - Uploader un PDF et voir la génération automatique
6. ✅ **Explorer les analytics** - Dashboard utilisateur avec statistiques
7. ✅ **Configurer le monitoring** - Grafana dashboards pour superviser la plateforme

---

## 🆘 Besoin d'aide ?

- 📧 **Email** : support@ecos-platform.ch
- 💬 **Discord** : https://discord.gg/ecos-platform
- 🐛 **Issues** : https://github.com/damienfulliquet/ecos-grid-generator/issues
- 📖 **Documentation** : https://docs.ecos-platform.ch

---

<p align="center">
  <strong>Bon développement ! 🚀</strong>
  <br>
  Si ce guide vous a été utile, n'hésitez pas à ⭐ le projet sur GitHub
</p>
