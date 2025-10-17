/**
 * Navigation API Routes
 * Endpoints for categories, circuits, and enhanced navigation features
 */

import express from 'express';
const router = express.Router();

export default function(pool, authenticateToken, optionalAuth) {

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * GET /api/v1/fiche-categories
 * Get all fiche categories with fiche counts
 */
router.get('/fiche-categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.id,
                c.name,
                c.name_de,
                c.icon,
                c.color,
                c.description,
                c.display_order,
                c.parent_id,
                COUNT(fcm.fiche_id) as fiche_count
            FROM fiche_categories c
            LEFT JOIN fiche_category_mapping fcm ON c.id = fcm.category_id
            GROUP BY c.id, c.name, c.name_de, c.icon, c.color, c.description, c.display_order, c.parent_id
            ORDER BY c.display_order
        `);

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

/**
 * GET /api/v1/fiche-categories/:id
 * Get category details with all fiches
 */
router.get('/fiche-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get category info
        const categoryResult = await pool.query(
            'SELECT * FROM fiche_categories WHERE id = $1',
            [id]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Catégorie non trouvée'
            });
        }

        // Get fiches in category
        const fichesResult = await pool.query(`
            SELECT
                f.id,
                f.slug,
                f.title,
                f.fiche_type,
                f.subtitle,
                f.discipline,
                f.difficulty_level,
                f.estimated_duration,
                f.frequency_rating,
                f.is_urgent,
                f.times_viewed,
                f.created_at
            FROM fiches f
            INNER JOIN fiche_category_mapping fcm ON f.id = fcm.fiche_id
            WHERE fcm.category_id = $1
            ORDER BY f.frequency_rating DESC NULLS LAST, f.times_viewed DESC
            LIMIT $2 OFFSET $3
        `, [id, limit, offset]);

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM fiche_category_mapping WHERE category_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                category: categoryResult.rows[0],
                fiches: fichesResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(countResult.rows[0].count),
                    pages: Math.ceil(countResult.rows[0].count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la catégorie'
        });
    }
});

// ============================================================================
// CIRCUITS
// ============================================================================

/**
 * GET /api/v1/circuits
 * Get all circuits (public + user's private circuits)
 */
router.get('/circuits', optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type = 'all' } = req.query; // 'all', 'predefined', 'public', 'mine'

        let query = `
            SELECT
                c.*,
                u.email as creator_email,
                COUNT(cf.fiche_id) as fiche_count
            FROM circuits c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN circuit_fiches cf ON c.id = cf.circuit_id
            WHERE 1=1
        `;
        const params = [];

        if (type === 'predefined') {
            query += ' AND c.is_predefined = true';
        } else if (type === 'public') {
            query += ' AND c.is_public = true';
        } else if (type === 'mine' && userId) {
            query += ' AND c.user_id = $1';
            params.push(userId);
        } else if (type === 'all') {
            if (userId) {
                query += ' AND (c.is_public = true OR c.user_id = $1 OR c.is_predefined = true)';
                params.push(userId);
            } else {
                query += ' AND (c.is_public = true OR c.is_predefined = true)';
            }
        }

        query += ' GROUP BY c.id, u.email ORDER BY c.is_predefined DESC, c.times_used DESC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching circuits:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des circuits'
        });
    }
});

/**
 * GET /api/v1/circuits/:id
 * Get circuit details with all fiches
 */
router.get('/circuits/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Get circuit info
        const circuitResult = await pool.query(`
            SELECT
                c.*,
                u.email as creator_email
            FROM circuits c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = $1 AND (c.is_public = true OR c.is_predefined = true OR c.user_id = $2)
        `, [id, userId]);

        if (circuitResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Circuit non trouvé ou accès non autorisé'
            });
        }

        // Get fiches in circuit
        const fichesResult = await pool.query(`
            SELECT
                f.id,
                f.slug,
                f.title,
                f.fiche_type,
                f.subtitle,
                f.discipline,
                f.difficulty_level,
                f.estimated_duration,
                f.frequency_rating,
                cf.display_order,
                cf.notes as circuit_notes
            FROM circuit_fiches cf
            INNER JOIN fiches f ON cf.fiche_id = f.id
            WHERE cf.circuit_id = $1
            ORDER BY cf.display_order
        `, [id]);

        res.json({
            success: true,
            data: {
                circuit: circuitResult.rows[0],
                fiches: fichesResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching circuit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du circuit'
        });
    }
});

/**
 * POST /api/v1/circuits
 * Create a new circuit
 */
router.post('/circuits', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, is_public, difficulty_level, fiche_ids } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Le titre est obligatoire'
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Create circuit
            const circuitResult = await client.query(`
                INSERT INTO circuits (user_id, title, description, is_public, is_predefined, difficulty_level)
                VALUES ($1, $2, $3, $4, false, $5)
                RETURNING *
            `, [userId, title, description, is_public || false, difficulty_level]);

            const circuit = circuitResult.rows[0];

            // Add fiches if provided
            if (fiche_ids && Array.isArray(fiche_ids) && fiche_ids.length > 0) {
                const values = fiche_ids.map((ficheId, index) =>
                    `('${circuit.id}', ${ficheId}, ${index}, '')`
                ).join(',');

                await client.query(`
                    INSERT INTO circuit_fiches (circuit_id, fiche_id, display_order, notes)
                    VALUES ${values}
                `);

                // Calculate total duration
                const durationResult = await client.query(`
                    SELECT SUM(f.estimated_duration) as total
                    FROM fiches f
                    WHERE f.id = ANY($1)
                `, [fiche_ids]);

                const totalDuration = durationResult.rows[0].total;

                await client.query(
                    'UPDATE circuits SET total_duration = $1 WHERE id = $2',
                    [totalDuration, circuit.id]
                );

                circuit.total_duration = totalDuration;
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                data: circuit
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating circuit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création du circuit'
        });
    }
});

/**
 * PUT /api/v1/circuits/:id
 * Update a circuit
 */
router.put('/circuits/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, is_public, difficulty_level, fiche_ids } = req.body;

        // Check ownership
        const ownershipResult = await pool.query(
            'SELECT * FROM circuits WHERE id = $1 AND user_id = $2 AND is_predefined = false',
            [id, userId]
        );

        if (ownershipResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Accès non autorisé ou circuit système'
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Update circuit details
            await client.query(`
                UPDATE circuits
                SET title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    is_public = COALESCE($3, is_public),
                    difficulty_level = COALESCE($4, difficulty_level),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5
            `, [title, description, is_public, difficulty_level, id]);

            // Update fiches if provided
            if (fiche_ids && Array.isArray(fiche_ids)) {
                // Delete existing mappings
                await client.query('DELETE FROM circuit_fiches WHERE circuit_id = $1', [id]);

                // Add new mappings
                if (fiche_ids.length > 0) {
                    const values = fiche_ids.map((ficheId, index) =>
                        `('${id}', ${ficheId}, ${index}, '')`
                    ).join(',');

                    await client.query(`
                        INSERT INTO circuit_fiches (circuit_id, fiche_id, display_order, notes)
                        VALUES ${values}
                    `);

                    // Update total duration
                    const durationResult = await client.query(`
                        SELECT SUM(f.estimated_duration) as total
                        FROM fiches f
                        WHERE f.id = ANY($1)
                    `, [fiche_ids]);

                    await client.query(
                        'UPDATE circuits SET total_duration = $1 WHERE id = $2',
                        [durationResult.rows[0].total, id]
                    );
                }
            }

            await client.query('COMMIT');

            // Fetch updated circuit
            const result = await pool.query('SELECT * FROM circuits WHERE id = $1', [id]);

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating circuit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour du circuit'
        });
    }
});

/**
 * DELETE /api/v1/circuits/:id
 * Delete a circuit
 */
router.delete('/circuits/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM circuits WHERE id = $1 AND user_id = $2 AND is_predefined = false RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Circuit non trouvé ou accès non autorisé'
            });
        }

        res.json({
            success: true,
            message: 'Circuit supprimé avec succès'
        });
    } catch (error) {
        console.error('Error deleting circuit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du circuit'
        });
    }
});

/**
 * POST /api/v1/circuits/:id/increment-usage
 * Increment times_used counter
 */
router.post('/circuits/:id/increment-usage', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'UPDATE circuits SET times_used = times_used + 1 WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Compteur incrémenté'
        });
    } catch (error) {
        console.error('Error incrementing usage:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour'
        });
    }
});

// ============================================================================
// STUDY SESSIONS
// ============================================================================

/**
 * POST /api/v1/study-sessions/start
 * Start a new study session
 */
router.post('/study-sessions/start', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fiche_id, circuit_id, session_type } = req.body;

        const result = await pool.query(`
            INSERT INTO study_sessions (user_id, fiche_id, circuit_id, session_type, started_at, completed)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)
            RETURNING *
        `, [userId, fiche_id, circuit_id, session_type]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error starting study session:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du démarrage de la session'
        });
    }
});

/**
 * PUT /api/v1/study-sessions/:id/end
 * End a study session
 */
router.put('/study-sessions/:id/end', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { score, notes } = req.body;

        const result = await pool.query(`
            UPDATE study_sessions
            SET ended_at = CURRENT_TIMESTAMP,
                time_spent = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER,
                score = $1,
                notes = $2,
                completed = true
            WHERE id = $3 AND user_id = $4
            RETURNING *
        `, [score, notes, id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session non trouvée'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error ending study session:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la fin de session'
        });
    }
});

/**
 * GET /api/v1/user/study-sessions
 * Get user's study sessions history
 */
router.get('/user/study-sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT
                ss.*,
                f.title as fiche_title,
                f.slug as fiche_slug,
                c.title as circuit_title
            FROM study_sessions ss
            LEFT JOIN fiches f ON ss.fiche_id = f.id
            LEFT JOIN circuits c ON ss.circuit_id = c.id
            WHERE ss.user_id = $1
            ORDER BY ss.started_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM study_sessions WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching study sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des sessions'
        });
    }
});

// ============================================================================
// USER STATISTICS
// ============================================================================

/**
 * GET /api/v1/user/statistics
 * Get comprehensive user statistics
 */
router.get('/user/statistics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT * FROM v_user_fiche_statistics WHERE user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    total_fiches_viewed: 0,
                    fiches_completed: 0,
                    fiches_bookmarked: 0,
                    total_time_spent_seconds: 0,
                    avg_score: null,
                    total_study_sessions: 0,
                    circuits_created: 0
                }
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

return router;
}
