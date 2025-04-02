const express = require('express');
const { postGeneratePdf } = require('../controllers/pdf');

const router = express.Router();

// @ts-ignore
router.post('/generate', postGeneratePdf);

module.exports = router;
