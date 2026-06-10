const { Router } = require('express');
const { initGlobal, submitRound, getLeaderboard } = require('../controllers/globalController');

const router = Router();

router.get('/init', initGlobal);
router.post('/round', submitRound);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
