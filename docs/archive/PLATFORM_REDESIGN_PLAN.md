# ECOS Platform - Navigation Redesign Plan

**Inspired by**: Geeky Medics (app.geekymedics.com)
**Tailored for**: Swiss Medical Students & ECOS Exam Preparation
**Date**: 2025-10-15

---

## Executive Summary

Redesign the ECOS platform navigation to provide an intuitive, comprehensive learning experience specifically for Swiss medical students preparing for ECOS (Examen Clinique Objectif Structuré) exams.

### Current Platform Assets

- **562 Fiches** across 4 types (SSP, DX, Skills, Resume)
- **1,023 Medical Images**
- **15 Medical Disciplines**
- **294 SSP Stations** (Standardized Patient Scenarios)
- **134 Clinical Cases** (Diagnosis fiches)
- **118 Skills Guides** (Examination techniques)
- **16 Comprehensive Reviews** (System summaries)

---

## Proposed Navigation Structure

### Main Navigation (6 Core Product Areas)

```
┌─────────────────────────────────────────────────────────────┐
│  ECOS Platform - Swiss Medical Education                    │
├─────────────────────────────────────────────────────────────┤
│  HOME | STATIONS SSP | GUIDES | CAS CLINIQUES |             │
│  FICHES REVISION | GÉNÉRATEUR | COMPTE                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. HOME (/) - Dashboard

### Dashboard Sections

**Quick Access Cards:**
- 🏥 **Mes Stations** - Continue practicing (recently viewed SSP)
- 📚 **Fiches du Jour** - Daily recommended revision fiches
- 📊 **Ma Progression** - Progress tracking across disciplines
- ⭐ **Favoris** - Bookmarked content
- 🎯 **Prochaine Station** - Smart recommendation engine

**Statistics Overview:**
- Stations complétées: X/294
- Disciplines couvertes: X/15
- Temps d'étude total: XX heures
- Dernière session: Date

**Quick Links:**
- Créer un circuit ECOS personnalisé
- Station ECOS aléatoire
- Session d'étude en groupe
- Générateur de grilles

---

## 2. STATIONS SSP (/stations-ssp/launchpad)

**Tagline**: "294 stations standardisées patient - Pratiquez vos compétences cliniques"

### Main Sections

#### A. Banque de Stations (/stations-ssp/)
**Filter Options:**
- **Par Catégorie** (inspired by Geeky Medics):
  - 💬 Anamnèse (History Taking)
  - 🔍 Examen Clinique (Clinical Examination)
  - 🏥 Management & Prise en Charge
  - 🗣️ Communication & Clôture
  - 🚨 Urgences & Situations Critiques
  - 👶 Pédiatrie
  - 🧠 Psychiatrie
  - 🤰 Gynéco-Obstétrique
  - 📋 Synthèse (Comprehensive SSP)

- **Par Discipline** (15 disciplines):
  - Médecine générale (129)
  - Orthopédie/Rhumatologie (24)
  - Neurologie (23)
  - Pédiatrie (20)
  - Pneumologie (14)
  - Psychiatrie (13)
  - etc.

- **Par Type**:
  - SSP - Station Standardisée (142)
  - SSP - Synthèse (18)
  - SSP - Héritage (134)

- **Par Difficulté** (to be added):
  - ⭐ Débutant
  - ⭐⭐ Intermédiaire
  - ⭐⭐⭐ Avancé

**View Options:**
- Liste avec détails
- Grille compacte
- Vue par discipline
- A-Z alphabétique
- Trieur: Récent, Populaire, Non-pratiqué

**Action Buttons:**
- 🎲 Station Aléatoire
- ➕ Créer un Circuit
- 🔍 Recherche Avancée
- 📊 Basculer Mode Diagnostic

#### B. Mes Stations (/stations-ssp/mes-stations)
- Stations créées par l'utilisateur
- Stations modifiées
- Historique de pratique
- Notes personnelles

#### C. Créer une Station (/stations-ssp/creer)
- Formulaire guidé pour créer des stations personnalisées
- Templates prédéfinis
- Import depuis fichier

#### D. Circuits ECOS (/stations-ssp/circuits)
**Circuits Prédéfinis:**
- Circuit "Urgences" (10 stations)
- Circuit "Médecine Interne" (13 stations)
- Circuit "Pédiatrie Complète" (8 stations)
- Circuit "Psychiatrie Essentielle" (6 stations)
- Circuit "Examen Blanc" (13 stations - durée totale 3h)

**Mes Circuits:**
- Créer un circuit personnalisé
- Sauvegarder des collections
- Partager avec des collègues

#### E. Performance (/stations-ssp/performance)
- Statistiques par catégorie
- Temps moyen par station
- Points forts / Points faibles
- Progression dans le temps
- Recommandations d'amélioration

---

## 3. GUIDES CLINIQUES (/guides/launchpad)

**Tagline**: "118 guides pas-à-pas pour maîtriser l'examen clinique"

### Categories (based on Skills fiches)

**Dropdown Menu:**
- 💬 **Anamnèse** (History Taking)
  - Anamnèse Générale
  - Anamnèse Cardiologique
  - Anamnèse Pulmonaire
  - Anamnèse Psychiatrique
  - Anamnèse Pédiatrique
  - Anamnèse Sexuelle
  - MMSE & MoCA

- 🔍 **Examen Clinique** (Physical Examination)
  - Status Général
  - Status Cardiovasculaire
  - Status Pulmonaire
  - Status Abdominal
  - Status Neurologique
  - Status Psychiatrique
  - Status Pédiatrique
  - Status Dermatologique
  - Status Gynécologique
  - Status ORL/Ophtalmologique

- 🦴 **Examen Musculo-squelettique**
  - GALS (Gait, Arms, Legs, Spine)
  - Épaule
  - Coude
  - Poignet et Main
  - Hanche
  - Genou
  - Cheville et Pied
  - Rachis

- 🧠 **Examen Neurologique**
  - Status Neurologique Complet
  - Nerfs Crâniens
  - Glasgow Coma Scale
  - MMSE & MoCA

- 💉 **Procédures** (to be added)
  - BLS (Basic Life Support)
  - Réanimation Cardiopulmonaire
  - Techniques d'urgence

- 📊 **Interprétation**
  - ECG
  - Fond d'Œil
  - Weber & Rinne

- 🗣️ **Communication**
  - Communication Médicale
  - Guide de Consultation
  - Breaking Bad News
  - Entretien Motivationnel

**Features:**
- Guide détaillé étape par étape
- Checklists imprimables
- Images et vidéos (when available)
- Points clés à retenir
- Pièges fréquents
- Favoris et annotations

**View Options:**
- Vue liste complète
- Recherche par mot-clé
- Filtrer par discipline
- Guides favoris uniquement
- Guides non-consultés

---

## 4. CAS CLINIQUES (/cas-cliniques/launchpad)

**Tagline**: "134 cas cliniques diagnostiques - Développez votre raisonnement clinique"

### Main Sections

#### A. Banque de Cas (/cas-cliniques/)
**Categories:**
- Par Discipline (15 disciplines)
- Par Système:
  - Cardiovasculaire
  - Respiratoire
  - Gastro-intestinal
  - Neurologique
  - Musculo-squelettique
  - Psychiatrique
  - Pédiatrique
  - Gynéco-obstétrique
  - Dermatologique
  - ORL/Ophtalmologique

**Filters:**
- Niveau d'urgence: 🚨 Urgent / Routine
- Fréquence: ⭐⭐⭐⭐⭐ (Very common)
- Difficulté: Débutant / Intermédiaire / Avancé
- Non-pratiqué / En cours / Complété

**Case Display:**
- Présentation clinique
- Images diagnostiques (when available)
- Anamnèse guidée
- Examen clinique
- Diagnostics différentiels
- Plan de management
- Explications détaillées

#### B. Examens Blancs (/cas-cliniques/examens-blancs)
**Predefined Exams:**
- Examen Blanc 1: 20 cas (2 heures)
- Examen Blanc 2: 20 cas (2 heures)
- Examen Blanc Complet: 40 cas (4 heures)
- Mini-examen par discipline

**Features:**
- Mode examen (timer, pas de retour arrière)
- Correction détaillée avec explications
- Score et classement
- Revue des erreurs

#### C. Mes Cas (/cas-cliniques/mes-cas)
- Cas créés
- Cas en cours
- Historique des cas complétés
- Notes et annotations

#### D. Performance (/cas-cliniques/performance)
- Taux de réussite par discipline
- Temps moyen par cas
- Diagnostics différentiels - précision
- Progression dans le temps

---

## 5. FICHES RÉVISION (/fiches-revision/launchpad)

**Tagline**: "562 fiches complètes pour réviser efficacement"

### Main Sections

#### A. Banque de Fiches (/fiches-revision/)
**View by Type:**
- 📋 Toutes les Fiches (562)
- 🏥 Stations SSP (294)
- 🔍 Cas Diagnostiques (134)
- 📚 Guides Cliniques (118)
- 📖 Résumés Système (16)

**Filters:**
- Par Discipline (15 disciplines)
- Par Type de Fiche
- Par Difficulté
- Avec Images uniquement
- Favoris

**View Options:**
- Vue Liste détaillée
- Vue Grille avec miniatures
- Vue Compacte
- Trieur: A-Z, Récent, Populaire, Non-lu

**Search:**
- Recherche plein-texte
- Recherche par symptôme
- Recherche par diagnostic
- Recherche par procédure

#### B. Résumés par Système (/fiches-revision/resumes)
**16 Comprehensive System Reviews:**
- 🫀 Thorax (Cardiologie et Pneumologie)
- 🫁 Abdomen (Gastro-entérologie et Urologie)
- 🦴 Système Musculo-squelettique
- 🤰 Obstétrique et Gynécologie
- 👶 Pédiatrie
- 🧠 Neurologie
- 🧘 Psychiatrie

**Plus: Guides d'Examen Complets**
- Guide Complet Cardio-Pulmonaire
- Guide Complet Abdominal
- Guide Complet Musculo-Squelettique
- Guide Complet Neurologique
- Guide Complet Pédiatrique
- Guide Complet Psychiatrique
- Guide Complet Gynéco-Obstétrique

#### C. Favoris (/fiches-revision/favoris)
- Fiches sauvegardées
- Collections personnalisées
- Notes et surlignages

#### D. Historique (/fiches-revision/historique)
- Fiches récemment consultées
- Temps passé par fiche
- Progression de lecture

---

## 6. GÉNÉRATEUR GRILLES (/generateur/launchpad)

**Tagline**: "Créez vos propres grilles ECOS personnalisées"

### Main Sections

#### A. Générateur de Grilles (/generateur/)
**Current Feature - Enhanced:**
- Upload PDF (cas clinique en allemand ou français)
- Traduction automatique
- Génération JSON structuré
- Génération HTML interactif
- Génération PDF imprimable
- Feuille porte automatique

**New Features:**
- Templates prédéfinis
- Modification en ligne
- Prévisualisation temps réel
- Export multiples formats
- Partage avec collègues

#### B. Mes Grilles (/generateur/mes-grilles)
- Grilles créées
- Grilles en cours d'édition
- Grilles partagées avec moi
- Templates personnels

#### C. Bibliothèque Templates (/generateur/templates)
- Templates par discipline
- Templates par type d'examen
- Templates standardisés Swiss ECOS
- Import/Export templates

---

## 7. COMPTE UTILISATEUR (/compte)

### User Profile Sections

**Dropdown Menu:**
- 👤 **Mon Profil** (/compte/profil)
  - Informations personnelles
  - Université / Année d'études
  - Objectifs d'apprentissage
  - Photo de profil

- 📊 **Tableau de Bord** (/compte/dashboard)
  - Vue d'ensemble de la progression
  - Statistiques globales
  - Activité récente
  - Recommandations personnalisées

- ⭐ **Mes Favoris** (/compte/favoris)
  - Stations SSP favorites
  - Guides favoris
  - Cas cliniques favoris
  - Fiches favorites

- 📝 **Mes Notes** (/compte/notes)
  - Notes personnelles
  - Annotations sur fiches
  - Mind maps
  - Flashcards personnalisées

- 🎯 **Ma Progression** (/compte/progression)
  - Par discipline (15 disciplines)
  - Par type de contenu
  - Graphiques de progression
  - Objectifs et jalons

- 📅 **Mon Calendrier** (/compte/calendrier)
  - Planning d'étude
  - Sessions planifiées
  - Révisions espacées (spaced repetition)
  - Rappels et notifications

- ⚙️ **Paramètres** (/compte/parametres)
  - Préférences d'affichage
  - Notifications
  - Langue (FR/DE)
  - Mode sombre/clair
  - Confidentialité

- 🎓 **Mon Abonnement** (/compte/abonnement)
  - Statut actuel
  - Fonctionnalités disponibles
  - Historique de paiement
  - Upgrade options

- 📖 **Historique** (/compte/historique)
  - Activité complète
  - Contenu consulté
  - Temps d'étude
  - Export des données

- 💬 **Support** (/compte/support)
  - Centre d'aide
  - Contacter l'équipe
  - Signaler un problème
  - Suggestions d'amélioration

- 🚪 **Déconnexion**

---

## Additional Features

### 8. RECHERCHE GLOBALE (Header - Always Accessible)

**Smart Search:**
- Recherche intelligente multi-critères
- Auto-complétion
- Suggestions contextuelles
- Filtres rapides (SSP, Guides, Cas, Fiches)
- Recherche récente
- Recherches sauvegardées

**Search Filters:**
- Type de contenu
- Discipline
- Difficulté
- Avec/Sans images
- Urgence (pour cas cliniques)

### 9. NOTIFICATIONS (Bell Icon)

**Types de Notifications:**
- Nouveau contenu ajouté
- Recommandations personnalisées
- Rappels de révision (spaced repetition)
- Objectifs atteints
- Commentaires/partages
- Mises à jour système

### 10. SESSION GROUPE (Optional - Future)

**Features:**
- Créer une session d'étude en groupe
- Joindre une session existante
- Mode circuit synchronisé
- Chat en temps réel
- Partage d'écran
- Feedback collaboratif

---

## Navigation Enhancements

### Top Navigation Bar

```
┌──────────────────────────────────────────────────────────────────┐
│ 🏥 ECOS Platform                                    [Search 🔍]  │
│                                                                   │
│ Accueil | Stations SSP ▼ | Guides ▼ | Cas Cliniques ▼ |         │
│ Fiches Révision ▼ | Générateur ▼ | 🔔 | 👤 Mon Compte ▼         │
└──────────────────────────────────────────────────────────────────┘
```

### Breadcrumb Navigation

```
Accueil > Stations SSP > Anamnèse > Douleur Thoracique
```

### Quick Actions Sidebar (Contextual)

**On Station Page:**
- ⏱️ Démarrer Timer (13 min)
- ⭐ Ajouter aux Favoris
- 📋 Imprimer Grille
- 🔗 Partager
- 📊 Voir Performance
- 🎲 Station Suivante

**On Guide Page:**
- 🖨️ Imprimer Checklist
- ⭐ Ajouter aux Favoris
- 📝 Prendre Notes
- 🎥 Voir Vidéo (if available)
- 🔗 Voir Stations Liées

---

## Database Schema Updates Needed

### New Tables

```sql
-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  fiche_id UUID REFERENCES fiches(id),
  status VARCHAR(50), -- 'not_started', 'in_progress', 'completed'
  score DECIMAL(5,2),
  time_spent INTEGER, -- seconds
  last_accessed TIMESTAMP,
  completion_date TIMESTAMP,
  notes TEXT,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, fiche_id)
);

