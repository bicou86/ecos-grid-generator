# ECOS Platform API Documentation

## 🚀 Server Information

**Base URL**: `http://localhost:3000`
**API Version**: `v1`
**API Base**: `http://localhost:3000/api/v1`

## 📊 Database Statistics

- **Total Cases**: 674 clinical cases
- **Categories**: 8 (AMBOSS, RESCOS, German, USMLE, Thieme, Vignettes, USMLE Triage, AMBOSS-ChatGPT)
- **Specialties**: 15 medical specialties
- **Difficulty Levels**:
  - Beginner: 11 cases
  - Intermediate: 425 cases
  - Advanced: 238 cases

## 📝 API Endpoints

### Health Check

```bash
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T08:30:20.298Z",
  "uptime": 72.417681433,
  "database": "connected"
}
```

### Platform Statistics

```bash
GET /api/v1/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCases": 674,
    "totalCategories": 8,
    "totalSpecialties": 15,
    "difficultyBreakdown": {
      "beginner": 11,
      "intermediate": 425,
      "advanced": 238
    }
  }
}
```

### List All Categories

```bash
GET /api/v1/categories
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "4292caef-810c-4992-9ad9-ce608097e805",
      "name": "AMBOSS",
      "slug": "amboss",
      "description": "Cas cliniques de la plateforme AMBOSS",
      "icon": null,
      "color": "#667eea",
      "case_count": "40"
    }
  ]
}
```

### List All Specialties

```bash
GET /api/v1/specialties
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "4b1dc609-e613-41ee-b664-d6b3b996ce34",
      "name": "Cardiologie",
      "slug": "cardiologie",
      "description": "Pathologies cardiovasculaires",
      "case_count": "368"
    }
  ]
}
```

### List Clinical Cases

```bash
GET /api/v1/cases
```

**Query Parameters**:
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page (max: 100)
- `category` - Filter by category slug (e.g., "amboss", "rescos")
- `difficulty` - Filter by difficulty ("beginner", "intermediate", "advanced")
- `specialty` - Filter by specialty slug
- `search` - Search in title and patient description

**Examples**:
```bash
# Get first page with 20 cases
GET /api/v1/cases

# Get AMBOSS cases only
GET /api/v1/cases?category=amboss

# Get advanced difficulty cases
GET /api/v1/cases?difficulty=advanced

# Search for "douleur thoracique"
GET /api/v1/cases?search=douleur+thoracique

# Pagination - page 2 with 50 items
GET /api/v1/cases?page=2&limit=50
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "d0e28d5b-4a58-4571-a79d-db68e77c2e33",
      "title": "AMBOSS-13 - Douleur thoracique - Homme 35 ans",
      "slug": "amboss-13-douleur-thoracique-homme-35-ans",
      "setting": "Service d'urgences",
      "patient_description": "Anthony Price, homme de 35 ans, consultant aux urgences pour douleur thoracique",
      "difficulty_level": "advanced",
      "source": "AMBOSS",
      "created_at": "2025-10-14T06:24:20.332Z",
      "view_count": 0,
      "category_name": "AMBOSS",
      "category_slug": "amboss"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 674,
    "totalPages": 34
  }
}
```

### Get Single Clinical Case

```bash
GET /api/v1/cases/:identifier
```

**Parameters**:
- `identifier` - Case ID (UUID) or slug

**Examples**:
```bash
# By slug
GET /api/v1/cases/amboss-13-douleur-thoracique-homme-35-ans

# By UUID
GET /api/v1/cases/d0e28d5b-4a58-4571-a79d-db68e77c2e33
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "d0e28d5b-4a58-4571-a79d-db68e77c2e33",
    "title": "AMBOSS-13 - Douleur thoracique - Homme 35 ans",
    "slug": "amboss-13-douleur-thoracique-homme-35-ans",
    "category_id": "4292caef-810c-4992-9ad9-ce608097e805",
    "setting": "Service d'urgences",
    "patient_description": "Anthony Price, homme de 35 ans, consultant aux urgences pour douleur thoracique",
    "vitals": {
      "fc": "105 bpm",
      "fr": "24/min",
      "ta": "135/80 mmHg",
      "imc": "19.4 kg/m²",
      "temperature": "37°C"
    },
    "anamnese_section": { ... },
    "examen_section": { ... },
    "management_section": { ... },
    "cloture_section": { ... },
    "annexes": { ... },
    "images": [],
    "difficulty_level": "advanced",
    "source": "AMBOSS",
    "original_file_path": "...",
    "is_published": true,
    "is_premium": false,
    "view_count": 1,
    "average_score": null,
    "created_at": "2025-10-14T06:24:20.332Z",
    "updated_at": "2025-10-14T06:24:20.332Z",
    "published_at": "2025-10-14T06:24:20.332Z",
    "search_vector": null,
    "category_name": "AMBOSS",
    "category_slug": "amboss",
    "category_description": "Cas cliniques de la plateforme AMBOSS"
  }
}
```

