/**
 * ECOS Platform - Backend API with Authentication
 * Enhanced server with JWT authentication
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pkg from 'pg';
const { Pool } = pkg;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

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
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// ======================
// AUTH MIDDLEWARE
// ======================

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token d\'authentification manquant'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, subscription_status, created_at FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Token invalide ou expiré'
        });
    }
};

// ======================
// AUTHENTICATION ENDPOINTS
// ======================

// Register new user
app.post('/api/v1/auth/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('firstName').trim().notEmpty(),
        body('lastName').trim().notEmpty(),
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: errors.array()
                });
            }

            const { email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
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
                `INSERT INTO users (email, password_hash, first_name, last_name, subscription_status)
                 VALUES ($1, $2, $3, $4, 'free', 'inactive')
                 RETURNING id, email, first_name, last_name, subscription_status, subscription_type, created_at`,
                [email, hashedPassword, firstName, lastName]
            );

            const user = result.rows[0];

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(201).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        isPremium: user.subscription_status,
                        createdAt: user.created_at
                    }
                }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création du compte'
            });
        }
    }
);

// Login user
app.post('/api/v1/auth/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: errors.array()
                });
            }

            const { email, password } = req.body;

            // Get user
            const result = await pool.query(
                'SELECT id, email, password_hash, first_name, last_name, subscription_status, created_at FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect'
                });
            }

            const user = result.rows[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect'
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        isPremium: user.subscription_status,
                        createdAt: user.created_at
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la connexion'
            });
        }
    }
);

// Get current user (protected route)
app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.first_name,
            lastName: req.user.last_name,
            isPremium: req.user.subscription_status,
            createdAt: req.user.created_at
        }
    });
});

// ======================
// HEALTH & ROOT ENDPOINTS
// ======================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        auth: 'enabled'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'ECOS Platform API with Authentication',
        version: 'v1',
        endpoints: {
            health: '/health',
            register: 'POST /api/v1/auth/register',
            login: 'POST /api/v1/auth/login',
            me: 'GET /api/v1/auth/me (protected)',
            cases: '/api/v1/cases',
            categories: '/api/v1/categories',
            specialties: '/api/v1/specialties',
            stats: '/api/v1/stats'
        },
        status: 'online'
    });
});

// ======================
// CASES ENDPOINTS (from server-simple.js)
// ======================

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

        const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

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

app.get('/api/v1/cases/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
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

// ======================
// USER PROGRESS ENDPOINTS (Protected)
// ======================

app.get('/api/v1/user/progress', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                up.case_id,
                cc.title,
                cc.slug,
                up.score,
                up.completed_at,
                up.time_spent,
                c.name as category_name
            FROM user_progress up
            JOIN clinical_cases cc ON up.case_id = cc.id
            LEFT JOIN categories c ON cc.category_id = c.id
            WHERE up.user_id = $1
            ORDER BY up.completed_at DESC
            LIMIT 50`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du progrès'
        });
    }
});

app.post('/api/v1/progress/:caseId', authMiddleware, async (req, res) => {
    try {
        const { caseId } = req.params;
        const { score, timeSpent } = req.body;

        // Upsert progress
        const result = await pool.query(
            `INSERT INTO user_progress (user_id, case_id, score, time_spent, completed_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id, case_id)
             DO UPDATE SET
                score = $3,
                time_spent = $4,
                completed_at = NOW(),
                attempts = user_progress.attempts + 1
             RETURNING *`,
            [req.user.id, caseId, score, timeSpent]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour du progrès'
        });
    }
});

// ======================
// ERROR HANDLERS
// ======================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.path
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne'
    });
});

// ======================
// START SERVER
// ======================

const server = app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ECOS Platform API Server with Authentication`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`📚 API: http://localhost:${PORT}/api/v1`);
    console.log(`🔐 Auth: Enabled (JWT)`);
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
