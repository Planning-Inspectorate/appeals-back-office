import dirname from './utils/dirname.js';
import nunjucks from 'nunjucks';
import path from 'node:path';
import * as nunjucksFilters from './nunjucks-filters/index.js';

const __dirname = dirname(import.meta.url); // get the resolved path of the directory
const viewDir = path.join(__dirname, '..', 'views');
const nunjucksEnv = nunjucks.configure(viewDir, {
	autoescape: true
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
