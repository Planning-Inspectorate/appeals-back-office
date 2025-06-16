import logger from '#lib/logger.js';
import { correctionNoticePage } from './update-decision-letter.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCorrectionNotice = async (request, response) => {
	renderCorrectionNotice(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCorrectionNotice = async (request, response) => {
	const { errors, currentAppeal } = request;
	const mappedPageContent = correctionNoticePage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		request.session.updateDecisionLetter?.correctionNotice || '',
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCorrectionNotice = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { correctionNotice } = request.body;
		const { errors } = request;

		/** @type {import('./update-decision-letter.types.js').UpdateDecisionLetterRequest} */
		request.session.updateDecisionLetter = {
			...request.session.updateDecisionLetter,
			correctionNotice: correctionNotice
		};

		if (errors) {
			return renderCorrectionNotice(request, response);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/update-decision-letter/check-details`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
