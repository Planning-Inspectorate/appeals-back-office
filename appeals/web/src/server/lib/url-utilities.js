/**
 * Checks if a URL is internal (relative) and safe for redirection.
 * @param {string} url
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {boolean}
 */
export function isInternalUrl(url, request) {
	try {
		const baseHost = request.headers.host;
		const baseProtocol = request.secure ? 'https' : 'http';

		const internalUrlRegex = new RegExp(`^/[^/]|^//${baseHost}/|^${baseProtocol}://${baseHost}/`);

		return internalUrlRegex.test(url);
	} catch (error) {
		return false;
	}
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string}
 */
export function getOriginPathname(request) {
	const origin = new URL(request.originalUrl, `${request.protocol}://${request.headers.host}`);
	return origin.pathname;
}

/**
 * Safely redirects to a given URL, ensuring it's internal
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('express').Response} response
 * @param {string} url
 * @returns {void}
 */
export function safeRedirect(request, response, url) {
	if (isInternalUrl(url, request)) {
		return response.redirect(url);
	} else {
		return response.redirect('/');
	}
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} urlString
 * @returns {string}
 */
export function addBackLinkQueryToUrl(request, urlString) {
	return addQueryParamsToUrl(urlString, { backUrl: request.originalUrl });
}

/**
 * @param {string} urlString
 * @param {Record<string, string>} queryParams
 * @returns {string}
 */
export function addQueryParamsToUrl(urlString, queryParams) {
	const [urlWithQuery, hash] = urlString.split('#');
	const [url, queryString] = urlWithQuery.split('?');

	const newQueryString = new URLSearchParams(queryString);
	Object.entries(queryParams).forEach(([key, value]) => {
		newQueryString.set(key, value);
	});

	return `${url}?${newQueryString.toString()}${hash ? `#${hash}` : ''}`;
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string|undefined}
 */
export function getBackLinkUrlFromQuery(request) {
	if (!request.query.backUrl) {
		return;
	}
	return decodeURIComponent(request.query.backUrl.toString());
}

/**
 * @param {string} url
 * @returns {string}
 */
export function stripQueryString(url) {
	return url.split('?')[0];
}

/**
 * Returns the specified URL with the same query params as the original URL of the request,
 * optionally excluding specific params.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} urlString
 * @param {{ exclude?: string[] }} [options]
 * @returns {string}
 */
export function preserveQueryString(request, urlString, { exclude = [] } = {}) {
	const [urlWithoutHash] = request.originalUrl.split('#');
	const [, queryString] = urlWithoutHash.split('?');

	const queryParams = new URLSearchParams(queryString);
	exclude.forEach((param) => {
		queryParams.delete(param);
	});

	return `${urlString.split('#')[0]}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}
