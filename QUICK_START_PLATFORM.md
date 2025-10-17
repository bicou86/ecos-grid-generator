# 🚀 Guide de Démarrage Rapide - ECOS Platform

## Prérequis

- Docker et Docker Compose installés
- Ports disponibles: 3000 (backend), 3001 (frontend), 5432 (PostgreSQL)

## Démarrage en 3 étapes

### 1. Démarrer les services Docker

```bash
cd platform
docker-compose up -d
```

Attendez que tous les services soient "healthy" (environ 30 secondes).

### 2. Vérifier que la base de données contient des données

```bash
curl http://localhost:3000/api/v1/stats
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "totalCases": 674,
    "totalCategories": 8,
    "totalSpecialties": 15,
    "difficultyBreakdown": {
      "beginner": 177,
      "intermediate": 423,
      "advanced": 74
    }
  }
}
```

### 3. Accéder à la plateforme

**Frontend:** http://localhost:3001
**Backend API:** http://localhost:3000/api/v1

---

## 🔍 Vérification de Santé

### Backend
```bash
curl http://localhost:3000/health
```

### Base de données
```bash
docker exec -it ecos_postgres psql -U postgres -d ecos_platform -c "SELECT COUNT(*) FROM clinical_cases;"
```

**Résultat attendu:** 674 lignes

---

## 🛠️ Commandes Utiles

### Voir les logs
```bash
# Backend
docker logs -f platform-backend-1

# Frontend
docker logs -f platform-frontend-1

# PostgreSQL
docker logs -f ecos_postgres
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Arrêter tous les services
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ perte de données)
```bash
docker-compose down -v
```

---

## 📊 Endpoints API Principaux

### Statistiques
```bash
GET http://localhost:3000/api/v1/stats
```

### Catégories
```bash
GET http://localhost:3000/api/v1/categories
```

### Spécialités
```bash
GET http://localhost:3000/api/v1/specialties
```

### Cas cliniques (avec pagination)
```bash
GET http://localhost:3000/api/v1/cases?page=1&limit=20
```

### Fiches statistiques
```bash
GET http://localhost:3000/api/v1/fiches/stats
```

---

## 🐛 Dépannage

### Problème: "Connection refused" sur l'API

**Solution:**
```bash
docker ps | grep backend
# Si le conteneur n'est pas en cours d'exécution:
docker-compose up -d backend
```

### Problème: Compteurs à "0" sur la page d'accueil

**Solution 1:** Vider le cache du navigateur
- **Mac:** Cmd + Shift + R
- **Windows:** Ctrl + Shift + R

**Solution 2:** Réassigner les catégories
```bash
cd platform/backend
python3 assign_categories_to_cases.py
```

### Problème: Base de données vide

**Solution:** Réimporter les données
```bash
cd platform/backend
# Vérifier les scripts d'import disponibles
ls -l import_*.py
```

### Problème: Frontend ne se connecte pas au backend

**Vérifier la variable d'environnement:**
```bash
# Dans platform/frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📦 Structure des Services

```
┌─────────────────────────────────────────────────┐
│              ECOS Platform Stack                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐      ┌─────────────┐         │
│  │  Frontend   │─────▶│   Backend   │         │
│  │   React     │      │  Express.js │         │
│  │  Port 3001  │      │  Port 3000  │         │
│  └─────────────┘      └──────┬──────┘         │
│                               │                 │
│                               ▼                 │
│                      ┌─────────────┐           │
│                      │ PostgreSQL  │           │
│                      │  Port 5432  │           │
│                      └─────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Prochaines Étapes

1. **Tester la navigation:** Explorer les catégories sur http://localhost:3001
2. **Créer un compte:** Tester l'inscription/connexion
3. **Explorer un cas clinique:** Sélectionner une catégorie et ouvrir un cas

---

## 📚 Documentation Complémentaire

- [PLATFORM_IMPROVEMENTS.md](PLATFORM_IMPROVEMENTS.md) - Liste des améliorations récentes
- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) - Schéma de la base de données
- [platform/backend/README.md](platform/backend/README.md) - Documentation backend
- [platform/frontend/README.md](platform/frontend/README.md) - Documentation frontend

---

## 💡 Astuces

### Mode développement avec hot-reload

**Frontend:**
```bash
cd platform/frontend
npm run dev
```

**Backend:**
```bash
cd platform/backend
npm run dev
```

### Accès direct à PostgreSQL
```bash
docker exec -it ecos_postgres psql -U postgres -d ecos_platform
```

### Vérifier l'utilisation des ports
```bash
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL
```

---

*Guide créé le 16 octobre 2025*
