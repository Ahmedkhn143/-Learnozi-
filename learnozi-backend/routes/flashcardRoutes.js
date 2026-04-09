const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const fc = require('../controllers/flashcardController');

router.use(auth); // sab routes protected hain

router.get('/',           fc.getSets);
router.post('/',          validate(schemas.createFlashcardSet), fc.createSet);
router.post('/generate',  validate(schemas.generateFlashcards), fc.generate);
router.get('/:id',        fc.getSet);
router.delete('/:id',     fc.deleteSet);
router.patch('/:id/cards/:cardId', validate(schemas.updateCard), fc.updateCard);

module.exports = router;
