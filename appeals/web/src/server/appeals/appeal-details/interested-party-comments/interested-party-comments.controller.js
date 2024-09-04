import logger from '#lib/logger.js';
import { getPaginationParametersFromQuery } from '#lib/pagination-utilities.js';
import { interestedPartyCommentsPage } from './interested-party-comments.mapper.js';
import * as interestedPartyCommentsService from './interested-party-comments.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderInterestedPartyComments = async (request, response) => {
	const { errors, currentAppeal, query } = request;

	if (
		currentAppeal &&
		currentAppeal.appellantCaseId !== null &&
		currentAppeal.appellantCaseId !== undefined
	) {
		try {
			const [awaitingReviewComments, invalidComments, validComments] = await Promise.all([
				interestedPartyCommentsService.getInterestedPartyComments(
					request.apiClient,
					currentAppeal.appealId,
					'awaiting_review'
				),
				interestedPartyCommentsService.getInterestedPartyComments(
					request.apiClient,
					currentAppeal.appealId,
					'invalid'
				),
				interestedPartyCommentsService.getInterestedPartyComments(
					request.apiClient,
					currentAppeal.appealId,
					'valid'
				)
			]);

			const appellantCaseResponse =
				await interestedPartyCommentsService.getAppellantCaseFromAppealId(
					request.apiClient,
					currentAppeal.appealId,
					currentAppeal.appellantCaseId
				);

			const paginationParameters = getPaginationParametersFromQuery(query);
			const mappedPageContent = await interestedPartyCommentsPage(
				appellantCaseResponse,
				currentAppeal,
				request.originalUrl,
				paginationParameters,
				request.session,
				awaitingReviewComments,
				invalidComments,
				validComments
			);

			return response.status(200).render('appeals/appeal/interested-party-comments.njk', {
				pageContent: mappedPageContent,
				errors
			});
		} catch (error) {
			logger.error(error);
			return response.status(500).render('app/500.njk');
		}
	}

	return response.status(404).render('app/404.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getInterestedPartyComments = async (request, response) => {
	renderInterestedPartyComments(request, response);
};
