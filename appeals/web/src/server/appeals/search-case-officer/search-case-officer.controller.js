import usersService from '#appeals/appeal-users/users-service.js';
import { searchCaseOfficerPage } from '#appeals/search-case-officer/search-case-officer.mapper.js';
import config from '#environment/config.js';

export const getCaseOfficers = async (
	/** @type {{ session: import("../../app/auth/auth-session.service.js").SessionWithAuth; }} */
	request,
	/** @type {{ json: (arg0: { id: string; name: string; email: string; }[]) => void; }} */
	response
) => {
	const caseOfficers = await usersService.getUsersByRole(
		config.referenceData.appeals.caseOfficerGroupId,
		request.session
	);
	response.json(caseOfficers);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postAssignCaseOfficer = async (request, response) => {
	const { errors, body } = request;
	const user = body.user ? JSON.parse(body.user) : null;
	if (errors) {
		return renderViewSearchCaseOfficer(request, response);
	}
	return response.redirect(`/appeals-service/personal-list?caseOfficerId=${user.id}`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderViewSearchCaseOfficer = async (request, response) => {
	const { errors, session } = request;
	const mappedPageContent = await searchCaseOfficerPage(session, errors);

	return response.status(200).render('appeals/appeal/assign-user.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
