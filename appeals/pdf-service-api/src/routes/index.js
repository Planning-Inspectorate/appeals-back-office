const express = require('express');
const pdfRouter = require('./pdf');
const config = require('../config');

const router = express.Router();

/**
 * index route to avoid azure always on ping 404s
 */
router.get('/', (req, res) => {
	res.sendStatus(204);
});

router.get('/health', (req, res) => {
	res.status(200).send({
		status: 'OK',
		uptime: process.uptime(),
		commit: config.gitSha
	});
});

router.use('/api/v1', pdfRouter);

module.exports = router;
