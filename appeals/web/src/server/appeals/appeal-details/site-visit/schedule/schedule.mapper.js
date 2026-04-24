import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { dateInput, yesNoInput } from '#lib/mappers/index.js';
import {
	capitalizeFirstLetter,
	formatFirstInitialLastName,
	padNumberWithZero
} from '#lib/string-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { mapVisitTypeToReadable } from '../site-visit.mapper.js';
import { siteVisitDateField } from '../site-visits.constants.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {'unaccompanied'|'accompanied'|'accessRequired'} WebSiteVisitType
 * @typedef {string|null|undefined} ApiVisitType
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {string} appealReference
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {import('@pins/express/types/express.js').Request['session']} session
 * @param {string | undefined} backlinkUrl
 * @returns {PageContent}
 * @description
 */
export function knowDateTimePage(appealDetails, appealReference, errors, session, backlinkUrl) {
	const shortAppealReference = appealShortReference(appealReference);
	const dateTimeKnown = session.dateTimeKnown || appealDetails.siteVisit ? 'yes' : 'no';
	/** @type {PageContent} */
	return {
		title: `Do you know the date and time of the site visit?`,
		backLinkUrl: backlinkUrl,
		preHeading: `Appeal ${shortAppealReference}  - set up site visit`,
		pageComponents: [
			yesNoInput({
				name: 'dateTimeRadio',
				legendText: 'Do you know the date and time of the site visit?',
				legendIsPageHeading: true,
				value: dateTimeKnown,
				errorMessage: errors?.dateTimeRadio?.msg
			})
		]
	};
}

/**
 *
 * @param {*} appealDetails
 * @param {*} appealReference
 * @param {*} errors
 * @param {*} session
 * @param {*} backLinkUrl
 * @returns {PageContent}
 */
