import logger from '#lib/logger.js';
import usersService from '../../appeal-users/users-service.js';
import config from '#environment/config.js';
import { setAppealAssignee } from './assign-user.service.js';
import {
	assignOrUnassignUserCheckAndConfirmPage,
	assignUserPage,
	assignNewUserPage
} from './assign-user.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 * @param {Object<string, any>[]} [usersMatchingSearchTerm]
 */
const renderAssignUser = async (
	request,
	response,
	isInspector = false,
	usersMatchingSearchTerm
) => {
	const {
		errors,
		body: { searchTerm }
	} = request;

	const appealDetails = request.currentAppeal;

	if (!appealDetails) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = await assignUserPage(
		appealDetails,
		isInspector,
		Array.isArray(usersMatchingSearchTerm),
		searchTerm,
		usersMatchingSearchTerm || [],
		appealDetails[isInspector ? 'inspector' : 'caseOfficer'],
		request.session
	);

	return response.status(200).render('appeals/appeal/assign-user.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 * @param {boolean} [isUnassign]
 */
const renderAssignOrUnassignUserCheckAndConfirm = async (
	request,
	response,
	isInspector = false,
	isUnassign = false
) => {
	try {
		const {
			errors,
			params: { assigneeId }
		} = request;

		const groupId = isInspector
			? config.referenceData.appeals.inspectorGroupId
			: config.referenceData.appeals.caseOfficerGroupId;

		const appealDetails = request.currentAppeal;
		const user = await usersService.getUserByRoleAndId(groupId, request.session, assigneeId);

		if (appealDetails && assigneeId) {
			let existingUser = null;
			const existingUserId = isInspector ? appealDetails.inspector : appealDetails.caseOfficer;

			if (existingUserId) {
				existingUser = await usersService.getUserByRoleAndId(
					groupId,
					request.session,
					existingUserId
				);
			}

			const mappedPageContent = assignOrUnassignUserCheckAndConfirmPage(
				request.params.appealId,
				appealDetails?.appealReference,
				user,
				existingUser,
				isInspector,
				isUnassign,
				errors
			);

			return response
				.status(200)
				.render('appeals/appeal/confirm-assign-unassign-user.njk', mappedPageContent);
		}

		return response.status(404).render('app/404.njk');
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');

		return response.status(500).render('app/500.njk');
	}
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
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 */
export const postAssignUser = async (request, response, isInspector = false) => {
	const { errors } = request;

	if (errors) {
		return renderAssignUser(request, response, isInspector);
	}

	try {
		const { searchTerm } = request.body;
		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		const userGroupId = isInspector
			? config.referenceData.appeals.inspectorGroupId
			: config.referenceData.appeals.caseOfficerGroupId;
		const users = await usersService.getUsersByRole(userGroupId, request.session);
		const matchingUsers = users.filter(
			(user) =>
				user.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
				user.email?.toLowerCase().includes(lowerCaseSearchTerm)
		);

		return renderAssignUser(request, response, isInspector, matchingUsers);
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');

		return response.status(500).render('app/500.njk');
	}
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
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 * @param {boolean} [isUnassign]
 */
export const postAssignOrUnassignUserCheckAndConfirm = async (
	request,
	response,
	isInspector = false,
	isUnassign = false
) => {
	const { errors } = request;

	if (errors) {
		return renderAssignOrUnassignUserCheckAndConfirm(request, response, isInspector, isUnassign);
	}

	try {
		const {
			body: { confirm },
			params: { assigneeId },
			currentAppeal: { appealId }
		} = request;

		if (confirm === 'yes') {
			await setAppealAssignee(
				request.apiClient,
				appealId,
				isUnassign ? null : assigneeId,
				isInspector
			);

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: `${isInspector ? 'inspector' : 'caseOfficer'}${
					isUnassign ? 'Removed' : 'Added'
				}`,
				appealId
			});

			return response.redirect(
				isUnassign
					? `/appeals-service/appeal-details/${appealId}/assign-new-user/${
							isInspector ? 'inspector' : 'case-officer'
					  }`
					: `/appeals-service/appeal-details/${appealId}`
			);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/assign-user/${
				isInspector ? 'inspector' : 'case-officer'
			}`
		);
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignCaseOfficerCheckAndConfirm = async (request, response) => {
	renderAssignOrUnassignUserCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignInspectorCheckAndConfirm = async (request, response) => {
	renderAssignOrUnassignUserCheckAndConfirm(request, response, true);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignCaseOfficerCheckAndConfirm = async (request, response) => {
	postAssignOrUnassignUserCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignInspectorCheckAndConfirm = async (request, response) => {
	postAssignOrUnassignUserCheckAndConfirm(request, response, true);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getUnassignCaseOfficerCheckAndConfirm = async (request, response) => {
	renderAssignOrUnassignUserCheckAndConfirm(request, response, false, true);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getUnassignInspectorCheckAndConfirm = async (request, response) => {
	renderAssignOrUnassignUserCheckAndConfirm(request, response, true, true);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postUnassignCaseOfficerCheckAndConfirm = async (request, response) => {
	postAssignOrUnassignUserCheckAndConfirm(request, response, false, true);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postUnassignInspectorCheckAndConfirm = async (request, response) => {
	postAssignOrUnassignUserCheckAndConfirm(request, response, true, true);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 */
const renderAssignNewUser = async (request, response, isInspector = false) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	if (appealDetails) {
		const mappedPageContent = assignNewUserPage(
			request.params.appealId,
			appealDetails?.appealReference,
			isInspector,
			errors
		);

		if (appealDetails) {
			return response.status(200).render('appeals/appeal/assign-new-user.njk', mappedPageContent);
		}
	}

	return response.status(404).render('app/404.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignNewCaseOfficer = async (request, response) => {
	renderAssignNewUser(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAssignNewInspector = async (request, response) => {
	renderAssignNewUser(request, response, true);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {boolean} [isInspector]
 */
export const postAssignNewUser = async (request, response, isInspector = false) => {
	const { errors } = request;

	if (errors) {
		return renderAssignNewUser(request, response, isInspector);
	}

	try {
		const {
			body: { confirm },
			params: { appealId }
		} = request;

		if (confirm === 'yes') {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/assign-user/${
					isInspector ? 'inspector' : 'case-officer'
				}`
			);
		}

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error, error instanceof Error ? error.message : 'Something went wrong');

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignNewCaseOfficer = async (request, response) => {
	postAssignNewUser(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignNewInspector = async (request, response) => {
	postAssignNewUser(request, response, true);
};
