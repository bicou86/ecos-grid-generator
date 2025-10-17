import express from 'express';
const router = express.Router();

// Note: authenticateToken middleware is passed from server-simple.js
// Get all user bookmarks
router.get('/', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;

    try {
        const result = await db.query(`
            SELECT
                ufb.*,
                f.id as fiche_id,
                f.slug,
                f.title,
                f.subtitle,
                f.fiche_type,
                f.discipline,
                f.frequency_rating
            FROM user_fiche_bookmarks ufb
            JOIN fiches f ON f.id = ufb.fiche_id
            WHERE ufb.user_id = $1
            ORDER BY ufb.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des favoris'
        });
    }
});

// Add bookmark
router.post('/:ficheId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const ficheId = parseInt(req.params.ficheId);
    const { notes } = req.body;

    try {
        const result = await db.query(`
            INSERT INTO user_fiche_bookmarks (user_id, fiche_id, notes)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, fiche_id)
            DO UPDATE SET notes = EXCLUDED.notes
            RETURNING *
        `, [userId, ficheId, notes || null]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout du favori'
        });
    }
});

// Delete bookmark
router.delete('/:ficheId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const ficheId = parseInt(req.params.ficheId);

    try {
        await db.query(`
            DELETE FROM user_fiche_bookmarks
            WHERE user_id = $1 AND fiche_id = $2
        `, [userId, ficheId]);

        res.json({
            success: true,
            message: 'Favori supprimé'
        });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du favori'
        });
    }
});

// Check if fiche is bookmarked
router.get('/check/:ficheId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const ficheId = parseInt(req.params.ficheId);

    try {
        const result = await db.query(`
            SELECT * FROM user_fiche_bookmarks
            WHERE user_id = $1 AND fiche_id = $2
        `, [userId, ficheId]);

        res.json({
            success: true,
            isBookmarked: result.rows.length > 0,
            data: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error checking bookmark:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification du favori'
        });
    }
});

export default router;