-- User circuits (collections of stations)
CREATE TABLE circuits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE circuit_fiches (
  id UUID PRIMARY KEY,
  circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
  fiche_id UUID REFERENCES fiches(id) ON DELETE CASCADE,
  display_order INTEGER,
  UNIQUE(circuit_id, fiche_id)
);

-- Study sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  fiche_id UUID REFERENCES fiches(id),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  time_spent INTEGER, -- seconds
  completed BOOLEAN DEFAULT FALSE
);

-- User notes
CREATE TABLE user_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  fiche_id UUID REFERENCES fiches(id),
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Fiche categories (for better organization)
CREATE TABLE fiche_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parent_id UUID REFERENCES fiche_categories(id),
  icon VARCHAR(50),
  display_order INTEGER
);

CREATE TABLE fiche_category_mapping (
  fiche_id UUID REFERENCES fiches(id),
  category_id UUID REFERENCES fiche_categories(id),
  PRIMARY KEY(fiche_id, category_id)
);
```

### Existing Table Updates

```sql
-- Add columns to fiches table
ALTER TABLE fiches ADD COLUMN difficulty_level INTEGER; -- 1-3
ALTER TABLE fiches ADD COLUMN estimated_duration INTEGER; -- minutes
ALTER TABLE fiches ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE fiches ADD COLUMN frequency_rating INTEGER; -- 1-5 stars
ALTER TABLE fiches ADD COLUMN times_viewed INTEGER DEFAULT 0;
ALTER TABLE fiches ADD COLUMN avg_completion_time INTEGER; -- seconds
ALTER TABLE fiches ADD COLUMN avg_score DECIMAL(5,2);

