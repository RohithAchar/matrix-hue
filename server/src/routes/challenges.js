const { Router } = require('express');
const { createChallenge } = require('../controllers/challengeController');

const router = Router();

router.post('/', createChallenge);

module.exports = router;
