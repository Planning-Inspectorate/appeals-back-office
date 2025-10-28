import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { assignUserPage, checkAndConfirmPage } from './assign-user.mapper.js';
import { setAppealAssignee } from './assign-user.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 */
const renderAssignUser = async (request, response, isInspector = false) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	if (!appealDetails) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = await assignUserPage(
		appealDetails,
		isInspector,
		request.session,
		errors
	);

	return response.status(200).render('appeals/appeal/assign-user.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignCaseOfficer = async (request, response) => {
	renderAssignUser(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignInspector = async (request, response) => {
	renderAssignUser(request, response, true);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 */
export const postAssignUser = async (request, response, isInspector = false) => {
	const { errors, currentAppeal } = request;
	const userTypeText = isInspector ? 'inspector' : 'case-officer';

	if (errors) {
		return renderAssignUser(request, response, isInspector);
	}
	request.session.user = JSON.parse(request.body.user);

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/assign-${userTypeText}/check-details`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignCaseOfficer = async (request, response) => {
	postAssignUser(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignInspector = async (request, response) => {
	postAssignUser(request, response, true);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	const {
		currentAppeal,
		errors,
		baseUrl,
		session: { user }
	} = request;

	const mappedPageContent = checkAndConfirmPage(
		currentAppeal.appealId,
		user,
		currentAppeal.appealReference,
		baseUrl
	);
	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	const {
		session: {
			user: { id }
		},
		currentAppeal: { appealId },
		baseUrl
	} = request;

	const isInspector = baseUrl.includes('inspector');

	try {
		await setAppealAssignee(request.apiClient, appealId, id, isInspector);
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: `${isInspector ? 'inspector' : 'caseOfficer'}${
				id == 0 ? 'Removed' : 'Assigned'
			}`,
			appealId
		});
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');
		return response.status(500).render('app/500.njk');
	}

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};
