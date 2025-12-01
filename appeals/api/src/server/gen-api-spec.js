import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import swaggerAutogen from 'swagger-autogen';
import { generateApi } from 'swagger-typescript-api';
import url from 'url';
import { spec } from './swagger.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const endpointsFiles = ['./src/server/endpoints/**/*.routes.js'];

const outputDir = process.env.OPENAPI_OUTPUT_DIR || __dirname;
const specFile = path.join(outputDir, 'openapi.json');
const typesFile = path.join(outputDir, 'openapi-types.ts');

/**
 * Generate the API spec and types
 */
async function run() {
	console.log(`generating api spec`);
	const res = await swaggerAutogen({
		openapi: '3.0.0',
		disableLogs: true
	})(specFile, endpointsFiles, spec);
	if (!res) {
		throw new Error('no spec generated');
	}
	const specContent = res.data;

	console.log(`generating api types`);
	const { files } = await generateApi({
		fileName: path.basename(typesFile),
		input: specFile,
		output: path.dirname(specFile),
		generateClient: false
	});

	console.log(`formatting files`);
	await formatWrite(specFile, JSON.stringify(specContent, null, 2));

	for (const f of files) {
		const filePath = path.join(outputDir, f.fileName + f.fileExtension);
		await formatWrite(filePath, f.fileContent);
	}
	console.log(`done`);
}

/**
 * Format contents with prettier and write to file
 *
 * @param {string} filePath
 * @param {string} content
 */
async function formatWrite(filePath, content) {
	// Resolve config from the project directory, not the output path (which may be a temp dir)
	const configPath = path.join(__dirname, path.basename(filePath));
	const options = await prettier.resolveConfig(configPath);
	if (options === null) {
		throw new Error(`no prettier config for ${configPath}`);
	}
	options.filepath = filePath;
	const formatted = await prettier.format(content, options);
	await fs.writeFile(filePath, formatted);
}

run();
