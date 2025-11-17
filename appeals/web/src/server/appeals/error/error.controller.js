import { errorFileTypesDoNotMatchPage } from './error.mapper.js';

/** @typedef {import('@pins/appeals').Pagination} Pagination */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewError = async (request, response) => {
	const { errorType, backUrl } = request.query;

	if (errorType && errorType === 'fileTypesDoNotMatch') {
		return response.status(500).render('patterns/display-page.pattern.njk', {
			pageContent: errorFileTypesDoNotMatchPage(backUrl ? String(backUrl) : '/')
		});
	} else {
		return response.status(500).render('app/500.njk');
	}
};

/**
 * Renders a test error page based on the provided error code
 *
 * @type {import('express').RequestHandler}
 */
export const getTestErrorPage = (req, res) => {
	const { errorCode } = req.params;

	switch (errorCode) {
		case '500':
			throw new Error('This is a test 500 error');

		case '404':
			res.status(404).render('app/404');
			return;

		case '403':
			res.status(403).render('app/403');
			return;

		case '401':
			res.status(401).render('app/401');
			return;

		case '400':
			res.status(400).render('app/400');
			return;

		default:
			res
				.status(400)
				.send('Error: Unknown test error code. Supported codes are: 500, 404, 403, 401.');
			return;
	}
};
