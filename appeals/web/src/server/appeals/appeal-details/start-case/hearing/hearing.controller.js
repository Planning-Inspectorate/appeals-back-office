import { appealProcedureToLabelText } from '#appeals/appeal-details/change-appeal-procedure-type/check-and-confirm/check-and-confirm.mapper.js';
import { sessionValuesToDateTime } from '#appeals/appeal-details/hearing/setup/set-up-hearing.controller.js';
import { hearingDatePage } from '#appeals/appeal-details/hearing/setup/set-up-hearing.mapper.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	dayMonthYearHourMinuteToISOString
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
import { preserveQueryString } from '#lib/url-utilities.js';
import { calculateAppealTimetable } from '../start-case.service.js';
import { dateKnownPage } from './hearing.mapper.js';

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

	// Answer was no so we apply any edits and proceed to CYA page
	applyEdits(request, 'startCaseAppealProcedure');
	return response.redirect(`${baseUrl}/confirm`);
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

	applyEdits(request, 'startCaseAppealProcedure');

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/start-case/hearing/confirm`
	);
};

/**
 * Generate Notify preview templates for appellant and LPA
 * @param {import('got').Got} apiClient
 * @param {object} personalisation
 * @param {boolean} dateKnown
 * @returns {Promise<{appellantTemplate: {renderedHtml: string}, lpaTemplate: {renderedHtml: string}}>}
 */
const generateStartCaseNotifyPreviews = async (apiClient, personalisation, dateKnown) => {
	const suffix = dateKnown ? '-hearing' : '';
	const appellantTemplateName = `appeal-valid-start-case-appellant${suffix}.content.md`;
	const lpaTemplateName = `appeal-valid-start-case-lpa${suffix}.content.md`;

	const [appellantTemplate, lpaTemplate] = await Promise.all([
		generateNotifyPreview(apiClient, appellantTemplateName, personalisation),
		generateNotifyPreview(apiClient, lpaTemplateName, personalisation)
	]);
	return { appellantTemplate, lpaTemplate };
};

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
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/start-case`;
	const backLinkUrl = dateKnown ? `${baseUrl}/hearing/date` : `${baseUrl}/hearing`;
	const hearingDateTime = dayMonthYearHourMinuteToISOString({
		day: sessionValues['hearing-date-day'],
		month: sessionValues['hearing-date-month'],
		year: sessionValues['hearing-date-year'],
		hour: sessionValues['hearing-time-hour'],
		minute: sessionValues['hearing-time-minute']
	});
	const timetable = await calculateAppealTimetable(
		request.apiClient,
		currentAppeal.appealId,
		sessionValues.appealProcedure
	);

	const personalisation = {
		appeal_reference_number: currentAppeal.appealReference,
		lpa_reference: currentAppeal.planningApplicationReference || '',
		site_address: appealSiteToAddressString(currentAppeal.appealSite),
		appeal_type: currentAppeal.appealType,
		local_planning_authority:
			currentAppeal.localPlanningDepartment || 'the local planning authority',
		start_date: dateISOStringToDisplayDate(timetable.startDate),
		questionnaire_due_date: dateISOStringToDisplayDate(timetable.lpaQuestionnaireDueDate),
		lpa_statement_due_date: dateISOStringToDisplayDate(timetable.lpaStatementDueDate),
		ip_comments_due_date: dateISOStringToDisplayDate(timetable.ipCommentsDueDate),
		statement_of_common_ground_due_date: dateISOStringToDisplayDate(
			timetable.statementOfCommonGroundDueDate
		),
		hearing_date: dateISOStringToDisplayDate(hearingDateTime),
		hearing_time: dateISOStringToDisplayTime12hr(hearingDateTime)
	};

	/** @type {string} */
	let appellantPreview = '';
	/** @type {string} */
	let lpaPreview = '';
	try {
		const result = await generateStartCaseNotifyPreviews(
			request.apiClient,
			personalisation,
			dateKnown
		);
		appellantPreview = result.appellantTemplate?.renderedHtml || '';
		lpaPreview = result.lpaTemplate?.renderedHtml || '';
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
								value: dateISOStringToDisplayDate(hearingDateTime),
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
								value: dateISOStringToDisplayTime12hr(hearingDateTime),
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
	return response.redirect(`/appeals-service/appeal-details/${request.currentAppeal.appealId}`);
};
