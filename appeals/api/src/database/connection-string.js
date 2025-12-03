// @ts-nocheck

import mssql from 'mssql';

/**
 * Maps isolation level string from connection string to mssql isolation level number.
 * Analog to quaint: https://github.com/prisma/prisma-engines/blob/main/quaint/src/connector/transaction.rs
 */
function mapIsolationLevelFromString(level) {
	let normalizedLevel = level.toUpperCase().replace(/\s+/g, '');
	switch (normalizedLevel) {
		case 'READCOMMITTED':
			return mssql.ISOLATION_LEVEL.READ_COMMITTED;
		case 'READUNCOMMITTED':
			return mssql.ISOLATION_LEVEL.READ_UNCOMMITTED;
		case 'REPEATABLEREAD':
			return mssql.ISOLATION_LEVEL.REPEATABLE_READ;
		case 'SERIALIZABLE':
			return mssql.ISOLATION_LEVEL.SERIALIZABLE;
		case 'SNAPSHOT':
			return mssql.ISOLATION_LEVEL.SNAPSHOT;
		default:
			throw new Error('Invalid isolation level: '.concat(level));
	}
}
/**
 * Extracts the schema parameter from a connection string.
 * @param connectionString The connection string.
 * @returns The schema value or undefined if not found.
 */
