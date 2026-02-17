import { appealProcedureToLabelText } from '#appeals/appeal-details/change-procedure-type/change-procedure-check-and-confirm/change-procedure-check-and-confirm.mapper.js';
import { sessionValuesToDateTime } from '#appeals/appeal-details/hearing/setup/set-up-hearing.controller.js';
import { hearingDatePage } from '#appeals/appeal-details/hearing/setup/set-up-hearing.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	dayMonthYearHourMinuteToISOString,
	getTodaysISOString
} from '#lib/dates.js';
import {
	applyEdits,
	editLink,
	getSessionValuesForAppeal,
	isAtEditEntrypoint
} from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { detailsComponent } from '#lib/mappers/components/page-components/details.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { capitalize } from 'lodash-es';
import { getStartCaseNotifyPreviews, setStartDate } from '../start-case.service.js';
import { dateKnownPage, estimationPage } from './hearing.mapper.js';

/** @typedef {import('@pins/express').ValidationErrors} ValidationErrors */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} prevPagePath
 * @returns {string}
 */
const getBackLinkUrl = (request, prevPagePath) => {
	const baseUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}/start-case`;
	return isAtEditEntrypoint(request) ? `${baseUrl}/hearing/confirm` : `${baseUrl}/${prevPagePath}`;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDateKnown = async (request, response) => {
	return renderHearingDateKnown(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingDateKnown = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const backLinkUrl = getBackLinkUrl(request, 'select-procedure');
	const sessionValues = getSessionValuesForAppeal(
		request,
		'startCaseAppealProcedure',
		appealDetails.appealId
	);

	const mappedPageContent = dateKnownPage(appealDetails, backLinkUrl, sessionValues);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingDateKnown = async (request, response) => {
	if (request.errors) {
		return renderHearingDateKnown(request, response);
	}

	const { appealId } = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealId}/start-case/hearing`;

	if (request.body.dateKnown === 'yes') {
		// Answer was yes so we progress to the next page
		return response.redirect(preserveQueryString(request, `${baseUrl}/date`));
	}

	// Answer was no so we skip date and proceed to estimation
	return response.redirect(preserveQueryString(request, `${baseUrl}/estimation`));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDate = async (request, response) => {
	return renderHearingDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingDate = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const backLinkUrl = getBackLinkUrl(request, 'hearing');
	const sessionValues = getSessionValuesForAppeal(
		request,
		'startCaseAppealProcedure',
		appealDetails.appealId
	);
	const values = sessionValues
		? sessionValuesToDateTime(sessionValues)
		: request.currentAppeal.hearing;

	const mappedPageContent = hearingDatePage(appealDetails, values, backLinkUrl, {
		title: 'Hearing date and time - start case',
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)} - start case`,
		heading: 'Hearing date and time'
	});

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingDate = async (request, response) => {
	if (request.errors) {
		return renderHearingDate(request, response);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/start-case/hearing/estimation`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingEstimation = async (request, response) => {
	return renderHearingEstimation(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingEstimation = async (request, response) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const sessionValues = getSessionValuesForAppeal(
		request,
		'startCaseAppealProcedure',
		appealDetails.appealId
	);
	const backLinkUrl = getBackLinkUrl(
		request,
		sessionValues?.dateKnown === 'yes' ? 'hearing/date' : 'hearing'
	);

	const mappedPageContent = estimationPage(appealDetails, backLinkUrl, errors, sessionValues || {});

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingEstimation = async (request, response) => {
	if (request.errors) {
		return renderHearingEstimation(request, response);
	}

	const { appealId } = request.currentAppeal;

	applyEdits(request, 'startCaseAppealProcedure');

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/start-case/hearing/confirm`
	);
};

/**
 * @param {Record<string, string>} sessionValues
 * @returns {string}
 */
const hearingStartTimeFromSession = (sessionValues) =>
	dayMonthYearHourMinuteToISOString({
		day: sessionValues['hearing-date-day'],
		month: sessionValues['hearing-date-month'],
		year: sessionValues['hearing-date-year'],
		hour: sessionValues['hearing-time-hour'],
		minute: sessionValues['hearing-time-minute']
	});

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingConfirm = async (request, response) => {
	const { currentAppeal } = request;
	const sessionValues = getSessionValuesForAppeal(
		request,
		'startCaseAppealProcedure',
		currentAppeal.appealId
	);
	const dateKnown = sessionValues?.dateKnown === 'yes';
	const hearingEstimationYesNo = sessionValues?.hearingEstimationYesNo;
	const hearingEstimationDays = sessionValues?.hearingEstimationDays;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/start-case`;
	const backLinkUrl = `${baseUrl}/hearing/estimation`;
	const hearingStartTime = hearingStartTimeFromSession(sessionValues);
	const hearingEstimatedDays = hearingEstimationYesNo === 'yes' ? hearingEstimationDays : undefined;

	const errorMessage = 'Failed to generate email preview';

	/** @type {string} */
	let appellantPreview = errorMessage;
	/** @type {string} */
	let lpaPreview = errorMessage;
	try {
		const result = await getStartCaseNotifyPreviews(
			request.apiClient,
			currentAppeal.appealId,
			undefined,
			sessionValues?.appealProcedure,
			dateKnown ? hearingStartTime : undefined,
			hearingEstimatedDays
		);
		appellantPreview = result.appellant || '';
		lpaPreview = result.lpa || '';
	} catch (error) {
		logger.error(error);
	}

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and start case',
			heading: 'Check details and start case',
			preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
			backLinkUrl,
			submitButtonText: 'Start case',
			responses: {
				'Appeal procedure': {
					value: appealProcedureToLabelText(sessionValues.appealProcedure),
					actions: {
						Change: {
							href: editLink(baseUrl, 'select-procedure'),
							visuallyHiddenText: 'Appeal procedure',
							attributes: {
								'data-cy': 'change-appeal-procedure'
							}
						}
					}
				},
				'Do you know the date and time of the hearing?': {
					value: dateKnown ? 'Yes' : 'No',
					actions: {
						Change: {
							href: editLink(baseUrl, 'hearing'),
							visuallyHiddenText: 'Do you know the date and time of the hearing?',
							attributes: {
								'data-cy': 'change-date-known'
							}
						}
					}
				},
				...(dateKnown
					? {
							'Hearing date': {
								value: dateISOStringToDisplayDate(hearingStartTime),
								actions: {
									Change: {
										href: editLink(baseUrl, 'hearing/date'),
										visuallyHiddenText: 'Hearing date',
										attributes: {
											'data-cy': 'change-hearing-date'
										}
									}
								}
							},
							'Hearing time': {
								value: dateISOStringToDisplayTime12hr(hearingStartTime),
								actions: {
									Change: {
										href: editLink(baseUrl, 'hearing/date'),
										visuallyHiddenText: 'Hearing time',
										attributes: {
											'data-cy': 'change-hearing-time'
										}
									}
								}
							}
						}
					: {}),
				'Do you know the expected number of days to carry out the hearing?': {
					value: capitalize(hearingEstimationYesNo || ''),
					actions: {
						Change: {
							href: editLink(baseUrl, 'hearing/estimation'),
							visuallyHiddenText:
								'Do you know the expected number of days to carry out the hearing?',
							attributes: {
								'data-cy': 'change-hearing-estimation-known'
							}
						}
					}
				},
				...(hearingEstimationYesNo === 'yes'
					? {
							'Expected number of days to carry out the hearing': {
								value: hearingEstimationDays || '',
								actions: {
									Change: {
										href: editLink(baseUrl, 'hearing/estimation'),
										visuallyHiddenText: 'Expected number of days to carry out the hearing',
										attributes: {
											'data-cy': 'change-hearing-estimation-days'
										}
									}
								}
							}
						}
					: {})
			},
			after: [
				simpleHtmlComponent(
					'p',
					{
						class: 'govuk-body',
						'data-cy': 'start-timetable-info'
					},
					'We’ll start the timetable now and send emails to the relevant parties.'
				),
				detailsComponent({
					summaryText: `Preview email to appellant`,
					html: appellantPreview
				}),
				detailsComponent({
					summaryText: `Preview email to LPA`,
					html: lpaPreview
				})
			]
		},
		response
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingConfirm = async (request, response) => {
	try {
		const {
			currentAppeal: { appealId }
		} = request;

		const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

		if (!sessionValues?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		const hearingEstimatedDays =
			sessionValues?.hearingEstimationYesNo === 'yes'
				? sessionValues?.hearingEstimationDays
				: undefined;

		const hearingStartTime =
			sessionValues?.dateKnown === 'yes' ? hearingStartTimeFromSession(sessionValues) : undefined;

		await setStartDate(
			request.apiClient,
			appealId,
			getTodaysISOString(),
			sessionValues?.appealProcedure,
			hearingStartTime,
			hearingEstimatedDays
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'timetableStarted',
			appealId
		});
		if (hearingStartTime) {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'hearingSetUp',
				appealId
			});
		}

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the check details and start case page'
		);

		return response.status(500).render('app/500.njk');
	}
};
