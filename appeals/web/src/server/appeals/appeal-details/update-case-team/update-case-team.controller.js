import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { checkAndConfirmPage, updateCaseTeam } from './update-case-team.mapper.js';
import { getTeamList, postUpdateTeam } from './update-case-team.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getSelectCaseTeam = async (request, response) => {
	return renderSelectTeam(request, response);
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSelectCaseTeam = async (request, response) => {
	if (request.errors) {
		return renderSelectTeam(request, response);
	}
	request.session.caseTeamId = Number(request.body['case-team']);

	return response.redirect(
		`/appeals-service/appeal-details/${request.params.appealId}/case-team/edit/check`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectTeam = async (request, response) => {
	const { errors, currentAppeal } = request;

	const teamList = await getTeamList(request.apiClient);
	teamList.push({
		id: 0,
		name: 'Unassign team',
		email: 'This will remove the current case team from the appeal'
	});
	request.session.teamList = teamList;

	const mappedPageContent = await updateCaseTeam(
		currentAppeal,
		teamList,
		currentAppeal.assignedTeam?.id || null,
		errors
	);
	if (mappedPageContent) {
		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}
	return response.status(404).render('app/404.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckYourAnswers = (request, response) => {
	return renderCheckAndConfirm(request, response);
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckYourAnswers = async (request, response) => {
	if (request.errors) {
		return renderSelectTeam(request, response);
	}
	const { session, currentAppeal } = request;
	const selectedTeamId = session.caseTeamId;

	try {
		await postUpdateTeam(request.apiClient, currentAppeal.appealId, selectedTeamId);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'caseTeamUpdated',
			appealId: currentAppeal.appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${request.params.appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to update the case team'
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${request.params.appealId}/case-team/edit/check`
	);
};
/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckAndConfirm = async (request, response) => {
	try {
		const {
			currentAppeal,
			session: { caseTeamId, teamList }
		} = request;

		const mappedPageContent = checkAndConfirmPage(
			currentAppeal.appealId,
			teamList.find(
				(/** @type {(import('@pins/appeals.api').Api.CaseTeam)} */ team) => team.id === caseTeamId
			),
			currentAppeal.appealReference
		);
		console.log(caseTeamId);
		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when attempting to update the team assignment'
		);

		return response.status(500).render('app/500.njk');
	}
};
