import { assignUserPage } from './assign-user.mapper.js';
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

	request.session.assigneeId = request.body.user;
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
