import { isAtEditEntrypoint } from '#lib/edit-utilities.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { preserveQueryString } from '#lib/url-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} defaultBackLinkUrl
 * @param {string} confirmPageUrl
 * @returns {string}
 */
export function getRule6BackLinkUrl(request, defaultBackLinkUrl, confirmPageUrl) {
	if (isAtEditEntrypoint(request) || request.query.change) {
		return preserveQueryString(request, confirmPageUrl, {
			exclude: ['editEntrypoint', 'change']
		});
	} else if (request.query.backUrl) {
		return constructUrl(String(request.query.backUrl), request.currentAppeal.appealId);
	}
	return preserveQueryString(request, defaultBackLinkUrl);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} defaultBackLinkUrl
 * @returns {string}
 */
export function getRule6ConfirmBackLinkUrl(request, defaultBackLinkUrl) {
	if (request.query.backUrl) {
		return constructUrl(String(request.query.backUrl), request.currentAppeal.appealId);
	}
	return preserveQueryString(request, defaultBackLinkUrl);
}
