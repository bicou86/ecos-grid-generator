/**
 * ECOS Platform - Simple Backend API
 * Functional server with database connection to PostgreSQL
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import navigationRoutes from './routes/navigation.js';
import bookmarksRoutes from './routes/bookmarks.js';
import notesRoutes from './routes/notes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ecos_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Database connected successfully');
    }
});

// Middleware
// Configure Helmet with relaxed CSP for development
app.use(helmet({
    contentSecurityPolicy: false,  // Disable CSP to allow frontend connections
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3002', 'http://127.0.0.1:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'ecos_platform_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Accès non autorisé - Token manquant'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Token invalide ou expiré'
            });
        }
        req.user = user; // Add user info to request
        next();
    });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================

// Register new user
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email et mot de passe requis'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Un compte avec cet email existe déjà'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id, email, first_name, last_name, created_at`,
            [email.toLowerCase(), hashedPassword, firstName || null, lastName || null]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    createdAt: user.created_at
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription'
        });
    }
});

// Login user
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email et mot de passe requis'
            });
        }

        // Find user
        const result = await pool.query(
            `SELECT id, email, password_hash, first_name, last_name, created_at
             FROM users WHERE email = $1`,
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    createdAt: user.created_at
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la connexion'
        });
    }
});

// Get current user info
app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, created_at, last_login
             FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at,
                lastLogin: user.last_login
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des données utilisateur'
        });
    }
});

// ============================================================
// USER BOOKMARKS ENDPOINTS
// ============================================================

// Get user's bookmarked fiches
app.get('/api/v1/user/bookmarks/fiches', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT f.*, ufb.created_at as bookmarked_at
             FROM fiches f
             JOIN user_fiche_bookmarks ufb ON f.id = ufb.fiche_id
             WHERE ufb.user_id = $1
             ORDER BY ufb.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des favoris'
        });
    }
});

// Add fiche to bookmarks
app.post('/api/v1/user/bookmarks/fiches/:ficheId', authenticateToken, async (req, res) => {
    try {
        const { ficheId } = req.params;

        // Check if already bookmarked
        const existing = await pool.query(
            'SELECT id FROM user_fiche_bookmarks WHERE user_id = $1 AND fiche_id = $2',
            [req.user.userId, ficheId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Cette fiche est déjà dans vos favoris'
            });
        }

        // Add bookmark
        await pool.query(
            `INSERT INTO user_fiche_bookmarks (user_id, fiche_id, created_at)
             VALUES ($1, $2, NOW())`,
            [req.user.userId, ficheId]
        );

        res.status(201).json({
            success: true,
            message: 'Fiche ajoutée aux favoris'
        });
    } catch (error) {
        console.error('Add bookmark error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout aux favoris'
        });
    }
});

// Remove fiche from bookmarks
app.delete('/api/v1/user/bookmarks/fiches/:ficheId', authenticateToken, async (req, res) => {
    try {
        const { ficheId } = req.params;

        const result = await pool.query(
            'DELETE FROM user_fiche_bookmarks WHERE user_id = $1 AND fiche_id = $2',
            [req.user.userId, ficheId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Favori non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Fiche retirée des favoris'
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du favori'
        });
    }
});

// ============================================================
// USER PROGRESS ENDPOINTS
// ============================================================

// Get user's fiche progress
app.get('/api/v1/user/progress/fiches', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT f.id, f.title, f.fiche_type, ufp.status, ufp.last_viewed, ufp.view_count
             FROM fiches f
             JOIN user_fiche_progress ufp ON f.id = ufp.fiche_id
             WHERE ufp.user_id = $1
             ORDER BY ufp.last_viewed DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la progression'
        });
    }
});

// Update fiche progress
app.post('/api/v1/user/progress/fiches/:ficheId', authenticateToken, async (req, res) => {
    try {
        const { ficheId } = req.params;
        const { status } = req.body; // 'not_started', 'in_progress', 'completed', 'mastered'

        // Upsert progress
        const result = await pool.query(
            `INSERT INTO user_fiche_progress (user_id, fiche_id, status, last_viewed, view_count)
             VALUES ($1, $2, $3, NOW(), 1)
             ON CONFLICT (user_id, fiche_id)
             DO UPDATE SET
                status = COALESCE($3, user_fiche_progress.status),
                last_viewed = NOW(),
                view_count = user_fiche_progress.view_count + 1
             RETURNING *`,
            [req.user.userId, ficheId, status || 'in_progress']
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la progression'
        });
    }
});

// Get progress statistics
app.get('/api/v1/user/progress/stats', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                COUNT(*) as total_viewed,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'mastered') as mastered,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
                SUM(view_count) as total_views
             FROM user_fiche_progress
             WHERE user_id = $1`,
            [req.user.userId]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get progress stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// ============================================================
// USER NOTES ENDPOINTS
// ============================================================

// Get notes for a fiche
app.get('/api/v1/fiches/:ficheId/notes', authenticateToken, async (req, res) => {
    try {
        const { ficheId } = req.params;

        const result = await pool.query(
            `SELECT id, note_text, created_at, updated_at
             FROM user_fiche_notes
             WHERE user_id = $1 AND fiche_id = $2
             ORDER BY created_at DESC`,
            [req.user.userId, ficheId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des notes'
        });
    }
});

// Add or update note for a fiche
app.post('/api/v1/fiches/:ficheId/notes', authenticateToken, async (req, res) => {
    try {
        const { ficheId } = req.params;
        const { noteText } = req.body;

        if (!noteText) {
            return res.status(400).json({
                success: false,
                error: 'Le texte de la note est requis'
            });
        }

        const result = await pool.query(
            `INSERT INTO user_fiche_notes (user_id, fiche_id, note_text, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING *`,
            [req.user.userId, ficheId, noteText]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout de la note'
        });
    }
});

// Update a note
app.put('/api/v1/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { noteText } = req.body;

        const result = await pool.query(
            `UPDATE user_fiche_notes
             SET note_text = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [noteText, noteId, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Note non trouvée'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la note'
        });
    }
});

// Delete a note
app.delete('/api/v1/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;

        const result = await pool.query(
            'DELETE FROM user_fiche_notes WHERE id = $1 AND user_id = $2',
            [noteId, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Note non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Note supprimée'
        });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la note'
        });
    }
});

// ============================================================
// FICHES ENDPOINTS
// ============================================================

// Get fiches statistics (must be before :identifier route)
app.get('/api/v1/fiches/stats', async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) as total_fiches,
                COUNT(*) FILTER (WHERE fiche_type = 'ssp') as ssp_count,
                COUNT(*) FILTER (WHERE fiche_type = 'skills') as skills_count,
                COUNT(*) FILTER (WHERE fiche_type = 'dx') as dx_count,
                COUNT(*) FILTER (WHERE is_urgent = true) as urgent_count,
                COUNT(DISTINCT discipline) as discipline_count,
                SUM(view_count) as total_views
            FROM fiches
            WHERE is_published = true
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching fiches stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// Get all fiches with pagination, filtering, search
app.get('/api/v1/fiches', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,        // 'ssp', 'skills', 'dx'
            discipline,
            search,
            urgent_only
        } = req.query;

        const offset = (page - 1) * limit;

        let query = `
            SELECT f.id, f.slug, f.title, f.fiche_type, f.subtitle,
                   f.description, f.discipline, f.frequency_rating,
                   f.is_urgent, f.view_count, f.created_at,
                   COUNT(DISTINCT ft.id) as tag_count,
                   COUNT(DISTINCT fs.id) as section_count
            FROM fiches f
            LEFT JOIN fiche_tags ft ON f.id = ft.fiche_id
            LEFT JOIN fiche_sections fs ON f.id = fs.fiche_id
            WHERE f.is_published = true
        `;
        const params = [];
        let paramIndex = 1;

        // Type filter
        if (type) {
            query += ` AND f.fiche_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Discipline filter
        if (discipline) {
            query += ` AND f.discipline ILIKE $${paramIndex}`;
            params.push(`%${discipline}%`);
            paramIndex++;
        }

        // Urgent only
        if (urgent_only === 'true') {
            query += ` AND f.is_urgent = true`;
        }

        // Search
        if (search) {
            query += ` AND (
                f.title ILIKE $${paramIndex} OR
                f.description ILIKE $${paramIndex} OR
                f.content_markdown ILIKE $${paramIndex}
            )`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` GROUP BY f.id`;

        // Count total for pagination (before ORDER BY)
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS subquery`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ORDER BY after counting
        query += ` ORDER BY f.frequency_rating DESC NULLS LAST, f.created_at DESC`;

        // Add pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching fiches:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des fiches'
        });
    }
});

// Get single fiche by slug or ID
app.get('/api/v1/fiches/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        const isNumeric = /^\d+$/.test(identifier);

        // Get fiche with all related data
        const ficheQuery = `
            SELECT f.*,
                   json_agg(DISTINCT jsonb_build_object(
                       'id', fs.id,
                       'type', fs.section_type,
                       'title', fs.title,
                       'content', fs.content,
                       'order', fs.display_order
                   )) FILTER (WHERE fs.id IS NOT NULL) as sections,
                   json_agg(DISTINCT ft.tag) FILTER (WHERE ft.tag IS NOT NULL) as tags
            FROM fiches f
            LEFT JOIN fiche_sections fs ON f.id = fs.fiche_id
            LEFT JOIN fiche_tags ft ON f.id = ft.fiche_id
            WHERE ${isNumeric ? 'f.id = $1' : 'f.slug = $1'}
              AND f.is_published = true
            GROUP BY f.id
        `;

        const result = await pool.query(ficheQuery, [identifier]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Fiche non trouvée'
            });
        }

        const fiche = result.rows[0];

        // Sort sections by display_order
        if (fiche.sections) {
            fiche.sections = fiche.sections.sort((a, b) => a.order - b.order);
        }

        // Increment view count
        await pool.query(
            'UPDATE fiches SET view_count = view_count + 1 WHERE id = $1',
            [fiche.id]
        );

        res.json({
            success: true,
            data: fiche
        });
    } catch (error) {
        console.error('Error fetching fiche:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la fiche'
        });
    }
});

// Get fiches by type (SSP, Skills, Dx)
app.get('/api/v1/fiches/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 50 } = req.query;

        const query = `
            SELECT f.id, f.slug, f.title, f.fiche_type, f.subtitle,
                   f.discipline, f.frequency_rating, f.is_urgent
            FROM fiches f
            WHERE f.fiche_type = $1 AND f.is_published = true
            ORDER BY f.frequency_rating DESC NULLS LAST, f.title ASC
            LIMIT $2
        `;

        const result = await pool.query(query, [type, parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching fiches by type:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des fiches'
        });
    }
});

// Get related fiches for a clinical case
app.get('/api/v1/cases/:caseId/fiches', async (req, res) => {
    try {
        const { caseId } = req.params;

        const query = `
            SELECT f.id, f.slug, f.title, f.fiche_type, f.subtitle,
                   f.discipline, f.frequency_rating, cf.relevance_score
            FROM case_fiches cf
            JOIN fiches f ON cf.fiche_id = f.id
            WHERE cf.case_id = $1 AND f.is_published = true
            ORDER BY cf.relevance_score DESC, f.frequency_rating DESC
        `;

        const result = await pool.query(query, [caseId]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching case fiches:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des fiches liées'
        });
    }
});

// Search fiches by tags
app.get('/api/v1/fiches/tags/:tag', async (req, res) => {
    try {
        const { tag } = req.params;
        const { limit = 20 } = req.query;

        const query = `
            SELECT DISTINCT f.id, f.slug, f.title, f.fiche_type,
                   f.subtitle, f.discipline, f.frequency_rating
            FROM fiches f
            JOIN fiche_tags ft ON f.id = ft.fiche_id
            WHERE ft.tag ILIKE $1 AND f.is_published = true
            ORDER BY f.frequency_rating DESC NULLS LAST
            LIMIT $2
        `;

        const result = await pool.query(query, [`%${tag}%`, parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error searching fiches by tag:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la recherche par tag'
        });
    }
});

// ============================================================
// IMAGES ENDPOINTS
// ============================================================

// Get images for a specific case
app.get('/api/v1/cases/:identifier/images', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try to find case by ID (UUID) or slug
        const caseQuery = `
            SELECT id FROM clinical_cases
            WHERE id::text = $1 OR slug = $1
            LIMIT 1
        `;

        const caseResult = await pool.query(caseQuery, [identifier]);

        if (caseResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Cas clinique non trouvé'
            });
        }

        const caseId = caseResult.rows[0].id;

        // Get images for this case
        const imagesResult = await pool.query(
            `SELECT id, filename, title, description, image_order
             FROM case_images
             WHERE case_id = $1
             ORDER BY image_order ASC, id ASC`,
            [caseId]
        );

        res.json({
            success: true,
            data: imagesResult.rows,
            count: imagesResult.rows.length
        });
    } catch (error) {
        console.error('Get case images error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des images'
        });
    }
});

// Get images for a specific fiche
app.get('/api/v1/fiches/:identifier/images', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try to find fiche by ID or slug
        const ficheQuery = `
            SELECT id FROM fiches
            WHERE id::text = $1 OR slug = $1
            LIMIT 1
        `;

        const ficheResult = await pool.query(ficheQuery, [identifier]);

        if (ficheResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Fiche non trouvée'
            });
        }

        const ficheId = ficheResult.rows[0].id;

        // Get images for this fiche
        const imagesResult = await pool.query(
            `SELECT id, filename, title, description, image_order
             FROM fiche_images
             WHERE fiche_id = $1
             ORDER BY image_order ASC, id ASC`,
            [ficheId]
        );

        res.json({
            success: true,
            data: imagesResult.rows,
            count: imagesResult.rows.length
        });
    } catch (error) {
        console.error('Get fiche images error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des images'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ECOS Platform API',
        version: 'v1',
        endpoints: {
            health: '/health',
            cases: '/api/v1/cases',
            case: '/api/v1/cases/:id',
            categories: '/api/v1/categories',
            specialties: '/api/v1/specialties',
            stats: '/api/v1/stats'
        },
        status: 'online'
    });
});

// Get all cases with pagination and filtering
app.get('/api/v1/cases', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            difficulty,
            specialty,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        // Build query dynamically
        let query = `
            SELECT
                cc.id, cc.title, cc.slug, cc.setting, cc.patient_description,
                cc.difficulty_level, cc.source, cc.created_at, cc.view_count,
                c.name as category_name, c.slug as category_slug
            FROM clinical_cases cc
            LEFT JOIN categories c ON cc.category_id = c.id
            WHERE cc.is_published = true
        `;

        const params = [];
        let paramIndex = 1;

        // Add filters
        if (category) {
            query += ` AND c.slug = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (difficulty) {
            query += ` AND cc.difficulty_level = $${paramIndex}`;
            params.push(difficulty);
            paramIndex++;
        }

        if (search) {
            query += ` AND (cc.title ILIKE $${paramIndex} OR cc.patient_description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Count total for pagination
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Add ordering and pagination
        query += ` ORDER BY cc.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching cases:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des cas'
        });
    }
});

// Get single case by ID or slug
app.get('/api/v1/cases/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Check if identifier is UUID or slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        const query = `
            SELECT
                cc.*,
                c.name as category_name, c.slug as category_slug,
                c.description as category_description
            FROM clinical_cases cc
            LEFT JOIN categories c ON cc.category_id = c.id
            WHERE ${isUUID ? 'cc.id' : 'cc.slug'} = $1 AND cc.is_published = true
        `;

        const result = await pool.query(query, [identifier]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Cas clinique non trouvé'
            });
        }

        // Increment view count
        await pool.query(
            'UPDATE clinical_cases SET view_count = view_count + 1 WHERE id = $1',
            [result.rows[0].id]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching case:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du cas'
        });
    }
});

// Get all categories
app.get('/api/v1/categories', async (req, res) => {
    try {
        const query = `
            SELECT
                c.id, c.name, c.slug, c.description, c.icon, c.color,
                COUNT(cc.id) as case_count
            FROM categories c
            LEFT JOIN clinical_cases cc ON c.id = cc.category_id AND cc.is_published = true
            WHERE c.is_active = true
            GROUP BY c.id
            ORDER BY c.display_order, c.name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des catégories'
        });
    }
});

// Get all specialties
app.get('/api/v1/specialties', async (req, res) => {
    try {
        const query = `
            SELECT
                s.id, s.name, s.slug, s.description,
                COUNT(DISTINCT cs.case_id) as case_count
            FROM specialties s
            LEFT JOIN case_specialties cs ON s.id = cs.specialty_id
            LEFT JOIN clinical_cases cc ON cs.case_id = cc.id AND cc.is_published = true
            GROUP BY s.id
            ORDER BY s.name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des spécialités'
        });
    }
});

// Get platform statistics
app.get('/api/v1/stats', async (req, res) => {
    try {
        const queries = await Promise.all([
            pool.query('SELECT COUNT(*) as total_cases FROM clinical_cases WHERE is_published = true'),
            pool.query('SELECT COUNT(*) as total_categories FROM categories'),
            pool.query('SELECT COUNT(*) as total_specialties FROM specialties'),
            pool.query(`
                SELECT
                    difficulty_level,
                    COUNT(*) as count
                FROM clinical_cases
                WHERE is_published = true
                GROUP BY difficulty_level
            `)
        ]);

        const difficultyBreakdown = queries[3].rows.reduce((acc, row) => {
            acc[row.difficulty_level] = parseInt(row.count);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                totalCases: parseInt(queries[0].rows[0].total_cases),
                totalCategories: parseInt(queries[1].rows[0].total_categories),
                totalSpecialties: parseInt(queries[2].rows[0].total_specialties),
                difficultyBreakdown
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// ============================================================================
// NAVIGATION ROUTES (Categories, Circuits, Study Sessions)
// ============================================================================
app.use('/api/v1', navigationRoutes(pool, authenticateToken, optionalAuth));

// ============================================================================
// BOOKMARKS AND NOTES ROUTES (with authentication middleware)
// ============================================================================
app.use('/api/v1/bookmarks', authenticateToken, bookmarksRoutes);
app.use('/api/v1/notes', authenticateToken, notesRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ECOS Platform API Server`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`📚 API: http://localhost:${PORT}/api/v1`);
    console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    server.close(() => {
        pool.end();
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing server');
    server.close(() => {
        pool.end();
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
