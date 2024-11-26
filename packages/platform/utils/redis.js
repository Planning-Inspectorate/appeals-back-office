/**
 * @typedef {Object} RedisConnectionDetails
 * @property {string} host
 * @property {number} port
 * @property {string} password
 * @property {boolean} ssl
 * @property {boolean} abortConnect
 * @property {number} pingInterval
 */

/**
 * @param {string} str - in the form 'some.example.org:6380,password=some_password,ssl=True,abortConnect=False'
 * @returns {RedisConnectionDetails}
 */
export function parseRedisConnectionString(str) {
	if (typeof str !== 'string') {
		throw new Error('not a string');
	}
	const parts = str.split(',');
	if (parts.length !== 4 && parts.length !== 5) {
		throw new Error('unexpected redis connection string format, expected 4 or 5 parts');
	}
	const [hostPort, passwordPart, sslPart, abortConnectPart, pingIntervalPart] = parts;
	const hostParts = hostPort.split(':');
	if (hostParts.length !== 2) {
		throw new Error('unexpected host:port format for redis string, expected 2 parts');
	}
	const port = parseInt(hostParts[1]);
	if (isNaN(port)) {
		throw new Error('unexpected port for redis string, expected int');
	}
	if (!passwordPart.startsWith('password=')) {
		throw new Error('unexpected password for redis string, expected password=');
	}
	const password = passwordPart.substring('password='.length);
	const ssl = sslPart.toLowerCase().endsWith('true');
	const abortConnect = abortConnectPart.toLowerCase().endsWith('true');

	if (pingIntervalPart && !pingIntervalPart.startsWith('pingInterval=')) {
		throw new Error('unexpected pingInterval for redis string, expected pingInterval=');
	}
	const pingInterval = pingIntervalPart
		? parseInt(pingIntervalPart.substring('pingInterval='.length))
		: 300000; //5 minutes default
	if (isNaN(pingInterval)) {
		throw new Error('unexpected ping interval for redis string, expected int');
	}

	return {
		host: hostParts[0],
		port,
		password,
		ssl,
		abortConnect,
		pingInterval
	};
}
