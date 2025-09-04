import { addQueryParamsToUrl, stripQueryString } from './url-utilities.js';

/**
 * Returns the session values for the given key, or the /edit key if editing.
 * Also sets the /edit values if they do not yet exist when editing.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} sessionKey
 * @returns {Record<string, string>}
 */
export const getSessionValues = (request, sessionKey) => {
	const { query, session } = request;
	const editEntrypoint = query.editEntrypoint;
	if (editEntrypoint) {
		const editKey = `${sessionKey}/edit`;
		if (!session[editKey]) {
			session[editKey] = session[sessionKey];
		}
		return session[editKey] || {};
	}
	return session[sessionKey] || {};
};

/**
 * Adds an editEntrypoint query param to the URL pointing to itself, indicating that the
 * user has started editing at that point.
 * @param {string} baseUrl - The base URL path
 * @param {string} [slug] - The last part of the URL path
 * @returns {string}
 */
export const editLink = (baseUrl, slug) => {
	const url = slug ? `${baseUrl}/${slug}` : baseUrl;
	return addQueryParamsToUrl(url, { editEntrypoint: url });
};

/**
 * Saves any edited values to the main session key and deletes the /edit key.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} sessionKey
 */
export const applyEdits = (request, sessionKey) => {
	const { session } = request;
	const editKey = `${sessionKey}/edit`;
	if (session[editKey]) {
		session[sessionKey] = {
			...session[sessionKey],
			...session[editKey]
		};
		delete session[editKey];
	}
};

/**
 * Deletes the /edit session key without copying anything.
 * @param {import('@pins/express').Request} request
 * @param {string} sessionKey
 */
export const clearEdits = (request, sessionKey) => {
	const editKey = `${sessionKey}/edit`;
	delete request.session[editKey];
};

/**
 * Checks if we are at the point where we started editing.
 * @param {import('@pins/express').Request} request
 * @returns {boolean}
 */
export const isAtEditEntrypoint = (request) => {
	return (
		stripQueryString(String(request.query.editEntrypoint)) === stripQueryString(request.originalUrl)
	);
};
