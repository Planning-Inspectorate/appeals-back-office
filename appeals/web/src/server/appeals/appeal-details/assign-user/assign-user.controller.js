import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalize, kebabCase } from 'lodash-es';
import { assignUserPage } from './assign-user.mapper.js';
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

	const mappedPageContent = await assignUserPage(appealDetails, isInspector, request.session);

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
		currentAppeal: { appealReference },
		errors,
		baseUrl,
		session: { user }
	} = request;

	const isInspector = baseUrl.includes('inspector');
	const userTypeText = isInspector ? 'inspector' : 'case officer';

	return renderCheckYourAnswersComponent(
		{
			title: `Check details and assign ${userTypeText}`,
			heading: `Check details and assign ${userTypeText}`,
			preHeading: `Appeal ${appealReference}`,
			backLinkUrl: `${baseUrl}/search-${kebabCase(userTypeText)}`,
			submitButtonText: `Assign ${userTypeText}`,
			responses: {
				[capitalize(userTypeText)]: {
					html: `${user?.name}<br>${user?.email}`,
					actions: {
						Change: {
							href: `${baseUrl}/search-${kebabCase(userTypeText)}`,
							visuallyHiddenText: 'Address'
						}
					}
				}
			}
		},
		response,
		errors
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	const {
		session: {
			user: { assigneeId }
		},
		currentAppeal: { appealId },
		baseUrl
	} = request;

	const isInspector = baseUrl.includes('inspector');

	try {
		await setAppealAssignee(request.apiClient, appealId, assigneeId, isInspector);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: `${isInspector ? 'inspector' : 'caseOfficer'}Assigned`,
			appealId
		});
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');
		return response.status(500).render('app/500.njk');
	}

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};
