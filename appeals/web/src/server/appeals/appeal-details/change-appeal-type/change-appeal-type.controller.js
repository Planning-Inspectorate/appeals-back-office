import {
	dayMonthYearHourMinuteToDisplayDate,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	addHorizonReferencePage,
	appealTypePage,
	changeAppealFinalDatePage,
	changeAppealMarkAppealInvalidPage,
	changeAppealTransferAppealPage,
	checkTransferPage,
	invalidChangeAppealType,
	resubmitAppealPage
} from './change-appeal-type.mapper.js';
import {
	getAppealTypes,
	getNoResubmitAppealRequestRedirectUrl,
	postAppealChangeRequest,
	postAppealTransferConfirmation,
	postAppealTransferRequest
} from './change-appeal-type.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAppealType = async (request, response) => {
	return renderAppealType(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAppealType = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { appealType } = request.body;
		const { errors } = request;

		if (errors) {
			return renderAppealType(request, response);
		}

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			appealId,
			...request.session.changeAppealType,
			appealTypeId: parseInt(appealType, 10)
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/resubmit`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAppealType = async (request, response) => {
	const { errors } = request;
	const appealId = request.params.appealId;
	const appealData = request.currentAppeal;
	const appealTypes = await getAppealTypes(request.apiClient);

	if (!appealTypes) {
		throw new Error('error retrieving Appeal Types');
	}

	if (
		request.session?.changeAppealType?.appealId &&
		request.session?.changeAppealType?.appealId !== appealId
	) {
		request.session.changeAppealType = {};
	}

	const validAppealChangeTypeStatuses = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION
	];

	if (validAppealChangeTypeStatuses.includes(appealData.appealStatus)) {
		const mappedPageContent = appealTypePage(
			appealData,
			appealTypes,
			request.session.changeAppealType,
			errors ? errors['appealType'].msg : undefined
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} else {
		const pageContent = invalidChangeAppealType(appealData);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getResubmitAppeal = async (request, response) => {
	return renderResubmitAppeal(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postResubmitAppeal = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { appealResubmit } = request.body;
		const { errors } = request;

		if (errors) {
			return renderResubmitAppeal(request, response);
		}

		const isResubmit = appealResubmit === 'true';

		if (!isResubmit) {
			const redirectUrl = await getNoResubmitAppealRequestRedirectUrl(
				request.apiClient,
				request.session.changeAppealType.appealTypeId,
				appealId
			);
			return response.redirect(redirectUrl);
		}

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			...request.session.changeAppealType,
			resubmit: isResubmit
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/mark-appeal-invalid`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderResubmitAppeal = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;
	const mappedPageContent = resubmitAppealPage(
		appealData,
		request.session.changeAppealType,
		errors ? errors['appealResubmit'].msg : undefined
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAppealFinalDate = async (request, response) => {
	return renderChangeAppealFinalDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAppealFinalDate = async (request, response) => {
	try {
		const { appealId } = request.params;
		const {
			'change-appeal-final-date-day': day,
			'change-appeal-final-date-month': month,
			'change-appeal-final-date-year': year
		} = request.body;
		const { errors } = request;

		if (errors) {
			return renderChangeAppealFinalDate(request, response);
		}

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			...request.session.changeAppealType,
			day,
			month,
			year
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/check-change-appeal-final-date`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAppealFinalDate = async (request, response) => {
	const { errors } = request;
	let changeDay = '';
	let changeMonth = '';
	let changeYear = '';

	// Present when the post request errors
	const {
		'change-appeal-final-date-day': bodyChangeDay,
		'change-appeal-final-date-month': bodyChangeMonth,
		'change-appeal-final-date-year': bodyChangeYear
	} = request.body;

	// Present when navigating back to this page
	/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
	const {
		day: sessionDay,
		month: sessionMonth,
		year: sessionYear
	} = request.session.changeAppealType;

	const appealData = request.currentAppeal;

	if (bodyChangeDay && bodyChangeMonth && bodyChangeYear) {
		changeDay = bodyChangeDay;
		changeMonth = bodyChangeMonth;
		changeYear = bodyChangeYear;
	} else if (sessionDay && sessionMonth && sessionYear) {
		changeDay = sessionDay;
		changeMonth = sessionMonth;
		changeYear = sessionYear;
	}

	const mappedPageContent = changeAppealFinalDatePage(
		appealData,
		changeDay,
		changeMonth,
		changeYear,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddHorizonReference = async (request, response) => {
	return renderAddHorizonReference(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddHorizonReference = async (request, response) => {
	const { errors } = request;
	const appealData = request.currentAppeal;
	const horizonReference =
		appealData.transferStatus?.transferredAppealReference ||
		request.session.changeAppealType?.transferredAppealHorizonReference;

	const mappedPageContent = addHorizonReferencePage(
		appealData,
		getBackLinkUrlFromQuery(request),
		horizonReference
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddHorizonReference = async (request, response) => {
	try {
		const {
			errors,
			params: { appealId },
			body: { 'horizon-reference': horizonReference }
		} = request;

		if (request.body.problemWithHorizon) {
			return response.status(500).render('app/500.njk', {
				titleCopy: 'Sorry, there is a problem with Horizon',
				additionalCtas: [
					{
						href: `/appeals-service/appeal-details/${appealId}`,
						text: 'Go back to case overview'
					}
				],
				hideDefaultCta: true
			});
		}

		if (errors) {
			return renderAddHorizonReference(request, response);
		}

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			...request.session.changeAppealType,
			transferredAppealHorizonReference: horizonReference
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/check-transfer`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckTransfer = async (request, response) => {
	return renderCheckTransfer(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckTransfer = async (request, response) => {
	if (
		!('changeAppealType' in request.session) ||
		!('transferredAppealHorizonReference' in request.session.changeAppealType)
	) {
		return response.status(500).render('app/500.njk');
	}

	const { errors } = request;

	const appealData = request.currentAppeal;
	const mappedPageContent = await checkTransferPage(
		appealData,
		request.session.changeAppealType.transferredAppealHorizonReference
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckTransfer = async (request, response) => {
	try {
		if (
			!('changeAppealType' in request.session) ||
			!('transferredAppealHorizonReference' in request.session.changeAppealType)
		) {
			return response.status(500).render('app/500.njk');
		}

		const {
			errors,
			params: { appealId }
		} = request;

		if (errors) {
			return renderCheckTransfer(request, response);
		}

		await postAppealTransferConfirmation(
			request.apiClient,
			appealId,
			request.session.changeAppealType.transferredAppealHorizonReference
		);

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {};

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appealMarkedAsTransferred',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getMarkAppealInvalid = async (request, response) => {
	const {
		errors,
		session: { changeAppealType }
	} = request;
	const appealData = request.currentAppeal;
	const appealTypes = await getAppealTypes(request.apiClient);
	const changeAppeal = appealTypes.find(
		(appealType) => appealType.id === parseInt(changeAppealType.appealTypeId)
	);

	if (!changeAppeal) {
		logger.error('error');
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = changeAppealMarkAppealInvalidPage(
		appealData,
		appealData.appealType.toLowerCase(),
		changeAppeal.type
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postMarkAppealInvalid = (request, response) => {
	try {
		const { appealId } = request.params;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/change-appeal-final-date`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getTransferAppeal = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;

	const mappedPageContent = changeAppealTransferAppealPage(appealData);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postTransferAppeal = async (request, response) => {
	const { session } = request;

	try {
		const { appealId } = request.params;
		const appealTypeId = parseInt(request.session.changeAppealType.appealTypeId, 10);

		await postAppealTransferRequest(request.apiClient, appealId, appealTypeId);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'appealMarkedAsAwaitingTransfer',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckChangeAppealFinalDate = async (request, response) => {
	try {
		const appealData = request.currentAppeal;
		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		const { day, month, year } = request.session.changeAppealType;
		const { errors } = request;

		const backLinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-type/change-appeal-final-date`;
		const formattedDate = dayMonthYearHourMinuteToDisplayDate({ day, month, year });

		/** @type {{ [key: string]: {value?: string, actions?: { [text: string]: { href: string, visuallyHiddenText: string } }} }} */
		let responses = {
			'Deadline to resubmit appeal': {
				value: formattedDate,
				actions: {
					Change: {
						href: backLinkUrl,
						visuallyHiddenText: 'Deadline to resubmit appeal'
					}
				}
			}
		};

		return renderCheckYourAnswersComponent(
			{
				title: 'Check details and update timetable due dates',
				heading: 'Check details and update timetable due dates',
				preHeading: `Appeal ${appealData.appealReference}`,
				backLinkUrl,
				submitButtonText: 'Mark appeal as invalid',
				responses,
				after: [
					simpleHtmlComponent(
						'p',
						{ class: 'govuk-body' },
						`We will send an email to the appellant to tell them that they need to resubmit a new appeal by ${formattedDate}.`
					)
				]
			},
			response,
			errors
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckChangeAppealFinalDate = async (request, response) => {
	try {
		const { appealId } = request.params;
		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		const { day, month, year } = request.session.changeAppealType;
		const { errors } = request;

		if (errors) {
			return renderChangeAppealFinalDate(request, response);
		}
		const appealTypeId = parseInt(request.session.changeAppealType.appealTypeId, 10);

		await postAppealChangeRequest(
			request.apiClient,
			appealId,
			appealTypeId,
			dayMonthYearHourMinuteToISOString({
				year,
				month,
				day
			})
		);

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {};

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'issuedDecisionInvalid',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
