# ECOS Platform - Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend Server
```bash
cd backend
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 npm start
```
Backend will run on: **http://localhost:3000**

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on: **http://localhost:3001**

### 3. Open in Browser
```bash
open http://localhost:3001
```

## 📍 Key URLs

### Frontend Pages
- **Home**: http://localhost:3001
- **Stations Launchpad**: http://localhost:3001/stations
- **All Stations**: http://localhost:3001/stations/list
- **All Circuits**: http://localhost:3001/stations/circuits
- **Catalog**: http://localhost:3001/catalog
- **Fiches**: http://localhost:3001/fiches

### Backend API
- **Health Check**: http://localhost:3000/health
- **Categories**: http://localhost:3000/api/v1/fiche-categories
- **Circuits**: http://localhost:3000/api/v1/circuits?type=predefined
- **Fiches**: http://localhost:3000/api/v1/fiches?fiche_type=ssp

## 🎯 Quick Test

Test a complete user flow:

1. Go to http://localhost:3001/stations
2. Click on a **category card** (e.g., "Anamnèse")
3. Browse stations in that category
4. Go back and click "**Voir tous les circuits**"
5. Select "**Circuit Examen Blanc**"
6. Click "**Démarrer**" to start the 13-minute timer
7. Navigate through stations

## 📊 Database Stats

- **562 fiches** imported
- **10 categories** created
- **8 predefined circuits** available
- **604 category mappings**
- **95 circuit-fiche relationships**

## 🔑 Categories

1. 💬 **Anamnèse** (40 fiches) - Blue
2. 🔍 **Examen Clinique** (474 fiches) - Green
3. 🏥 **Management** (7 fiches) - Purple
4. 🗣️ **Communication** (9 fiches) - Orange
5. 🚨 **Urgences** (19 fiches) - Red
6. 💉 **Procédures** (1 fiche) - Pink
7. 📊 **Interprétation** (1 fiche) - Indigo
8. 👶 **Pédiatrie** (21 fiches) - Teal
9. 🧠 **Psychiatrie** (18 fiches) - Purple
10. 🤰 **Gynéco-Obstétrique** (14 fiches) - Orange

## 🎮 Circuits Available

1. **Circuit Examen Blanc** (13 stations, 169 min, Avancé)
2. **Circuit Urgences** (15 stations, 196 min, Avancé)
3. **Circuit Médecine Interne** (15 stations, 186 min, Intermédiaire)
4. **Circuit Psychiatrie Essentielle** (10 stations, 120 min, Intermédiaire)
5. **Circuit Pédiatrie Complète** (12 stations, 163 min, Intermédiaire)
6. **Circuit Examen Musculo-squelettique** (12 stations, 135 min, Intermédiaire)
7. **Circuit Anamnèse Complète** (10 stations, 100 min, Débutant)
8. **Circuit Communication** (8 stations, 98 min, Débutant)

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill existing process
pkill -f "node server-simple"

# Restart
cd backend && DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 npm start
```

### Frontend Won't Start
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill existing process
kill -9 $(lsof -ti:3001)

# Restart
cd frontend && npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Connect to database manually
psql -h localhost -U your_user -d ecos_platform
```

### API Returns Empty Data
```bash
# Re-run population script
cd backend
python3 populate_categories.py
```

## 📝 Development Notes

### Adding New Pages
1. Create component in `frontend/src/pages/[section]/`
2. Add route to `frontend/src/App.jsx`
3. Update navigation in `frontend/src/components/Navigation/DropdownMenu.jsx`

### Adding New API Endpoints
1. Add route to `backend/routes/navigation.js` (or create new route file)
2. Import and register in `backend/server-simple.js`
3. Test with curl or Postman

### Modifying Database Schema
1. Create new migration in `backend/migrations/`
2. Run migration: `python3 backend/run_migration.py [number]`
3. Update population script if needed

## 📚 Documentation

- **Architecture**: [PLATFORM_REDESIGN_PLAN.md](PLATFORM_REDESIGN_PLAN.md)
- **Testing**: [NAVIGATION_TESTING_GUIDE.md](NAVIGATION_TESTING_GUIDE.md)
- **Complete Summary**: [NAVIGATION_COMPLETE.md](NAVIGATION_COMPLETE.md)

## 🎨 Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, PostgreSQL
- **Tools**: Vite, Python (data processing)

## ✅ What's Working

- ✅ Top navigation with dropdowns
- ✅ Stations launchpad with categories and circuits
- ✅ Station browsing with filters
- ✅ Circuit player with 13-minute timer
- ✅ Category-based station browsing
- ✅ Progress tracking through circuits
- ✅ Responsive design (mobile-friendly)

## 🚧 What's Next

- [ ] Authentication UI (login/register)
- [ ] User dashboard with progress tracking
- [ ] Bookmarks and notes UI
- [ ] Study session tracking UI
- [ ] Guides Pratiques section
- [ ] Cas Cliniques section

---

**Last Updated**: 2025-10-15
**Status**: Production Ready ✅
