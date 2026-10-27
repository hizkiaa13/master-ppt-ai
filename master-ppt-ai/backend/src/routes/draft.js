const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
  resumeDraft,
} = require('../controllers/draftController');

// All routes require authentication
router.use(authMiddleware);

router.post('/', createDraft);           // Create new draft
router.get('/', getDrafts);             // Get all drafts for user
router.get('/:id', getDraftById);       // Get single draft with full data
router.put('/:id', updateDraft);        // Update draft
router.delete('/:id', deleteDraft);     // Delete draft
router.post('/:id/resume', resumeDraft);// Resume draft

module.exports = router;
