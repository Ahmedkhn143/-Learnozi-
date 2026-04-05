const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fc = require('../controllers/flashcardController');

router.use(auth); // sab routes protected hain

router.get('/',           fc.getSets);
router.post('/',          fc.createSet);
router.post('/generate',  fc.generate);
router.get('/:id',        fc.getSet);
router.delete('/:id',     fc.deleteSet);
router.patch('/:id/cards/:cardId', fc.updateCard);

module.exports = router;
