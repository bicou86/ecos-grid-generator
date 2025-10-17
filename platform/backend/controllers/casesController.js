/**
 * Cases Controller
 * Logique métier pour la gestion des cas cliniques
 */

const pool = require('../config/database');
const { AppError } = require('../utils/appError');

/**
 * GET /api/v1/cases
 * Récupère tous les cas (avec pagination et filtres)
 */
exports.getAllCases = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            specialty,
            difficulty,
            source,
            is_premium,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        // Construction de la requête avec filtres
        let query = `
            SELECT
                cc.id,
                cc.title,
                cc.slug,
                cc.setting,
                cc.patient_description,
                cc.difficulty_level,
                cc.estimated_time_minutes,
                cc.source,
                cc.is_premium,
                cc.view_count,
                cc.average_score,
                cat.name as category_name,
                cat.slug as category_slug,
                cat.color as category_color,
                ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as specialties,
                cc.created_at,
                cc.published_at
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            LEFT JOIN case_specialties cs ON cc.id = cs.case_id
            LEFT JOIN specialties s ON cs.specialty_id = s.id
            WHERE cc.is_published = true
        `;

        const params = [];
        let paramIndex = 1;

        // Filtres
        if (category) {
            query += ` AND cat.slug = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (specialty) {
            query += ` AND EXISTS (
                SELECT 1 FROM case_specialties cs2
                JOIN specialties s2 ON cs2.specialty_id = s2.id
                WHERE cs2.case_id = cc.id AND s2.slug = $${paramIndex}
            )`;
            params.push(specialty);
            paramIndex++;
        }

        if (difficulty) {
            query += ` AND cc.difficulty_level = $${paramIndex}`;
            params.push(difficulty);
            paramIndex++;
        }

        if (source) {
            query += ` AND cc.source = $${paramIndex}`;
            params.push(source);
            paramIndex++;
        }

        if (is_premium !== undefined) {
            query += ` AND cc.is_premium = $${paramIndex}`;
            params.push(is_premium === 'true');
            paramIndex++;
        }

        if (search) {
            query += ` AND (
                cc.search_vector @@ plainto_tsquery('french', $${paramIndex})
                OR cc.title ILIKE $${paramIndex + 1}
            )`;
            params.push(search, `%${search}%`);
            paramIndex += 2;
        }

        query += ` GROUP BY cc.id, cat.name, cat.slug, cat.color`;
        query += ` ORDER BY cc.published_at DESC`;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Exécuter la requête
        const result = await pool.query(query, params);

        // Compter le total
        let countQuery = `
            SELECT COUNT(DISTINCT cc.id) as total
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            WHERE cc.is_published = true
        `;

        const countParams = [];
        let countParamIndex = 1;

        if (category) {
            countQuery += ` AND cat.slug = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }

        if (specialty) {
            countQuery += ` AND EXISTS (
                SELECT 1 FROM case_specialties cs2
                JOIN specialties s2 ON cs2.specialty_id = s2.id
                WHERE cs2.case_id = cc.id AND s2.slug = $${countParamIndex}
            )`;
            countParams.push(specialty);
            countParamIndex++;
        }

        if (difficulty) {
            countQuery += ` AND cc.difficulty_level = $${countParamIndex}`;
            countParams.push(difficulty);
            countParamIndex++;
        }

        if (source) {
            countQuery += ` AND cc.source = $${countParamIndex}`;
            countParams.push(source);
            countParamIndex++;
        }

        if (is_premium !== undefined) {
            countQuery += ` AND cc.is_premium = $${countParamIndex}`;
            countParams.push(is_premium === 'true');
            countParamIndex++;
        }

        if (search) {
            countQuery += ` AND (
                cc.search_vector @@ plainto_tsquery('french', $${countParamIndex})
                OR cc.title ILIKE $${countParamIndex + 1}
            )`;
            countParams.push(search, `%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

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
        next(error);
    }
};

/**
 * GET /api/v1/cases/featured
 * Récupère les cas mis en avant
 */
exports.getFeaturedCases = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const query = `
            SELECT
                cc.id,
                cc.title,
                cc.slug,
                cc.difficulty_level,
                cc.estimated_time_minutes,
                cc.view_count,
                cc.average_score,
                cat.name as category_name,
                cat.color as category_color
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            WHERE cc.is_published = true
            ORDER BY cc.view_count DESC, cc.average_score DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/cases/search
 * Recherche full-text de cas
 */
exports.searchCases = async (req, res, next) => {
    try {
        const { q, limit = 20 } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: [],
                message: 'Recherche trop courte (minimum 2 caractères)'
            });
        }

        const query = `
            SELECT
                cc.id,
                cc.title,
                cc.slug,
                cc.patient_description,
                cat.name as category_name,
                ts_rank(cc.search_vector, plainto_tsquery('french', $1)) as rank
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            WHERE cc.is_published = true
                AND cc.search_vector @@ plainto_tsquery('french', $1)
            ORDER BY rank DESC
            LIMIT $2
        `;

        const result = await pool.query(query, [q, limit]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/cases/:id
 * Récupère un cas par ID (version publique limitée)
 */
exports.getCaseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT
                cc.id,
                cc.title,
                cc.slug,
                cc.setting,
                cc.patient_description,
                cc.vitals,
                cc.difficulty_level,
                cc.estimated_time_minutes,
                cc.source,
                cc.is_premium,
                cat.name as category_name,
                cat.slug as category_slug,
                ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as specialties
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            LEFT JOIN case_specialties cs ON cc.id = cs.case_id
            LEFT JOIN specialties s ON cs.specialty_id = s.id
            WHERE cc.id = $1 AND cc.is_published = true
            GROUP BY cc.id, cat.name, cat.slug
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            throw new AppError('Cas clinique non trouvé', 404);
        }

        const caseData = result.rows[0];

        // Si premium, ne pas afficher les détails complets
        if (caseData.is_premium && (!req.user || req.user.subscription_status !== 'active')) {
            delete caseData.anamnese_section;
            delete caseData.examen_section;
            delete caseData.management_section;
            delete caseData.cloture_section;
            delete caseData.annexes;
            caseData.premium_required = true;
        }

        res.json({
            success: true,
            data: caseData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/cases/:id/full
 * Récupère un cas complet (authentification requise)
 */
exports.getFullCase = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const query = `
            SELECT
                cc.*,
                cat.name as category_name,
                cat.slug as category_slug,
                cat.color as category_color,
                ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as specialties,
                ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
            FROM clinical_cases cc
            LEFT JOIN categories cat ON cc.category_id = cat.id
            LEFT JOIN case_specialties cs ON cc.id = cs.case_id
            LEFT JOIN specialties s ON cs.specialty_id = s.id
            LEFT JOIN case_tags ct ON cc.id = ct.case_id
            LEFT JOIN tags t ON ct.tag_id = t.id
            WHERE cc.id = $1 AND cc.is_published = true
            GROUP BY cc.id, cat.name, cat.slug, cat.color
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            throw new AppError('Cas clinique non trouvé', 404);
        }

        const caseData = result.rows[0];

        // Vérifier l'accès premium
        if (caseData.is_premium && user.subscription_status !== 'active') {
            throw new AppError('Abonnement premium requis pour accéder à ce cas', 403);
        }

        res.json({
            success: true,
            data: caseData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/cases/:id/view
 * Incrémente le compteur de vues
 */
exports.incrementViewCount = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            'UPDATE clinical_cases SET view_count = view_count + 1 WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Vue enregistrée'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/cases
 * Crée un nouveau cas (contributeur/admin)
 */
exports.createCase = async (req, res, next) => {
    try {
        const {
            title,
            category_id,
            setting,
            patient_description,
            vitals,
            anamnese_section,
            examen_section,
            management_section,
            cloture_section,
            annexes,
            images,
            difficulty_level,
            source,
            is_premium
        } = req.body;

        // Créer le slug
        const slug = title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const query = `
            INSERT INTO clinical_cases (
                title, slug, category_id, setting, patient_description,
                vitals, anamnese_section, examen_section, management_section,
                cloture_section, annexes, images, difficulty_level, source,
                is_premium, is_published, published_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;

        const result = await pool.query(query, [
            title, slug, category_id, setting, patient_description,
            JSON.stringify(vitals), JSON.stringify(anamnese_section),
            JSON.stringify(examen_section), JSON.stringify(management_section),
            JSON.stringify(cloture_section), JSON.stringify(annexes),
            JSON.stringify(images), difficulty_level, source,
            is_premium, true, new Date()
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Cas clinique créé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/cases/:id
 * Met à jour un cas existant (contributeur/admin)
 */
exports.updateCase = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Construction dynamique de la requête UPDATE
        const fields = Object.keys(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const query = `
            UPDATE clinical_cases
            SET ${setClause}
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, ...fields.map(field => {
            if (typeof updates[field] === 'object') {
                return JSON.stringify(updates[field]);
            }
            return updates[field];
        })];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new AppError('Cas clinique non trouvé', 404);
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Cas clinique mis à jour avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/cases/:id
 * Supprime un cas (admin uniquement)
 */
exports.deleteCase = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM clinical_cases WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            throw new AppError('Cas clinique non trouvé', 404);
        }

        res.json({
            success: true,
            message: 'Cas clinique supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/cases/:id/publish
 * Publie un cas
 */
exports.publishCase = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE clinical_cases
             SET is_published = true, published_at = $2
             WHERE id = $1`,
            [id, new Date()]
        );

        res.json({
            success: true,
            message: 'Cas publié avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/cases/:id/unpublish
 * Dépublie un cas
 */
exports.unpublishCase = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            'UPDATE clinical_cases SET is_published = false WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Cas dépublié avec succès'
        });
    } catch (error) {
        next(error);
    }
};
