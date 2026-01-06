import { addQueryParamsToUrl, stripQueryString } from './url-utilities.js';

/**
 * Returns the session values for the given key, or the /edit key if editing.
 * Also sets the /edit values if they do not yet exist when editing.
 * Use getSessionValuesForAppeal if scoped to an appeal.
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
 * Returns the session values for the given key, or the /edit key if editing,
 * scoped to the given appeal id. Also sets the /edit values if they do not
 * yet exist when editing.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} sessionKey
 * @param {string} appealId
 * @returns {Record<string, string>}
 */
export const getSessionValuesForAppeal = (request, sessionKey, appealId) => {
	const { query, session } = request;
	const editEntrypoint = query.editEntrypoint;
	if (editEntrypoint) {
		const editKey = `${sessionKey}/edit`;
		if (!session[editKey]) {
			session[editKey] = {};
		}
		if (!session[editKey][appealId]) {
			session[editKey][appealId] = session[sessionKey]?.[appealId] || {};
		}
		return session[editKey][appealId];
	}
	return session[sessionKey]?.[appealId] || {};
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
 * Saves any edited values to the main session key if editing, and deletes the /edit key.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} sessionKey
 */
export const applyEdits = (request, sessionKey) => {
	const { query, session } = request;
	const editKey = `${sessionKey}/edit`;
	if (session[editKey]) {
		const editValues = session[editKey];
		delete session[editKey];
		if (!query.editEntrypoint) {
			return;
		}
		session[sessionKey] = {
			...session[sessionKey],
			...editValues
		};
	}
};

/**
 * Saves any edited values to the main session key if editing, and deletes the /edit key.
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} sessionKey
 * @param {string} appealId
 */
export const applyEditsForAppeal = (request, sessionKey, appealId) => {
	const { query, session } = request;
	const editKey = `${sessionKey}/edit`;
	if (session[editKey]) {
		const editValues = session[editKey][appealId];
		delete session[editKey][appealId];
		if (!query.editEntrypoint) {
			return;
		}
		session[sessionKey][appealId] = {
			...session[sessionKey][appealId],
			...editValues
		};
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
 * Deletes the /edit session key for this appeal without copying anything.
 * @param {import('@pins/express').Request} request
 * @param {string} sessionKey
 * @param {string} appealId
 */
export const clearEditsForAppeal = (request, sessionKey, appealId) => {
	const editKey = `${sessionKey}/edit`;
	delete request.session[editKey]?.[appealId];
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
