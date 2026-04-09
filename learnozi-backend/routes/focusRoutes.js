const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const fc = require('../controllers/focusController');

router.use(auth);
router.post('/',         validate(schemas.saveSession), fc.saveSession);
router.get('/stats',     fc.getStats);
router.get('/history',   fc.getHistory);

module.exports = router;
