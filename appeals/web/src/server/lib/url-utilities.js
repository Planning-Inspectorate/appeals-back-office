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
