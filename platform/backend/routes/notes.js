import express from 'express';
const router = express.Router();


// Get all notes for a fiche
router.get('/fiche/:ficheId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const ficheId = parseInt(req.params.ficheId);

    try {
        const result = await db.query(`
            SELECT * FROM user_fiche_notes
            WHERE user_id = $1 AND fiche_id = $2
            ORDER BY created_at DESC
        `, [userId, ficheId]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des notes'
        });
    }
});

// Get all user notes (across all fiches)
router.get('/', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;

    try {
        const result = await db.query(`
            SELECT
                ufn.*,
                f.title as fiche_title,
                f.slug as fiche_slug,
                f.fiche_type
            FROM user_fiche_notes ufn
            JOIN fiches f ON f.id = ufn.fiche_id
            WHERE ufn.user_id = $1
            ORDER BY ufn.updated_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching all notes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des notes'
        });
    }
});

// Create note
router.post('/fiche/:ficheId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const ficheId = parseInt(req.params.ficheId);
    const { note_text } = req.body;

    if (!note_text || note_text.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Le texte de la note est requis'
        });
    }

    try {
        const result = await db.query(`
            INSERT INTO user_fiche_notes (user_id, fiche_id, note_text)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [userId, ficheId, note_text.trim()]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la note'
        });
    }
});

// Update note
router.put('/:noteId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const noteId = parseInt(req.params.noteId);
    const { note_text } = req.body;

    if (!note_text || note_text.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Le texte de la note est requis'
        });
    }

    try {
        const result = await db.query(`
            UPDATE user_fiche_notes
            SET note_text = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `, [note_text.trim(), noteId, userId]);

        if (result.rows.length === 0) {
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
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la note'
        });
    }
});

// Delete note
router.delete('/:noteId', async (req, res) => {
    const { db } = req.app.locals;
    const userId = req.user.userId;
    const noteId = parseInt(req.params.noteId);

    try {
        const result = await db.query(`
            DELETE FROM user_fiche_notes
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [noteId, userId]);

        if (result.rows.length === 0) {
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
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la note'
        });
    }
});

export default router;
