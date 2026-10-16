import {
	applyEdits,
	clearEdits,
	getSessionValues,
	isAtEditEntrypoint
} from '#lib/edit-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import {
	fieldNameCaseType,
	fieldNameSubmissionDate,
	sessionKeyCreateCase
} from './create-case.constants.js';
import { checkDetailsPage, selectCaseTypePage, submissionDatePage } from './create-case.mapper.js';
import { createCase } from './create-case.service.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(preserveQueryString(request, `${request.baseUrl}${path}`));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getSelectCaseType = async (request, response) => {
	const sessionValues = getSessionValues(request, sessionKeyCreateCase);
	return renderSelectCaseType(request, response, sessionValues?.[fieldNameCaseType]);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string | undefined} selectedCaseType
 */
export const renderSelectCaseType = (request, response, selectedCaseType) => {
	const { errors } = request;

	let backLinkUrl;
	if (isAtEditEntrypoint(request)) {
		backLinkUrl = `${request.baseUrl}/check-details`;
	} else {
		backLinkUrl =
			request.query.returnUrl || request.get('Referrer') || '/appeals-service/all-cases';

		if (
			typeof backLinkUrl !== 'string' ||
			!backLinkUrl.startsWith('/') ||
			backLinkUrl.startsWith('//')
		) {
			backLinkUrl = '/appeals-service/all-cases';
		}
	}

	const pageContent = selectCaseTypePage(backLinkUrl, selectedCaseType, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors,
		pageIsCreateCase: true
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSelectCaseType = async (request, response) => {
	if (request.errors) {
		const sessionValues = getSessionValues(request, sessionKeyCreateCase);
		return renderSelectCaseType(
			request,
			response,
			request.body?.[fieldNameCaseType] || sessionValues?.[fieldNameCaseType]
		);
	}

	applyEdits(request, sessionKeyCreateCase);

	if (isAtEditEntrypoint(request)) {
		return response.redirect(`${request.baseUrl}/check-details`);
	}

	return response.redirect(`${request.baseUrl}/submission-date`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getSubmissionDate = async (request, response) => {
	const sessionValues = getSessionValues(request, sessionKeyCreateCase);
	const submissionDate = {
		day: sessionValues?.[`${fieldNameSubmissionDate}-day`],
		month: sessionValues?.[`${fieldNameSubmissionDate}-month`],
		year: sessionValues?.[`${fieldNameSubmissionDate}-year`]
	};
	return renderSubmissionDate(request, response, submissionDate);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{ day?: string, month?: string, year?: string } | undefined} submissionDate
 */
export const renderSubmissionDate = (request, response, submissionDate) => {
	const { errors } = request;

	const backLinkUrl = isAtEditEntrypoint(request)
		? `${request.baseUrl}/check-details`
		: `${request.baseUrl}/select-case-type`;

	const pageContent = submissionDatePage(backLinkUrl, submissionDate, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors,
		pageIsCreateCase: true
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSubmissionDate = async (request, response) => {
	if (request.errors) {
		const sessionValues = getSessionValues(request, sessionKeyCreateCase);
		const submissionDate = {
			day:
				request.body?.[`${fieldNameSubmissionDate}-day`] ||
				sessionValues?.[`${fieldNameSubmissionDate}-day`],
			month:
				request.body?.[`${fieldNameSubmissionDate}-month`] ||
				sessionValues?.[`${fieldNameSubmissionDate}-month`],
			year:
				request.body?.[`${fieldNameSubmissionDate}-year`] ||
				sessionValues?.[`${fieldNameSubmissionDate}-year`]
		};
		return renderSubmissionDate(request, response, submissionDate);
	}

	applyEdits(request, sessionKeyCreateCase);

	return response.redirect(`${request.baseUrl}/check-details`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	clearEdits(request, sessionKeyCreateCase);

	const sessionValues = getSessionValues(request, sessionKeyCreateCase);
	if (!sessionValues?.[fieldNameCaseType]) {
		return response.redirect(`${request.baseUrl}/select-case-type`);
	}

	const pageContent = checkDetailsPage(request.baseUrl, sessionValues);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent,
		pageIsCreateCase: true
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	const sessionValues = getSessionValues(request, sessionKeyCreateCase);
	if (!sessionValues?.[fieldNameCaseType]) {
		return response.redirect(`${request.baseUrl}/select-case-type`);
	}

	const caseType = sessionValues[fieldNameCaseType];
	const day = sessionValues[`${fieldNameSubmissionDate}-day`];
	const month = sessionValues[`${fieldNameSubmissionDate}-month`];
	const year = sessionValues[`${fieldNameSubmissionDate}-year`];

	const submissionDate = new Date(
		Date.UTC(Number(year), Number(month) - 1, Number(day))
	).toISOString();

	// TODO: update once case type letters and schema are provided by ODW
	const result = await createCase(request.apiClient, {
		caseType,
		submissionDate
	});

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'caseCreated',
		appealId: result.appealId
	});

	delete request.session[sessionKeyCreateCase];

	return response.redirect(`/appeals-service/appeal-details/${result.appealId}`);
};