**Note**: View count is automatically incremented when accessing a case.

## 🔧 Error Responses

### 404 Not Found
```json
{
  "success": false,
  "error": "Cas clinique non trouvé"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Erreur serveur interne"
}
```

## 🚦 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get statistics
curl http://localhost:3000/api/v1/stats

# List categories
curl http://localhost:3000/api/v1/categories

# List specialties
curl http://localhost:3000/api/v1/specialties

# List cases
curl "http://localhost:3000/api/v1/cases?limit=5"

# Get specific case
curl http://localhost:3000/api/v1/cases/amboss-13-douleur-thoracique-homme-35-ans

# Filter by category
curl "http://localhost:3000/api/v1/cases?category=amboss&limit=3"

# Search cases
curl "http://localhost:3000/api/v1/cases?search=douleur&limit=3"
```

### Using JavaScript (fetch)

```javascript
// Get all cases
const response = await fetch('http://localhost:3000/api/v1/cases');
const { success, data, pagination } = await response.json();

// Get single case
const caseResponse = await fetch('http://localhost:3000/api/v1/cases/amboss-13-douleur-thoracique-homme-35-ans');
const { success, data: clinicalCase } = await caseResponse.json();

// Filter by category
const ambossResponse = await fetch('http://localhost:3000/api/v1/cases?category=amboss&limit=10');
const { data: ambossCases } = await ambossResponse.json();
```

### Using Python (requests)

```python
import requests

# Get statistics
response = requests.get('http://localhost:3000/api/v1/stats')
stats = response.json()

# List cases with filtering
params = {
    'category': 'amboss',
    'difficulty': 'advanced',
    'limit': 10
}
response = requests.get('http://localhost:3000/api/v1/cases', params=params)
cases = response.json()
```

## 🗄️ Database Schema

### Tables
- **clinical_cases** - Main case storage with JSONB sections
- **categories** - Case categories (8)
- **specialties** - Medical specialties (15)
- **case_specialties** - Many-to-many relationship
- **tags** - Case tags
- **case_tags** - Many-to-many relationship

### Key Fields
- All timestamps in ISO 8601 format
- UUIDs for primary keys
- JSONB for flexible clinical data storage
- Full-text search support via `search_vector`

## 🔐 Security

- **CORS** enabled for cross-origin requests
- **Helmet.js** for security headers
- **Rate limiting** not yet enabled (to be added)
- **Authentication** not yet implemented (future feature)

## 🚀 Starting the Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the server
DB_HOST=localhost DB_PASSWORD=ecos_secure_password_2025 npm start

# Server will run on http://localhost:3000
```

## 📦 Dependencies

- **express** ^4.18.2 - Web framework
- **pg** ^8.11.3 - PostgreSQL client
- **cors** ^2.8.5 - CORS middleware
- **helmet** ^7.1.0 - Security headers
- **dotenv** ^16.3.1 - Environment variables

## 🔮 Future Enhancements

- [ ] User authentication (JWT)
- [ ] User progress tracking
- [ ] Payment integration (Stripe)
- [ ] PDF generation endpoint
- [ ] Case search with full-text search
- [ ] User favorites/bookmarks
- [ ] Performance analytics
- [ ] Rate limiting
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation

## 📊 Database Connection

**Host**: localhost
**Port**: 5432
**Database**: ecos_platform
**User**: postgres
**Password**: ecos_secure_password_2025

## 📝 Notes

- The server uses ES modules (`"type": "module"` in package.json)
- All responses follow a consistent format with `success` and `data`/`error` fields
- Pagination is included in list endpoints
- View counts are tracked automatically
- Cases can be accessed by slug (SEO-friendly) or UUID
