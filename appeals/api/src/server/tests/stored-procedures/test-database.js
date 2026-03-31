import { PrismaClient } from '#db-client/client.js';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenericContainer, Wait } from 'testcontainers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, '../../../..');
const storedProcedureStatePath = path.join(
	tmpdir(),
	'appeals-api-stored-procedure-test-database.json'
);
const storedProcedureSqlPath = path.join(
	apiRoot,
	'src/database/migrations/20260320113501_add_procedure_sp_set_personal_list/migration.sql'
);

const sqlEdgeImage = 'mcr.microsoft.com/azure-sql-edge:latest';
const sqlEdgePort = 1433;
const sqlEdgeDatabaseName = 'pins_stored_procedures_test';
const sqlEdgeUsername = 'sa';
const sqlEdgePassword = 'PinsStoredProcTest!234';

/**
 * @param {string} connectionString
 * @returns {PrismaClient}
 */
const createPrismaClientForConnection = (connectionString) =>
	new PrismaClient({
		adapter: new PrismaMssql(connectionString),
		transactionOptions: {
			maxWait: 2000,
			timeout: 20000
		}
	});

/**
 * @param {{host: string, port: number, databaseName: string}} param0
 * @returns {string}
 */
export const buildSqlServerConnectionString = ({ host, port, databaseName }) =>
	`sqlserver://${host}:${port};database=${databaseName};user=${sqlEdgeUsername};password=${sqlEdgePassword};trustServerCertificate=true`;

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {unknown} error
 * @returns {string}
 */
const getErrorMessage = (error) => {
	if (error instanceof Error) {
		return error.message;
	}

	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message;
	}

	return 'unknown error';
};

export const assertSpSetPersonalListProcedureExists = () => {
	if (!existsSync(storedProcedureSqlPath)) {
		throw new Error(
			`spSetPersonalList SQL file was not found at ${storedProcedureSqlPath}. The stored procedure must exist in-repo for these tests to run.`
		);
	}

	return storedProcedureSqlPath;
};

/**
 * @returns {{
 * 	containerId: string,
 * 	host: string,
 * 	port: number,
 * 	databaseName: string,
 * 	connectionString: string
 * } | null}
 */
export const loadStoredProcedureTestState = () => {
	if (!existsSync(storedProcedureStatePath)) {
		return null;
	}

	return JSON.parse(readFileSync(storedProcedureStatePath, 'utf8'));
};

/**
 * @param {{
 * 	containerId: string,
 * 	host: string,
 * 	port: number,
 * 	databaseName: string,
 * 	connectionString: string
 * }} state
 */
const saveStoredProcedureTestState = (state) => {
	mkdirSync(path.dirname(storedProcedureStatePath), { recursive: true });
	writeFileSync(storedProcedureStatePath, JSON.stringify(state), 'utf8');
};

const removeStoredProcedureTestState = () => {
	rmSync(storedProcedureStatePath, { force: true });
};

/**
 * @param {{
 * 	containerId: string,
 * 	host: string,
 * 	port: number,
 * 	databaseName: string,
 * 	connectionString: string
 * } | null} state
 */
export const applyStoredProcedureTestEnvironment = (state) => {
	if (!state) {
		return;
	}

	process.env.DATABASE_URL = state.connectionString;
	process.env.STORED_PROCEDURE_TEST_DATABASE_URL = state.connectionString;
	process.env.STORED_PROCEDURE_TEST_DATABASE_NAME = state.databaseName;
	process.env.STORED_PROCEDURE_TEST_DATABASE_HOST = state.host;
	process.env.STORED_PROCEDURE_TEST_DATABASE_PORT = String(state.port);
};

/**
 * @param {string} masterConnectionString
 * @returns {Promise<void>}
 */
const waitForSqlServer = async (masterConnectionString) => {
	/** @type {unknown} */
	let lastError;

	for (let attempt = 0; attempt < 60; attempt++) {
		const prisma = createPrismaClientForConnection(masterConnectionString);

		try {
			await prisma.$queryRaw`SELECT 1`;
			return;
		} catch (error) {
			lastError = error;
			await sleep(2000);
		} finally {
			await prisma.$disconnect().catch(() => undefined);
		}
	}

	throw new Error(`SQL Server did not become ready in time: ${getErrorMessage(lastError)}`);
};

