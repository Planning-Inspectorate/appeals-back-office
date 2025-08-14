/**
 * Store the backUrl query param the session, scoped using a specific
 * session key (to represent the flow the user is currently entering),
 * and the ID of the current appeal.
 *
 * If the `invalidateKeys` option is provided, the backUrl will be
 * cleared for the specified keys. For example if we are entering at
 * the start of a flow, but the entrypoint may also be a later step in
 * the flow, we want to clear that one if it already exists so that if
 * we click back from that step it doesn't go straight back from there
 * to another backUrl that was previously saved against that key.
 *
 * @param {string} sessionKey
 * @param {{ invalidateKeys?: string[] }} [options]
 * @returns {import('@pins/express').RequestHandler<{}>}
 */
export const saveBackUrl = (sessionKey, options) => (request, _, next) => {
	const { params, query, session } = request;
	const { appealId } = params;
	const backUrl = query?.backUrl;

	if (!backUrl) {
		return next();
	}

	const key = `backUrl/${sessionKey}`;
	if (!session[key]) {
		session[key] = {};
	}
	session[key][appealId] = backUrl;

	if (options?.invalidateKeys) {
		options.invalidateKeys.forEach((invalidateKey) => {
			delete session[`backUrl/${invalidateKey}`];
		});
	}

	next();
};

/**
 * Get the backUrl from the session, scoped using a specific session
 * key (to represent the flow the user is currently entering), and the
 * ID of the current appeal.
 * @param {import('express').Request} request
 * @param {string} sessionKey
 * @returns {string | undefined}
 */
export const getSavedBackUrl = (request, sessionKey) => {
	const { params, session } = request;
	const { appealId } = params;
	const key = `backUrl/${sessionKey}`;

	return session[key]?.[appealId];
};