export function scheduleVisitDateTimePage(
	appealDetails,
	appealReference,
	errors,
	session,
	backLinkUrl
) {
	let shortAppealReference = appealShortReference(appealReference);
	const { day, month, year } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitDate
	);
	let { hour: startTimeHour, minute: startTimeMinute } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitStartTime
	);
	let { hour: endTimeHour, minute: endTimeMinute } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitEndTime
	);

	startTimeHour = startTimeHour !== undefined ? padNumberWithZero(startTimeHour) : undefined;
	startTimeMinute = startTimeMinute !== undefined ? padNumberWithZero(startTimeMinute) : undefined;
	endTimeHour = endTimeHour !== undefined ? padNumberWithZero(endTimeHour) : undefined;
	endTimeMinute = endTimeMinute !== undefined ? padNumberWithZero(endTimeMinute) : undefined;

	let visitType = session.visitType || appealDetails.siteVisit?.visitType;
	let readyToSetUp = session.readyToSetUp || false;
	let visitDateDay = appealDetails.siteVisit?.visitDate ? day : undefined;
	let visitDateMonth = appealDetails.siteVisit?.visitDate ? month : undefined;
	let visitDateYear = appealDetails.siteVisit?.visitDate ? year : undefined;
	let visitStartTimeHour = appealDetails.siteVisit?.visitStartTime ? startTimeHour : undefined;
	let visitStartTimeMinute = appealDetails.siteVisit?.visitStartTime ? startTimeMinute : undefined;
	let visitEndTimeHour = appealDetails.siteVisit?.visitEndTime ? endTimeHour : undefined;
	let visitEndTimeMinute = appealDetails.siteVisit?.visitEndTime ? endTimeMinute : undefined;

	// /** @type {PageComponent} */
	const selectDateComponent = dateInput({
		name: siteVisitDateField,
		id: siteVisitDateField,
		namePrefix: siteVisitDateField,
		value: {
			day: visitDateDay,
			month: visitDateMonth,
			year: visitDateYear
		},
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		errors: errors
	});

	const selectStartTimeComponent = timeInput({
		id: 'visit-start-time',
		value: { hour: visitStartTimeHour, minute: visitStartTimeMinute },
		legendText: visitType === 'unaccompanied' ? 'Time (optional)' : 'Start time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true,
		errorMessage: errors?.['visit-start-time-hour']?.msg,
		hint: 'For example, 9:00 or 13:15'
	});

	const selectEndTimeComponent = timeInput({
		id: 'visit-end-time',
		value: { hour: visitEndTimeHour, minute: visitEndTimeMinute },
		legendText: !(visitType === 'accessRequired' && readyToSetUp)
			? 'End time (optional)'
			: 'End time',
		legendClasses: 'govuk-fieldset__legend--m',
		fieldsetClasses: 'govuk-!-margin-bottom-6',
		showLabels: true,
		errorMessage: errors?.['visit-end-time-hour']?.msg,
		hint: 'For example, 9:00 or 13:15'
	});

	/** @type {PageContent} */
	const pageContent = {
		heading: `Date and time`,
		title: `Date and time`,
		backLinkUrl: backLinkUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - set up site visit`,
		submitButtonText: 'Continue',
		pageComponents: [
			selectDateComponent,
			selectStartTimeComponent,
			...(visitType === 'accompanied' ||
			visitType === 'accessRequired' ||
			(visitType === 'accessRequired' && readyToSetUp)
				? [selectEndTimeComponent]
				: [])
		]
	};
	return pageContent;
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageContent}
 * @description
 */
export function checkAndConfirmSiteVisitPage(request) {
	const {
		currentAppeal,
		session: {
			dateTimeKnown,
			visitType,
			visitEndTimeHour,
			visitEndTimeMinute,
			visitStartTimeHour,
			visitStartTimeMinute,
			visitDateDay,
			visitDateMonth,
			visitDateYear
		}
	} = request;
	const backLinkUrl = getBackLinkUrlFromQuery(request);

	if (dateTimeKnown === 'no') {
		/**@type {PageComponent} */
		const summaryListComponent = {
			type: 'summary-list',
			parameters: {
				rows: [
					{
						key: {
							text: 'Type'
						},
						value: {
							text: mapVisitTypeToReadable(visitType)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule-visit`,
									text: 'Change',
									visuallyHiddenText: 'Type of site visit'
								}
							]
						}
					},
					{
						key: {
							text: 'Do you know the date and time of the site visit?'
						},
						value: {
							text: capitalizeFirstLetter(dateTimeKnown)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule`,
									text: 'Change',
									visuallyHiddenText: 'Do you know the date and time of the site visit?'
								}
							]
						}
					}
				]
			}
		};

		/**@type {PageComponent[]} */
		const pageComponents = [summaryListComponent];

		return {
			title: 'Check details and confirm site visit',
			backLinkUrl: backLinkUrl,
			preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
			heading: 'Check details and confirm site visit',
			submitButtonText: 'Confirm',
			pageComponents
		};
	} else {
		const hasStartTime = visitStartTimeHour !== '' && visitStartTimeMinute !== '';
		const hasEndTime = visitEndTimeHour !== '' && visitEndTimeMinute !== '';
		const hasVisitDate = visitDateDay !== '' && visitDateMonth !== '' && visitDateYear !== '';
		/** @type {PageComponent} */
		const summaryListComponent = {
			type: 'summary-list',
			parameters: {
				rows: [
					{
						key: {
							text: 'Type'
						},
						value: {
							text: mapVisitTypeToReadable(visitType)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule-visit`,
									text: 'Change',
									visuallyHiddenText: 'Type of site visit'
								}
							]
						}
					},
					{
						key: {
							text: 'Do you know the date and time of the site visit?'
						},
						value: {
							text: capitalizeFirstLetter(dateTimeKnown)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule`,
									text: 'Change',
									visuallyHiddenText: 'Do you know the date and time of the site visit?'
								}
							]
						}
					},
					{
						key: {
							text: 'Date'
						},
						...(hasVisitDate
							? {
									value: {
										text: mapDateToDisplayFormat(visitDateDay, visitDateMonth, visitDateYear)
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date`,
												text: 'Change',
												visuallyHiddenText: 'Do you know the date and time of the site visit?'
											}
										]
									}
								}
							: {
									value: {
										html: `<ul class="govuk-list"><li><a href='/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date' class='govuk-link'>Enter date</a></li></ul>`
									}
								})
					},
					{
						key: {
							text: 'Time'
						},
						...(hasStartTime
							? {
									value: { text: `${visitStartTimeHour}:${visitStartTimeMinute}` },
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date`,
												text: 'Change',
												visuallyHiddenText: 'Start time'
											}
										]
									}
								}
							: {
									value: {
										html: `<ul class="govuk-list"><li><a href='/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date' class='govuk-link'>Enter time</a></li></ul>`
									}
								})
					},
					...(hasEndTime
						? [
								{
									key: {
										text: 'End time'
									},
									value: {
										text: `${visitEndTimeHour}:${visitEndTimeMinute}`
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date`,
												text: 'Change',
												visuallyHiddenText: 'End time'
											}
										]
									}
								}
							]
						: [])
				]
			}
		};

		/** @type {PageComponent} */
		const bodyCopyComponent = {
			type: 'html',
			parameters: {
				html: `<p class="govuk-body">We'll send an email to the appellant and LPA to tell them about the site visit.</p>`
			}
		};
		/**@type {PageComponent[]} */
		const pageComponents = [
			summaryListComponent,
			...(hasVisitDate && hasStartTime ? [bodyCopyComponent] : [])
		];
		return {
			title: 'Check details and confirm site visit',
			backLinkUrl: backLinkUrl,
			preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
			heading: 'Check details and confirm site visit',
			submitButtonText: 'Set up site visit',
			pageComponents: pageComponents
		};
	}
}
/**
 * @param {string} appealId
 * @param {string} visitDateDay
 * @param {string} visitDateMonth
 * @param {string} visitDateYear
 * @param {string} visitStartTimeHour
 * @param {string} visitStartTimeMinute
 * @param {string} visitEndTimeHour
 * @param {string} visitEndTimeMinute
 * @param {WebSiteVisitType} visitType
 * @param {string} inspectorName
 * @returns {import('../site-visit.service.js').UpdateOrCreateSiteVisitParameters}
 */
