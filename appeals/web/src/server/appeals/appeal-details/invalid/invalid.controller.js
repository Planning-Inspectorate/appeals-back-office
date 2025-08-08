import { mapInvalidAppealReasonsPage } from './invalid.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInvalidAppealReasonsPage = async (request, response) => {
	return renderInvalidAppealReasonsPage(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderInvalidAppealReasonsPage = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const appealId = currentAppeal.appealId;
	const mappedPageContent = mapInvalidAppealReasonsPage(
		currentAppeal,
		session,
		errors ? errors['appealInvalidReasons'].msg : undefined
	);

	if (!appealId || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInvalidAppealReasons = async (request, response) => {
	request.session.appealInvalidReasons = request.body['appealInvalidReasons'];

	if (request.errors) {
		return renderInvalidAppealReasonsPage(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/invalid/check`
	);
};
