const express = require('express');
const router = express.Router();
const { testMessage } = require('../controllers/testController');

router.get('/test', testMessage);

module.exports = router;