export function mapPostScheduleOrManageSiteVisitCommonParameters(
	appealId,
	visitDateDay,
	visitDateMonth,
	visitDateYear,
	visitStartTimeHour,
	visitStartTimeMinute,
	visitEndTimeHour,
	visitEndTimeMinute,
	visitType,
	inspectorName
) {
	return {
		appealIdNumber: parseInt(appealId, 10),
		visitDate: dayMonthYearHourMinuteToISOString({
			day: visitDateDay,
			month: visitDateMonth,
			year: visitDateYear
		}),
		visitStartTime:
			visitStartTimeHour && visitStartTimeMinute
				? dayMonthYearHourMinuteToISOString({
						day: visitDateDay,
						month: visitDateMonth,
						year: visitDateYear,
						hour: visitStartTimeHour,
						minute: visitStartTimeMinute
					})
				: '',
		visitEndTime:
			visitEndTimeHour && visitEndTimeMinute
				? dayMonthYearHourMinuteToISOString({
						day: visitDateDay,
						month: visitDateMonth,
						year: visitDateYear,
						hour: visitEndTimeHour,
						minute: visitEndTimeMinute
					})
				: '',
		apiVisitType: mapWebVisitTypeToApiVisitType(visitType),
		previousVisitType: '',
		inspectorName: formatFirstInitialLastName(inspectorName)
	};
}
/**
 *
 * @param {WebSiteVisitType} webVisitType
 * @returns {import('@pins/appeals/types/inspector.js').SiteVisitType}
 */
export function mapWebVisitTypeToApiVisitType(webVisitType) {
	switch (webVisitType) {
		case 'accessRequired':
			return 'access required';
		default:
			return webVisitType;
	}
}
/**
 * @param {import('../site-visit.service.js').UpdateOrCreateSiteVisitParameters} updateOrCreateSiteVisitParameters
 * @param {ApiVisitType | undefined} oldApiVisitType
 */
export function setPreviousVisitTypeIfChanged(updateOrCreateSiteVisitParameters, oldApiVisitType) {
	if (
		oldApiVisitType &&
		updateOrCreateSiteVisitParameters.apiVisitType &&
		oldApiVisitType.toLowerCase() !== updateOrCreateSiteVisitParameters.apiVisitType.toLowerCase()
	) {
		updateOrCreateSiteVisitParameters.previousVisitType = oldApiVisitType;
	}
}
/**
 * @param {string} day
 * @param {string} month
 * @param {string} year
 * @returns {string}
 */
function mapDateToDisplayFormat(day, month, year) {
	return new Date(
		parseInt(year, 10),
		parseInt(month, 10) - 1,
		parseInt(day, 10)
	).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}
