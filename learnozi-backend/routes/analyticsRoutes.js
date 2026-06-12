const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPerformanceAnalytics } = require('../controllers/analyticsController');

// All analytics routes are protected
router.use(auth);

router.get('/readiness', getPerformanceAnalytics);

module.exports = router;
