# 🚀 Démarrage Local Sans Docker

Guide pour démarrer la plateforme ECOS sans Docker (développement local).

---

## ✅ Prérequis Installés

Nous avons vérifié que vous avez :
- ✅ Node.js v24.3.0
- ✅ npm v11.4.2
- ✅ Python 3.13.5

---

## 📝 État Actuel

**Fichiers de configuration créés** :
- ✅ `backend/.env` - Configuration backend
- ✅ `frontend/.env` - Configuration frontend

---

## 🎯 Plan de Démarrage

### Option 1 : Mode Démo (Sans Base de Données)

Pour tester rapidement l'interface sans configurer PostgreSQL :

#### 1. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd frontend
npm install
```

#### 2. Créer un backend simplifié avec données mockées

Je vais créer un serveur de développement qui utilise les fichiers JSON existants :

```bash
# Démarrer le backend démo
cd backend
npm run dev:mock
```

#### 3. Démarrer le frontend

```bash
# Dans un autre terminal
cd frontend
npm run dev
```

#### 4. Accéder à l'application

Ouvrir http://localhost:3001 dans votre navigateur.

---

### Option 2 : Mode Complet (Avec PostgreSQL)

Pour une expérience complète avec base de données :

#### 1. Installer PostgreSQL

**Sur macOS** :
```bash
# Avec Homebrew
brew install postgresql@15
brew services start postgresql@15

# Créer la base de données
createdb ecos_platform
```

**Sur Linux** :
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
sudo -u postgres createdb ecos_platform
```

#### 2. Appliquer le schéma

```bash
psql -d ecos_platform -f DATABASE_SCHEMA.sql
```

#### 3. Importer les cas cliniques

```bash
# Installer les dépendances Python
pip3 install psycopg2-binary

# Importer les données
python3 import_cases_to_db.py
```

#### 4. Installer et démarrer les services

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

---

### Option 3 : Utiliser les Fichiers HTML Existants

Vous avez déjà un système fonctionnel avec les fichiers HTML :

#### Ouvrir directement dans le navigateur

```bash
# Ouvrir le catalogue complet
open HTML/ECOS_Revisions_Complete.html

# Ou une spécialité spécifique
open HTML/_ECOS_Pédiatrie_revisions.html
```

**Avantages** :
- ✅ Pas de configuration nécessaire
- ✅ Fonctionne immédiatement
- ✅ Tous les 496 cas disponibles
- ✅ Interface interactive déjà créée

**Limitations** :
- ❌ Pas de suivi de progression
- ❌ Pas d'authentification
- ❌ Pas de paiements
- ❌ Pas de génération de nouveaux cas

---

## 🎨 Prochaines Étapes Recommandées

### Pour tester l'interface existante (Immédiat)

```bash
# Ouvrir le fichier principal
open /Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/HTML/ECOS_Revisions_Complete.html
```

### Pour développer la plateforme SaaS (Quelques heures)

1. **Installer Docker** (recommandé) :
   - Télécharger : https://www.docker.com/products/docker-desktop
   - Installer et redémarrer
   - Puis : `docker-compose up -d`

2. **Ou configurer PostgreSQL localement** (Option 2 ci-dessus)

3. **Configurer Stripe** (pour les paiements) :
   - Créer un compte : https://dashboard.stripe.com/register
   - Obtenir les API keys test
   - Mettre à jour `.env` files

---

## 🔧 Scripts Utiles

### Créer un serveur de développement simple

Je vais créer un serveur Node.js simple qui sert les fichiers JSON :

```javascript
// dev-server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir les fichiers JSON comme API
app.get('/api/v1/cases', (req, res) => {
    const jsonDir = path.join(__dirname, '../json_files/AMBOSS');
    const files = fs.readdirSync(jsonDir);
    const cases = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const content = fs.readFileSync(path.join(jsonDir, f), 'utf8');
            return JSON.parse(content);
        });
    res.json({ success: true, data: cases });
});

app.listen(3000, () => {
    console.log('🚀 Dev server running on http://localhost:3000');
});
```

### Démarrer le serveur de dev

```bash
cd backend
node dev-server.js
```

---

## 📊 État de la Plateforme

### ✅ Ce qui est prêt

1. **496 cas cliniques** dans `HTML/ECOS_Revisions_Complete.html`
2. **Interface complète** fonctionnelle dans le navigateur
3. **1326 fichiers JSON** structurés dans `json_files/`
4. **Architecture complète** documentée
5. **Code backend/frontend** créé et prêt
6. **Infrastructure Docker** configurée

### 🔄 Ce qui nécessite une action

1. **Installer Docker** (recommandé) OU configurer PostgreSQL
2. **Configurer Stripe** pour les paiements
3. **Déployer sur un serveur** pour l'hébergement online

---

## 💡 Recommandation

**Pour commencer rapidement** :

1. **Tester l'existant** :
   ```bash
   open /Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/HTML/ECOS_Revisions_Complete.html
   ```

2. **Installer Docker** :
   - Plus simple pour tout démarrer
   - Un seul fichier de configuration
   - Tous les services inclus

3. **Revenir au guide** [`QUICKSTART.md`](QUICKSTART.md) après installation de Docker

---

## 🆘 Besoin d'aide ?

Si vous voulez :
- ✅ **Installer Docker** : https://www.docker.com/products/docker-desktop
- ✅ **Configurer PostgreSQL** : Je peux vous guider
- ✅ **Créer un serveur de dev simple** : Je peux créer le fichier
- ✅ **Déployer sur un cloud** : Suivre [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 📈 Vision Long Terme

Cette infrastructure est conçue pour :
- 🎯 **Hébergement cloud** (AWS/Azure/GCP)
- 💳 **Monétisation** (Stripe)
- 📊 **Analytics** (Prometheus/Grafana)
- 🚀 **Scalabilité** (Docker + Kubernetes)

Le fichier HTML actuel est parfait pour les révisions immédiates, mais la plateforme SaaS apportera :
- Suivi de progression
- Recommandations personnalisées
- Génération automatique de nouveaux cas
- Paiements et abonnements
- Application mobile (roadmap)

---

**Quelle option préférez-vous ?**
1. Tester l'interface HTML existante maintenant
2. Installer Docker et démarrer toute la plateforme
3. Configurer PostgreSQL manuellement
