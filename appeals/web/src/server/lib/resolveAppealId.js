/**
 * @param {import('express').Request} request - Express request object
 * @returns {string} - The resolved appeal ID
 */
export function resolveAppealId(request) {
	const fromParams = request.params?.appealId;
	const fromSession = request.session?.currentAppeal?.app;
	const id = fromParams ?? fromSession;
	return id;
}
