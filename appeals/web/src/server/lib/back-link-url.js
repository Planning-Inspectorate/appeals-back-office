/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} url
 * @returns {string}
 */
export function addBackLinkQueryToUrl(request, url) {
	return `${url}?backUrl=${request.originalUrl}`;
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string|undefined}
 */
export function getBackLinkUrlFromQuery(request) {
	return request.query.backUrl?.toString();
}
