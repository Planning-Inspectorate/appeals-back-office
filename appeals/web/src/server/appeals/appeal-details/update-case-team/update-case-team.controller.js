import { updateCaseTeam } from './update-case-team.mapper.js';
import { getTeamList } from './update-case-team.service.js';

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
