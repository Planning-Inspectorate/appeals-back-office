/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import logger from './lib/logger.js';

const app = express();
app.use(
	cors({
		origin: '*', // restrict in production
		methods: 'POST, GET, OPTIONS',
		preflightContinue: false,
		optionsSuccessStatus: 204
	})
);
app.use(express.json({ limit: '50mb' }));

app.use('/', routes);

// 404 Handler
app.use((req, res, _next) => {
	logger.warn({ url: req.url }, 'Route not found by Express');
	res.status(404).json({
		error: 'NOT_FOUND',
		message: 'The requested resource was not found on the PDF service.'
	});
});
// Final, Global Error Handler
// @ts-ignore
app.use((err, req, res, _next) => {
	const errorMsg = err.message || 'An internal server error occurred.';
	logger.error({ err, url: req.url }, `Unhandled PDF service error: ${errorMsg}`);

	if (res.headersSent) {
		return;
	}

	res.status(500).json({
		error: 'INTERNAL_SERVER_ERROR',
		message: 'The document generation service encountered an unexpected error.'
	});
});

export default app;