-- Create indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_fiches_difficulty ON fiches(difficulty_level);
CREATE INDEX idx_fiches_frequency ON fiches(frequency_rating);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
```

---

## Frontend Component Structure

```
/src
├── pages/
│   ├── Home/
│   │   └── Dashboard.tsx
│   ├── StationsSSP/
│   │   ├── Launchpad.tsx
│   │   ├── StationBank.tsx
│   │   ├── StationDetail.tsx
│   │   ├── MyStations.tsx
│   │   ├── CreateStation.tsx
│   │   ├── Circuits.tsx
│   │   └── Performance.tsx
│   ├── Guides/
│   │   ├── Launchpad.tsx
│   │   ├── GuidesList.tsx
│   │   ├── GuideDetail.tsx
│   │   └── GuidesByCategory.tsx
│   ├── CasCliniques/
│   │   ├── Launchpad.tsx
│   │   ├── CaseBank.tsx
│   │   ├── CaseDetail.tsx
│   │   ├── MockExams.tsx
│   │   └── Performance.tsx
│   ├── FichesRevision/
│   │   ├── Launchpad.tsx
│   │   ├── FicheBank.tsx
│   │   ├── FicheDetail.tsx
│   │   ├── SystemReviews.tsx
│   │   └── Bookmarks.tsx
│   ├── Generateur/
│   │   ├── Launchpad.tsx
│   │   ├── CreateGrid.tsx
│   │   ├── MyGrids.tsx
│   │   └── Templates.tsx
│   └── Account/
│       ├── Profile.tsx
│       ├── Dashboard.tsx
│       ├── Progress.tsx
│       ├── Calendar.tsx
│       ├── Settings.tsx
│       └── History.tsx
├── components/
│   ├── Navigation/
│   │   ├── TopNav.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── QuickActions.tsx
│   ├── Search/
│   │   ├── GlobalSearch.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchResults.tsx
│   ├── Cards/
│   │   ├── StationCard.tsx
│   │   ├── GuideCard.tsx
│   │   ├── CaseCard.tsx
│   │   └── FicheCard.tsx
│   ├── Filters/
│   │   ├── DisciplineFilter.tsx
│   │   ├── TypeFilter.tsx
│   │   ├── DifficultyFilter.tsx
│   │   └── StatusFilter.tsx
│   ├── Performance/
│   │   ├── StatsCard.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── HeatMap.tsx
│   │   └── RecommendationEngine.tsx
│   └── Launchpad/
│       ├── LaunchpadCard.tsx
│       ├── QuickStats.tsx
│       └── RecentActivity.tsx
```

---

## Implementation Priority

### Phase 1 (Week 1-2): Core Structure
1. ✅ Create database migrations for new schema
2. ✅ Update fiches table with additional columns
3. ✅ Create user_progress and circuits tables
4. ✅ Build new navigation components
5. ✅ Create launchpad pages (templates)

### Phase 2 (Week 3-4): Stations SSP Section
1. ✅ Build Station Bank with filtering
2. ✅ Implement category-based navigation
3. ✅ Create Station Detail enhanced view
4. ✅ Add timer functionality
5. ✅ Implement Circuits feature
6. ✅ Build Performance analytics

### Phase 3 (Week 5-6): Guides & Cases
1. ✅ Build Guides launchpad and navigation
2. ✅ Implement step-by-step guide viewer
3. ✅ Create Case Bank with filters
4. ✅ Build Mock Exams feature
5. ✅ Add Case Performance tracking

### Phase 4 (Week 7-8): Fiches & User Features
1. ✅ Build unified Fiches Revision section
2. ✅ Implement bookmarks and favorites
3. ✅ Create user progress tracking
4. ✅ Build study calendar
5. ✅ Add spaced repetition logic

### Phase 5 (Week 9-10): Polish & Testing
1. ✅ Global search implementation
2. ✅ Notifications system
3. ✅ Performance optimization
4. ✅ Mobile responsiveness
5. ✅ User testing and feedback

---

## Success Metrics

### User Engagement
- Daily active users
- Average session duration
- Pages per session
- Return rate (weekly)

### Content Metrics
- Stations completed per user
- Guides consulted
- Cases attempted
- Fiches read

### Performance Metrics
- Average station score
- Improvement over time
- Completion rates
- Time to proficiency

### Feature Adoption
- Circuits created
- Bookmarks added
- Notes taken
- Mock exams attempted

---

## Key Differentiators from Geeky Medics

### Swiss-Specific Features
1. **Bilingual Support**: French/German content
2. **Swiss ECOS Format**: 13-minute stations
3. **Swiss Medical Schools**: UNIL, UNIGE, UniBE, etc.
4. **Swiss Healthcare System**: Content tailored to Swiss context
5. **ECOS Grid Generator**: Unique feature for Swiss exams

### Enhanced Features
1. **Integrated Images**: 1,023 medical images
2. **Comprehensive Content**: All content types in one platform
3. **Smart Organization**: 15 medical disciplines
4. **Detailed Scenarios**: Patient standardisé scripts
5. **Expert Information**: Teaching points and common pitfalls

---

**Next Steps**: Begin implementation with Phase 1 - Core Structure
