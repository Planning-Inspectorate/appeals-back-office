import { appealDecisionPage } from './appeal-decision.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAppealDecision = async (request, response) => {
	renderAppealDecision(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppealDecision = async (request, response) => {
	const { currentAppeal } = request;

	const mappedPageContent = appealDecisionPage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		currentAppeal.decision
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};
