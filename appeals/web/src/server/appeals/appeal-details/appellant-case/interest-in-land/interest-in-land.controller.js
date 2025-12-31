import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { manageInterestInLandPage } from './interest-in-land.mapper.js';
import { changeInterestInLand } from './interest-in-land.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInterestInLand = async (request, response) => {
	return renderManagerInterestInLand(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManagerInterestInLand = async (request, response) => {
	const { currentAppeal, errors } = request;

	const mappedPageContents = manageInterestInLandPage(currentAppeal, errors);
	return response
		.status(errors ? 400 : 200)
		.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInterestInLand = async (request, response) => {
	const { currentAppeal, errors } = request;

	if (errors) {
		return renderManagerInterestInLand(request, response);
	}

	const otherSelected =
		request.body['interestInLandRadio'] === 'other' && request.body['interestInLandOther'];
	const radioSelection = otherSelected
		? request.body['interestInLandOther']
		: request.body['interestInLandRadio'];
	const { appealId, appellantCaseId } = currentAppeal;

	try {
		await changeInterestInLand(request.apiClient, appealId, appellantCaseId, radioSelection);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
