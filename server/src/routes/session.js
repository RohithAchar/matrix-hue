const { Router } = require('express');
const { createSession } = require('../controllers/sessionController');

const router = Router();

router.post('/', createSession);

module.exports = router;
