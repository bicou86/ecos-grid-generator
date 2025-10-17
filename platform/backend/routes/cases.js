/**
 * Cases Routes
 * Routes pour la gestion des cas cliniques
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateCase } = require('../middleware/validation');
const casesController = require('../controllers/casesController');

// Routes publiques (accès gratuit limité)
router.get('/', casesController.getAllCases);
router.get('/featured', casesController.getFeaturedCases);
router.get('/search', casesController.searchCases);
router.get('/:id', casesController.getCaseById);

// Routes protégées (nécessite authentification)
router.get('/:id/full', authenticate, casesController.getFullCase);
router.post('/:id/view', authenticate, casesController.incrementViewCount);

// Routes pour les contributeurs (ajout/modification de cas)
router.post('/', authenticate, authorize(['contributor', 'admin']), validateCase, casesController.createCase);
router.put('/:id', authenticate, authorize(['contributor', 'admin']), validateCase, casesController.updateCase);
router.delete('/:id', authenticate, authorize(['admin']), casesController.deleteCase);

// Routes d'administration
router.patch('/:id/publish', authenticate, authorize(['admin']), casesController.publishCase);
router.patch('/:id/unpublish', authenticate, authorize(['admin']), casesController.unpublishCase);

module.exports = router;
