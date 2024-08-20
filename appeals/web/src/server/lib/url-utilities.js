/**
 *
 * @param {string} url
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {boolean}
 */
export function isInternalUrl(url, request) {
	try {
		if (url.startsWith('/')) {
			const protocol = request.secure ? 'https' : 'http';
			url = `${protocol}://${request.headers.host}${url}`;
		}
		const targetUrl = new URL(url);
		const requestUrl = new URL(`${request.protocol}://${request.headers.host}`);
		return targetUrl.host === requestUrl.host;
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
		return response.redirect(getOriginPathname(request));
	}
}
