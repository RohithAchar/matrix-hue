const { Router } = require('express');
const { createChallenge, getChallenge, submitRound, getLeaderboard } = require('../controllers/challengeController');

const router = Router();

router.post('/', createChallenge);
router.get('/:code', getChallenge);
router.post('/:code/round', submitRound);
router.get('/:code/leaderboard', getLeaderboard);

module.exports = router;
