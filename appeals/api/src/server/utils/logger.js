import pino from 'pino';
import pinoHttp from 'pino-http';
import config from '../config/config.js';

const transport = {
	targets: [
		{
			target: 'pino-pretty',
			level: config.log.levelStdOut,
			options: {
				destination: 1,
				ignore: 'pid,hostname',
				colorize: true,
				translateTime: 'HH:MM:ss.l'
			}
		}
	]
};

const logger = pino({
	timestamp: pino.stdTimeFunctions.isoTime,
	level: config.log.levelStdOut,
	// only pretty print in dev
	transport: config.NODE_ENV === 'production' ? undefined : transport
});

export const httpLogger = pinoHttp({ logger });

export default logger;
