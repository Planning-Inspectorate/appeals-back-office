/* eslint-disable no-unused-vars */
// @ts-nocheck
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');
const logger = require('./lib/logger');

const {
	server: { _showErrors }
} = config;

const app = express();
app.use(
	cors({
		origin: '*', // May need to add restrictions in production
		methods: 'POST, GET, OPTIONS',
		preflightContinue: false,
		optionsSuccessStatus: 204
	})
);
app.use(express.json({ limit: '50mb' })); // Increased limit might be needed for large HTML payloads in future
app.use('/', routes);
app.use((req, res, _next) => {
	logger.warn({ url: req.url, method: req.method }, 'Route not found by Express');
	res.status(404).json({
		message: 'Not Found',
		url: req.url
	});
});
// @ts-ignore
app.use((err, req, res, _next) => {
	logger.error({ err, url: req.url, method: req.method }, 'Unhandled application error');
	const statusCode = typeof err.status === 'number' ? err.status : 500;
	const message = err.message || 'Internal Server Error';
	res.status(statusCode).json({
		message: message,
		// Stack trace only in non-production environments ideally
		stack: config.server.showErrors && err.stack ? err.stack : undefined
	});
});

module.exports = app;
