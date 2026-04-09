const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const fc = require('../controllers/flashcardController');

router.use(auth); // sab routes protected hain

router.get('/public/library', fc.getPublicSets); // Must be before /:id
router.get('/',           fc.getSets);
router.post('/',          validate(schemas.createFlashcardSet), fc.createSet);
router.post('/generate',  validate(schemas.generateFlashcards), fc.generate);
router.get('/:id',        fc.getSet);
router.delete('/:id',     fc.deleteSet);
router.patch('/:id/cards/:cardId', validate(schemas.updateCard), fc.updateCard);
router.post('/:id/clone', fc.cloneSet);
router.patch('/:id/public', fc.togglePublic);

module.exports = router;
