import {
	applyEdits,
	clearEdits,
	editLink,
	getSessionValuesForAppeal
} from '#lib/edit-utilities.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { emailPage, namePage } from '../rule-6-parties.mapper.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(preserveQueryString(request, `${request.baseUrl}${path}`));
};

const getBackLinkUrl = backLinkGenerator('addRule6Party');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getName = async (request, response) => {
	return renderName(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderName = async (request, response) => {
	const { currentAppeal, errors } = request;

	const sessionValues = getSessionValuesForAppeal(
		request,
		'addRule6Party',
		request.currentAppeal.appealId
	);

	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/add/check-details`
	);

	const mappedPageContent = namePage(currentAppeal, backUrl, sessionValues, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postName = async (request, response) => {
	if (request.errors) {
		return renderName(request, response);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/add/email`,
			{ exclude: ['backUrl'] }
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getEmail = async (request, response) => {
	return renderEmail(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderEmail = async (request, response) => {
	const { currentAppeal, errors } = request;

	const sessionValues = getSessionValuesForAppeal(
		request,
		'addRule6Party',
		request.currentAppeal.appealId
	);

	const backUrl = getBackLinkUrl(
		request,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/add/name`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/add/check-details`
	);

	const mappedPageContent = emailPage(currentAppeal, backUrl, sessionValues, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postEmail = async (request, response) => {
	if (request.errors) {
		return renderEmail(request, response);
	}

	const { appealId } = request.currentAppeal;

	applyEdits(request, 'addRule6Party');

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/add/check-details`,
			{ exclude: ['editEntrypoint'] }
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	const { currentAppeal, errors } = request;
	const { appealId } = currentAppeal;

	clearEdits(request, 'addRule6Party');

	const sessionValues = getSessionValuesForAppeal(request, 'addRule6Party', appealId);
	const baseUrl = `/appeals-service/appeal-details/${appealId}/rule-6-parties/add`;

	const responses = {
		'Rule 6 party name': {
			value: sessionValues.organisationName,
			actions: {
				Change: {
					href: editLink(baseUrl, 'name'),
					visuallyHiddenText: 'Rule 6 party name'
				}
			}
		},
		'Rule 6 party email address': {
			value: sessionValues.email,
			actions: {
				Change: {
					href: editLink(baseUrl, 'email'),
					visuallyHiddenText: 'Rule 6 party email address'
				}
			}
		}
	};

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and add rule 6 party',
			heading: 'Check details and add rule 6 party',
			preHeading: `Appeal ${currentAppeal.appealReference} - Add rule 6 party`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/rule-6-parties/add/email`,
			submitButtonText: 'Add rule 6 party',
			responses
		},
		response,
		errors
	);
};
