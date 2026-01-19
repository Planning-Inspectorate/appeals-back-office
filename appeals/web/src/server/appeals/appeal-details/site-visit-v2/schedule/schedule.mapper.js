import { baseUrl } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {'unaccompanied'|'accompanied'|'accessRequired'} WebSiteVisitType
 * @typedef {string|null|undefined} ApiVisitType

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
	// const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`;
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
							text: capitalizeFirstLetter(visitType)
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
			backLinkUrl: `${baseUrl}`,
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
							text: capitalizeFirstLetter(visitType)
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
			backLinkUrl: `${baseUrl}`,
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
		inspectorName
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
