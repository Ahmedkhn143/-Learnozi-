const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fc = require('../controllers/focusController');

router.use(auth);
router.post('/',         fc.saveSession);
router.get('/stats',     fc.getStats);
router.get('/history',   fc.getHistory);

module.exports = router;
