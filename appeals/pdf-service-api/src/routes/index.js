const express = require('express');
const config = require('../config');
const logger = require('../lib/logger');
const { postGeneratePdfController } = require('../controllers/pdf.js');

const router = express.Router();

logger.info('Setting up PDF service routes...');

router.get('/health', (req, res) => {
	logger.info('GET /health endpoint hit');
	try {
		res.status(200).send({
			status: 'OK',
			uptime: process.uptime(),
			commit: config.gitSha || 'N/A'
		});
	} catch (error) {
		logger.error({ err: error }, 'Error processing /health request');
		res.status(500).send({ status: 'Error', message: error.message });
	}
});

router.post('/generate-pdf', (req, res, next) => {
	const appealId = req.body?.currentAppeal?.appealId || 'unknown';
	logger.info(`ROUTE: POST /generate-pdf matched for appealId: ${appealId}`);

	postGeneratePdfController(req, res, next);
});

router.get('/', (req, res) => {
	logger.info('GET / endpoint hit');
	res.status(200).send('Welcome to the PINS PDF Service API.');
});

logger.info('PDF service routes setup complete.');
module.exports = router;