/**
 * @param {string} masterConnectionString
 * @returns {Promise<void>}
 */
const ensureTestDatabaseExists = async (masterConnectionString) => {
	const prisma = createPrismaClientForConnection(masterConnectionString);

	try {
		await prisma.$executeRawUnsafe(
			`IF DB_ID(N'${sqlEdgeDatabaseName}') IS NULL CREATE DATABASE [${sqlEdgeDatabaseName}]`
		);
	} finally {
		await prisma.$disconnect();
	}
};

/**
 * @param {string} connectionString
 */
const runPrismaMigrations = (connectionString) => {
	const result = spawnSync(
		'npx',
		['prisma', 'migrate', 'deploy', '--schema', 'src/database/schema.prisma'],
		{
			cwd: apiRoot,
			encoding: 'utf8',
			env: {
				...process.env,
				DATABASE_URL: connectionString
			}
		}
	);

	if (result.status !== 0) {
		throw new Error(
			['Failed to run Prisma migrations for stored procedure tests.', result.stdout, result.stderr]
				.filter(Boolean)
				.join('\n')
		);
	}
};

export const bootstrapStoredProcedureTestDatabase = async () => {
	assertSpSetPersonalListProcedureExists();

	let container = new GenericContainer(sqlEdgeImage)
		.withEnvironment({
			ACCEPT_EULA: '1',
			MSSQL_SA_PASSWORD: sqlEdgePassword
		})
		.withExposedPorts(sqlEdgePort)
		.withWaitStrategy(Wait.forLogMessage(/SQL Server is now ready for client connections/i))
		.withStartupTimeout(180000);

	if (typeof container.withPlatform === 'function') {
		container = container.withPlatform('linux/amd64');
	}

	const startedContainer = await container.start();
	const state = {
		containerId: startedContainer.getId(),
		host: startedContainer.getHost(),
		port: startedContainer.getMappedPort(sqlEdgePort),
		databaseName: sqlEdgeDatabaseName,
		connectionString: buildSqlServerConnectionString({
			host: startedContainer.getHost(),
			port: startedContainer.getMappedPort(sqlEdgePort),
			databaseName: sqlEdgeDatabaseName
		})
	};

	const masterConnectionString = buildSqlServerConnectionString({
		host: state.host,
		port: state.port,
		databaseName: 'master'
	});

	await waitForSqlServer(masterConnectionString);
	await ensureTestDatabaseExists(masterConnectionString);
	runPrismaMigrations(state.connectionString);
	saveStoredProcedureTestState(state);
	applyStoredProcedureTestEnvironment(state);

	return state;
};

export const stopStoredProcedureTestDatabase = async () => {
	const state = loadStoredProcedureTestState();

	if (!state?.containerId) {
		removeStoredProcedureTestState();
		return;
	}

	const result = spawnSync('docker', ['rm', '-f', state.containerId], {
		encoding: 'utf8'
	});

	removeStoredProcedureTestState();

	if (
		result.status !== 0 &&
		!result.stderr.includes('No such container') &&
		!result.stderr.includes('is not running')
	) {
		throw new Error(
			[`Failed to stop SQL Edge test container ${state.containerId}.`, result.stdout, result.stderr]
				.filter(Boolean)
				.join('\n')
		);
	}
};

export const createStoredProcedureTestPrismaClient = () => {
	const state = loadStoredProcedureTestState();

	if (!state?.connectionString) {
		throw new Error(
			`Stored procedure test database state was not found at ${storedProcedureStatePath}.`
		);
	}

	return createPrismaClientForConnection(state.connectionString);
};

/**
 * @param {PrismaClient} prisma
 * @param {{appealId?: number | null, isNetResidentsAppealType?: boolean}} [options]
 */
export const executeSpSetPersonalList = async (
	prisma,
	{ appealId = null, isNetResidentsAppealType = false } = {}
) => {
	const parsedAppealId = appealId === null ? null : Number(appealId);

	if (appealId !== null && Number.isNaN(parsedAppealId)) {
		throw new Error(`spSetPersonalList appealId must be numeric. Received: ${appealId}`);
	}

	return prisma.$queryRawUnsafe(
		`EXEC dbo.spSetPersonalList @appealId = ${parsedAppealId === null ? 'NULL' : parsedAppealId}, @isNetResidentsAppealType = ${isNetResidentsAppealType ? 1 : 0};`
	);
};
