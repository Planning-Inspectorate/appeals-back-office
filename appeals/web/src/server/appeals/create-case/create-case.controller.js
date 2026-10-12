import { getSessionValues } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import {
	fieldNameCaseType,
	fieldNameSubmissionDate,
	sessionKeyCreateCase
} from './create-case.constants.js';
import { selectCaseTypePage, submissionDatePage } from './create-case.mapper.js';

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

	let backLinkUrl =
		request.query.returnUrl || request.get('Referrer') || '/appeals-service/all-cases';

	if (
		typeof backLinkUrl !== 'string' ||
		!backLinkUrl.startsWith('/') ||
		backLinkUrl.startsWith('//')
	) {
		backLinkUrl = '/appeals-service/all-cases';
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

	return response.redirect('/appeals-service/create-a-case/submission-date');
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

	const backLinkUrl = `${request.baseUrl}/select-case-type`;

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

	return response.redirect('/appeals-service/create-a-case/check-details');
};
