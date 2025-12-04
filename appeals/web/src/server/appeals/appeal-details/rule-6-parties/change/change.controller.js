import {
	applyEdits,
	clearEdits,
	editLink,
	getSessionValuesForAppeal
} from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { emailPage, namePage } from '../rule-6-parties.mapper.js';
import { updateRule6Party } from '../rule-6-parties.service.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(preserveQueryString(request, `${request.baseUrl}${path}`));
};

const getBackLinkUrl = backLinkGenerator('changeRule6Party');

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
	const { currentAppeal, errors, params } = request;
	const rule6PartyId = Number(params.rule6PartyId);
	const rule6Party = currentAppeal.appealRule6Parties.find(
		(/** @type {AppealRule6Party} */ rule6Party) => rule6Party.id === rule6PartyId
	);

	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeRule6Party',
		request.currentAppeal.appealId
	);

	const values = {
		organisationName: sessionValues.organisationName ?? rule6Party.serviceUser.organisationName
	};

	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/change/${rule6PartyId}/check-details`
	);

	const mappedPageContent = namePage(currentAppeal, 'Update', backUrl, values, errors);

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
	const { rule6PartyId } = request.params;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/change/${rule6PartyId}/email`,
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
	const { currentAppeal, errors, params } = request;
	const rule6PartyId = Number(params.rule6PartyId);
	const rule6Party = currentAppeal.appealRule6Parties.find(
		(/** @type {AppealRule6Party} */ rule6Party) => rule6Party.id === rule6PartyId
	);
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeRule6Party',
		request.currentAppeal.appealId
	);

	const values = {
		email: sessionValues.email ?? rule6Party.serviceUser.email
	};

	const backUrl = getBackLinkUrl(
		request,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/change/${rule6PartyId}/name`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/rule-6-parties/change/${rule6PartyId}/check-details`
	);

	const mappedPageContent = emailPage(currentAppeal, 'Update', backUrl, values, errors);

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
	const { rule6PartyId } = request.params;

	applyEdits(request, 'changeRule6Party');

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/change/${rule6PartyId}/check-details`,
			{ exclude: ['editEntrypoint'] }
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	const { currentAppeal, errors, params } = request;
	const { appealId } = currentAppeal;
	const rule6PartyId = Number(params.rule6PartyId);

	clearEdits(request, 'changeRule6Party');

	const sessionValues = getSessionValuesForAppeal(request, 'changeRule6Party', appealId);
	const baseUrl = `/appeals-service/appeal-details/${appealId}/rule-6-parties/change/${rule6PartyId}`;

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
			title: 'Check details and update rule 6 party',
			heading: 'Check details and update rule 6 party',
			preHeading: `Appeal ${currentAppeal.appealReference} - Update rule 6 party`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/rule-6-parties/change/${rule6PartyId}/email`,
			submitButtonText: 'Change rule 6 party',
			responses
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
	const { currentAppeal, params } = request;
	const { appealId } = currentAppeal;
	const rule6PartyId = params.rule6PartyId;
	const sessionValues = getSessionValuesForAppeal(request, 'changeRule6Party', appealId);

	try {
		await updateRule6Party(request, rule6PartyId, sessionValues);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'rule6PartyUpdated',
			appealId
		});

		delete request.session.changeRule6Party;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
