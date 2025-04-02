const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');
const logger = require('./lib/logger');

const {
	server: { showErrors }
} = config;

const app = express();

// https://github.com/nodejs/node/issues/47130 http clients don't handle keepAlive correctly so sticking with false (the default before node 19)
const https = require('https');
const http = require('http');
https.globalAgent = new https.Agent({ keepAlive: false });
http.globalAgent = new http.Agent({ keepAlive: false });

app
	.use(
		cors({
			origin: '*',
			methods: 'POST',
			preflightContinue: false,
			optionsSuccessStatus: 204
		})
	)
	.use(bodyParser.json())
	.use('/', routes)
	.use((req, res) => {
		res.status(404).json({
			message: 'Not Found',
			url: req.url
		});
	})
	// @ts-ignore
	.use((err, req, res, next) => {
		logger.error({ err }, 'Uncaught exception');
		res.status(500).json({
			message: err.message,
			stack: showErrors ? err.stack : undefined
		});
		next();
	});

module.exports = app;