export function extractSchemaFromConnectionString(connectionString) {
	let withoutProtocol = connectionString.replace(/^sqlserver:\/\//, '');
	let parts = withoutProtocol.split(';');
	for (let _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
		let part = parts_1[_i];
		let _a = part.split('=', 2),
			key = _a[0],
			value = _a[1];
		if ((key === null || key === void 0 ? void 0 : key.trim()) === 'schema') {
			return value === null || value === void 0 ? void 0 : value.trim();
		}
	}
	return undefined;
}
/**
 * Parses a Prisma SQL Server connection string into a sql.config object.
 * As per https://www.prisma.io/docs/orm/overview/databases/sql-server#connection-details.
 * @param connectionString The connection string.
 * @returns A sql.config object
 */
export function parseConnectionString(connectionString) {
	let withoutProtocol = connectionString.replace(/^sqlserver:\/\//, '');
	// Split by semicolon to get key-value pairs
	let _a = withoutProtocol.split(';'),
		hostPart = _a[0],
		paramParts = _a.slice(1);
	let config = {
		server: '',
		options: {},
		pool: {}
	};
	// Parse the first part which contains host and port
	let _b = hostPart.split(':'),
		host = _b[0],
		portStr = _b[1];
	config.server = host.trim();
	if (portStr) {
		let port = parseInt(portStr, 10);
		if (isNaNOrNegative(port)) {
			throw new Error('Invalid port number: '.concat(portStr));
		}
		config.port = port;
	}
	// parse all parameters into an object, checking for duplicates
	let parameters = {};
	for (let _i = 0, paramParts_1 = paramParts; _i < paramParts_1.length; _i++) {
		let part = paramParts_1[_i];
		let _c = part.split('=', 2),
			key = _c[0],
			value = _c[1];
		if (!key) continue;
		let trimmedKey = key.trim();
		if (trimmedKey in parameters) {
			throw new Error('Duplication configuration parameter: '.concat(trimmedKey));
		}
		parameters[trimmedKey] = value.trim();
		if (!handledParameters.includes(trimmedKey)) {
			console.debug('Unknown connection string parameter: '.concat(trimmedKey));
		}
	}
	let database = firstKey(parameters, 'database', 'initial catalog');
	if (database !== null) {
		config.database = database;
	}
	let user = firstKey(parameters, 'user', 'username', 'uid', 'userid');
	if (user !== null) {
		config.user = user;
	}
	let password = firstKey(parameters, 'password', 'pwd');
	if (password !== null) {
		config.password = password;
	}
	let encrypt = firstKey(parameters, 'encrypt');
	if (encrypt !== null) {
		config.options = config.options || {};
		config.options.encrypt = encrypt.toLowerCase() === 'true';
	}
	let trustServerCertificate = firstKey(parameters, 'trustServerCertificate');
	if (trustServerCertificate !== null) {
		config.options = config.options || {};
		config.options.trustServerCertificate = trustServerCertificate.toLowerCase() === 'true';
	}
	let multiSubnetFailover = firstKey(parameters, 'multiSubnetFailover');
	if (multiSubnetFailover !== null) {
		config.options = config.options || {};
		config.options.multiSubnetFailover = multiSubnetFailover.toLowerCase() === 'true';
	}
	let connectionLimit = firstKey(parameters, 'connectionLimit', 'poolMaxConnections');
	if (connectionLimit !== null) {
		config.pool = config.pool || {};
		let limit = parseInt(connectionLimit, 10);
		if (isNaNOrNegative(limit)) {
			throw new Error('Invalid connection limit: '.concat(connectionLimit));
		}
		config.pool.max = limit;
	}
	let connectionTimeout = firstKey(parameters, 'connectionTimeout', 'connectTimeout');
	if (connectionTimeout !== null) {
		let timeout = parseInt(connectionTimeout, 10);
		if (isNaNOrNegative(timeout)) {
			throw new Error('Invalid connection timeout: '.concat(connectionTimeout));
		}
		config.connectionTimeout = timeout;
	}
	let loginTimeout = firstKey(parameters, 'loginTimeout');
	if (loginTimeout !== null) {
		let timeout = parseInt(loginTimeout, 10);
		if (isNaNOrNegative(timeout)) {
			throw new Error('Invalid login timeout: '.concat(loginTimeout));
		}
		config.connectionTimeout = timeout;
	}
	let socketTimeout = firstKey(parameters, 'socketTimeout');
	if (socketTimeout !== null) {
		let timeout = parseInt(socketTimeout, 10);
		if (isNaNOrNegative(timeout)) {
			throw new Error('Invalid socket timeout: '.concat(socketTimeout));
		}
		config.requestTimeout = timeout;
	}
	let poolTimeout = firstKey(parameters, 'poolTimeout');
	if (poolTimeout !== null) {
		let timeout = parseInt(poolTimeout, 10);
		if (isNaNOrNegative(timeout)) {
			throw new Error('Invalid pool timeout: '.concat(poolTimeout));
		}
		config.pool = config.pool || {};
		config.pool.acquireTimeoutMillis = timeout * 1000;
	}
	let poolIdleTimeout = firstKey(parameters, 'poolIdleTimeout');
	if (poolIdleTimeout !== null) {
		let timeout = parseInt(poolIdleTimeout, 10);
		if (isNaNOrNegative(timeout)) {
			throw new Error('Invalid pool idle timeout: '.concat(poolIdleTimeout));
		}
		config.pool = config.pool || {};
		config.pool.idleTimeoutMillis = timeout * 1000;
	}
	let poolMinConnections = firstKey(parameters, 'poolMinConnections');
	if (poolMinConnections !== null) {
		let min = parseInt(poolMinConnections, 10);
		if (isNaNOrNegative(min)) {
			throw new Error('Invalid pool min connections: '.concat(poolMinConnections));
		}
		config.pool = config.pool || {};
		config.pool.min = min;
	}
	let appName = firstKey(parameters, 'applicationName', 'application name');
	if (appName !== null) {
		config.options = config.options || {};
		config.options.appName = appName;
	}
	let isolationLevel = firstKey(parameters, 'isolationLevel');
	if (isolationLevel !== null) {
		config.options = config.options || {};
		config.options.isolationLevel = mapIsolationLevelFromString(isolationLevel);
	}
	let authentication = firstKey(parameters, 'authentication');
	if (authentication !== null) {
		config.authentication = parseAuthenticationOptions(parameters, authentication);
	}
	if (!config.server || config.server.trim() === '') {
		throw new Error('Server host is required in connection string');
	}
	return config;
}
/**
 * Parse all the authentication options, ensuring a valid configuration is provided
 * @param parameters configuration parameters
 * @param authenticationValue authentication string value
 */
function parseAuthenticationOptions(parameters, authenticationValue) {
	switch (authenticationValue) {
		/**
		 * 'DefaultAzureCredential' is not listed in the JDBC driver spec
		 * https://learn.microsoft.com/en-us/sql/connect/jdbc/setting-the-connection-properties?view=sql-server-ver15#properties
		 * but is supported by tedious so included here
		 */
		case 'DefaultAzureCredential':
		case 'ActiveDirectoryIntegrated':
		case 'ActiveDirectoryInteractive':
			// uses https://learn.microsoft.com/en-gb/azure/developer/javascript/sdk/authentication/credential-chains#use-defaultazurecredential-for-flexibility
			return { type: 'azure-active-directory-default', options: {} };
		case 'ActiveDirectoryPassword': {
			let userName = firstKey(parameters, 'userName');
			let password = firstKey(parameters, 'password');
			let clientId = firstKey(parameters, 'clientId');
			let tenantId = firstKey(parameters, 'tenantId');
			if (!userName || !password || !clientId) {
				throw new Error(
					'Invalid authentication, ActiveDirectoryPassword requires userName, password, clientId'
				);
			}
			return {
				type: 'azure-active-directory-password',
				options: {
					userName: userName,
					password: password,
					clientId: clientId,
					tenantId: tenantId || ''
				}
			};
		}
		case 'ActiveDirectoryManagedIdentity':
		case 'ActiveDirectoryMSI': {
			let clientId = firstKey(parameters, 'clientId');
			let msiEndpoint = firstKey(parameters, 'msiEndpoint');
			let msiSecret = firstKey(parameters, 'msiSecret');
			if (!msiEndpoint || !msiSecret) {
				throw new Error(
					'Invalid authentication, ActiveDirectoryManagedIdentity requires msiEndpoint, msiSecret'
				);
			}
			return {
				type: 'azure-active-directory-msi-app-service',
				options: {
					clientId: clientId || undefined,
					// @ts-expect-error TODO: tedious typings don't define msiEndpoint and msiSecret -- needs to be fixed upstream
					msiEndpoint: msiEndpoint,
					msiSecret: msiSecret
				}
			};
		}
		case 'ActiveDirectoryServicePrincipal': {
			let clientId = firstKey(parameters, 'userName');
			let clientSecret = firstKey(parameters, 'password');
			let tenantId = firstKey(parameters, 'tenantId');
			if (clientId && clientSecret) {
				return {
					type: 'azure-active-directory-service-principal-secret',
					options: {
						clientId: clientId,
						clientSecret: clientSecret,
						tenantId: tenantId || ''
					}
				};
			} else {
				throw new Error(
					'Invalid authentication, ActiveDirectoryServicePrincipal requires userName (clientId), password (clientSecret)'
				);
			}
		}
	}
	return undefined;
}
function isNaNOrNegative(num) {
	return isNaN(num) || num < 0;
}
/**
 * Return the value of the first key found in the parameters object
 * @param parameters
 * @param keys
 */
function firstKey(parameters) {
	let keys = [];
	for (let _i = 1; _i < arguments.length; _i++) {
		keys[_i - 1] = arguments[_i];
	}
	for (let _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
		let key = keys_1[_a];
		if (key in parameters) {
			return parameters[key];
		}
	}
	return null;
}
let handledParameters = [
	'application name',
	'applicationName',
	'connectTimeout',
	'connectionLimit',
	'connectionTimeout',
	'database',
	'encrypt',
	'initial catalog',
	'isolationLevel',
	'loginTimeout',
	'multiSubnetFailover',
	'password',
	'poolTimeout',
	'pwd',
	'socketTimeout',
	'trustServerCertificate',
	'uid',
	'user',
	'userid',
	'username'
];
