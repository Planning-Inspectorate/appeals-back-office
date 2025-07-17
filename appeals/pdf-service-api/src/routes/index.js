import express from 'express';
import config from '../config.js';
import logger from '../lib/logger.js';
import { postGeneratePdfController } from '../controllers/pdf.js';

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

	return postGeneratePdfController(req, res, next);
});

router.get('/', (req, res) => {
	logger.info('GET / endpoint hit');
	res.status(200).send('Welcome to the PINS PDF Service API.');
});

logger.info('PDF service routes setup complete.');
export default router;
