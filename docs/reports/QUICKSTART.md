# Guide de Démarrage Rapide - ECOS Platform

## 🚨 Problème : Base de données vide (0 cas)

Si vous voyez "0 cas, 0 fiches, 0 guides" dans le frontend, suivez ces étapes :

### Solution 1 : Reconstruire les containers (Recommandé)

```bash
# 1. Arrêter les containers existants
cd /Users/damienfulliquet/Documents/GitHub/ecos-grid-generator
./stop-ecos.sh

# 2. Nettoyer les containers et volumes
cd platform
docker-compose down -v

# 3. Reconstruire sans cache
docker-compose build --no-cache

# 4. Redémarrer avec import automatique
cd ..
./start-ecos.sh
# Choisir l'option 1 (Docker)
# Choisir le profil 1 (Standard)
```

### Solution 2 : Import manuel des données

Si les containers sont déjà lancés :

```bash
# Vérifier que les containers sont actifs
docker ps | grep ecos

# Exécuter l'import manuellement
docker-compose -f platform/docker-compose.yml exec backend bash /app/import-all-data.sh
```

### Solution 3 : En mode développement local

```bash
# 1. S'assurer que PostgreSQL est actif
psql -U postgres -d ecos_platform -c "SELECT 1;"

# 2. Définir les variables d'environnement
export DB_HOST=localhost
export DB_PASSWORD=ecos_secure_password_2025
export DB_USER=postgres
export DB_NAME=ecos_platform

# 3. Lancer l'import
cd platform/backend
python3 import_json_files.py ../../json_files
```

## 🔍 Vérifier que l'import a fonctionné

### Via l'API

```bash
# Compter les cas dans la base
curl http://localhost/api/v1/cases/count

# ou en développement local :
curl http://localhost:3000/api/v1/cases/count
```

### Via la base de données

```bash
# En Docker
docker-compose -f platform/docker-compose.yml exec postgres psql -U postgres -d ecos_platform -c "SELECT COUNT(*) FROM clinical_cases;"

# En local
psql -U postgres -d ecos_platform -c "SELECT COUNT(*) FROM clinical_cases;"
```

Résultat attendu : environ **100+ cas** selon les sources disponibles

## 📊 Vérifier les sources importées

```bash
# En Docker
docker-compose -f platform/docker-compose.yml exec postgres psql -U postgres -d ecos_platform -c "
SELECT source, COUNT(*) as total
FROM clinical_cases
GROUP BY source
ORDER BY source;"

# En local
psql -U postgres -d ecos_platform -c "
SELECT source, COUNT(*) as total
FROM clinical_cases
GROUP BY source
ORDER BY source;"
```

## 🐛 Logs de débogage

### Voir les logs du backend

```bash
# Tous les logs
docker-compose -f platform/docker-compose.yml logs -f backend

# Logs d'import uniquement
docker-compose -f platform/docker-compose.yml logs backend | grep -i import
```

### Voir les logs de la base de données

```bash
docker-compose -f platform/docker-compose.yml logs -f postgres
```

## 🔧 Dépannage Avancé

### Réinitialiser complètement la base

```bash
# ⚠️  ATTENTION : Ceci efface toutes les données !

# 1. Arrêter les services
./stop-ecos.sh

# 2. Supprimer les volumes Docker
docker-compose -f platform/docker-compose.yml down -v

# 3. Redémarrer (la base sera recréée)
./start-ecos.sh
```

### Vérifier que psycopg2 est installé

```bash
docker-compose -f platform/docker-compose.yml exec backend python3 -c "import psycopg2; print('✅ psycopg2 OK')"
```

### Vérifier le chemin des fichiers JSON

```bash
# Vérifier que json_files existe
ls -la json_files/

# Compter les fichiers JSON par source
find json_files/ -name "*.json" | grep -v node_modules | wc -l

# Détail par source
for dir in json_files/*/; do
  count=$(find "$dir" -name "*.json" | wc -l)
  echo "$(basename "$dir"): $count fichiers"
done
```

## ✅ Checklist de Vérification

- [ ] Docker est lancé et actif
- [ ] Les containers sont tous "healthy" (docker ps)
- [ ] Le répertoire `json_files/` existe et contient des fichiers JSON
- [ ] psycopg2 est installé dans le container backend
- [ ] La base de données `ecos_platform` existe
- [ ] Les tables sont créées (clinical_cases, etc.)
- [ ] Les données sont importées (SELECT COUNT(*) > 0)
- [ ] L'API répond correctement (curl /api/v1/cases/count)

## 📞 Support

Si le problème persiste :

1. Vérifier les logs : `docker-compose -f platform/docker-compose.yml logs -f`
2. Vérifier le schéma de la base : `docker-compose -f platform/docker-compose.yml exec postgres psql -U postgres -d ecos_platform -c "\dt"`
3. Vérifier les variables d'environnement : `docker-compose -f platform/docker-compose.yml exec backend env | grep DB_`

## 🚀 Démarrage Normal (une fois configuré)

Une fois que tout fonctionne :

```bash
# Démarrer
./start-ecos.sh

# Arrêter
./stop-ecos.sh
```

C'est tout ! La plateforme devrait maintenant afficher tous les cas ECOS.
