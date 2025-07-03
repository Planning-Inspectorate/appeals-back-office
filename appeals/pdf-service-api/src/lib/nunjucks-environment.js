import dirname from './utils/dirname.js';
import nunjucks from 'nunjucks';
import path from 'node:path';
import * as nunjucksFilters from './nunjucks-filters/index.js';
import { createRequire } from 'node:module';

const __dirname = dirname(import.meta.url); // get the resolved path of the directory
const viewDir = path.join(__dirname, '..', 'views');
const require = createRequire(import.meta.url);
const govukFrontendRoot = path.resolve(require.resolve('govuk-frontend'), '../..');

const nunjucksEnv = nunjucks.configure([govukFrontendRoot, viewDir], {
	// output with dangerous characters are escaped automatically
	autoescape: true,
	// automatically remove trailing newlines from a block/tag
	trimBlocks: true,
	// automatically remove leading whitespace from a block/tag
	lstripBlocks: true,
	// never use a cache and recompile templates each time
	noCache: true
});

// Add all custom app filters
for (const filterName in nunjucksFilters) {
	if (Object.prototype.hasOwnProperty.call(nunjucksFilters, filterName)) {
		nunjucksEnv.addFilter(
			filterName,
			nunjucksFilters[/** @type {keyof typeof nunjucksFilters} */ (filterName)]
		);
	}
}

export default nunjucksEnv;
