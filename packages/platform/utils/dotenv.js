import dotenv from 'dotenv';
import path from 'node:path';

/**
 * Load .env into process.env
 *
 * @param {string} [environment]
 * @param {string} [rootDir] - directory to load .env files from
 * @returns {Record<string, string | undefined>}
 */
export function loadEnvironment(environment, rootDir = process.cwd()) {
	const isTest = environment === 'test';

	// either load .env.test for tests, or just .env regardless of environment
	const sourceFile = isTest ? '.env.test' : '.env';
	// load into process.env (process.env takes precendence)
	dotenv.config({ path: path.join(rootDir, sourceFile) });

	return process.env;
}
