const { Router } = require('express');
const { initGlobal, submitRound } = require('../controllers/globalController');

const router = Router();

router.get('/init', initGlobal);
router.post('/round', submitRound);

module.exports = router;
