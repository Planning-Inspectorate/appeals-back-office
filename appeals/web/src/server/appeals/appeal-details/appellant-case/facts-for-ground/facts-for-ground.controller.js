import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { ChangeFactsForGroundPage } from '#appeals/appeal-details/appellant-case/facts-for-ground/facts-for-ground.mapper.js';
import { changeFactsForGround } from '#appeals/appeal-details/appellant-case/facts-for-ground/facts-for-ground.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderChangeFactsForGround = async (request, response) => {
	const { currentAppeal, apiClient, errors, body } = request;
	const { groundRef } = request.params;

	let factsForGround = body?.factsForGround;

	if (!errors) {
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);
		factsForGround = appellantCaseData?.appealGrounds?.find(
			// @ts-ignore
			({ ground }) => ground.groundRef === groundRef
		)?.factsForGround;
	}

	const mappedPageContent = ChangeFactsForGroundPage(
		currentAppeal,
		groundRef,
		factsForGround,
		errors
	);

	try {
		return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
	}

	response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeFactsForGround = async (request, response) => {
	if (request.errors) {
		return renderChangeFactsForGround(request, response);
	}

	const { appellantCaseId, appealId } = request.currentAppeal;
	const { factsForGround } = request.body;
	const { groundRef } = request.params;

	try {
		await changeFactsForGround(
			request.apiClient,
			appealId,
			appellantCaseId,
			groundRef,
			factsForGround
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		response.status(500).render('app/500.njk');
	}
};
