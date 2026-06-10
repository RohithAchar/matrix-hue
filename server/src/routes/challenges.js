const { Router } = require('express');
const { createChallenge, getChallenge, submitRound } = require('../controllers/challengeController');

const router = Router();

router.post('/', createChallenge);
router.get('/:code', getChallenge);
router.post('/:code/round', submitRound);

module.exports = router;
