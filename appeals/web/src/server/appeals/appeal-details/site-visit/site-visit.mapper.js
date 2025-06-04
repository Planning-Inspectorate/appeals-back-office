import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { dateInput, removeSummaryListActions } from '#lib/mappers/index.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { padNumberWithZero } from '#lib/string-utilities.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { capitalize } from 'lodash-es';
import {
	dayMonthYearHourMinuteToISOString,
	dateISOStringToDayMonthYearHourMinute
} from '#lib/dates.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { siteVisitDateField } from './site-visits.constants.js';
/**
 * @typedef {'unaccompanied'|'accompanied'|'accessRequired'} WebSiteVisitType
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {string|null|undefined} ApiVisitType
 */

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
 *
 * @param {ApiVisitType} getApiVisitType
 * @returns {WebSiteVisitType | null}
 */
export function mapGetApiVisitTypeToWebVisitType(getApiVisitType) {
	switch (getApiVisitType) {
		case 'Unaccompanied':
			return 'unaccompanied';
		case 'Access required':
			return 'accessRequired';
		case 'Accompanied':
			return 'accompanied';
		default:
			return null;
	}
}

/**
 * @param {'schedule' | 'manage'} pageType
 * @param {Appeal} appealDetails
 * @param {string} currentRoute
 * @param {string|undefined} backUrl
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {WebSiteVisitType|null|undefined} visitType
 * @param {string|number|null|undefined} visitDateDay
 * @param {string|number|null|undefined} visitDateMonth
 * @param {string|number|null|undefined} visitDateYear
 * @param {string|number|null|undefined} visitStartTimeHour
 * @param {string|number|null|undefined} visitStartTimeMinute
 * @param {string|number|null|undefined} visitEndTimeHour
 * @param {string|number|null|undefined} visitEndTimeMinute
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {Promise<PageContent>}
 */
export async function scheduleOrManageSiteVisitPage(
	pageType,
	appealDetails,
	currentRoute,
	backUrl,
	session,
	request,
	visitType,
	visitDateDay,
	visitDateMonth,
	visitDateYear,
	visitStartTimeHour,
	visitStartTimeMinute,
	visitEndTimeHour,
	visitEndTimeMinute,
	errors
) {
	const mappedData = await initialiseAndMapAppealData(
		appealDetails,
		currentRoute,
		session,
		request,
		true
	);
	const titlePrefix = capitalize(pageType);

	visitType ??= mapGetApiVisitTypeToWebVisitType(appealDetails.siteVisit?.visitType);

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

	visitDateDay ??= appealDetails.siteVisit?.visitDate ? day : undefined;
	visitDateMonth ??= appealDetails.siteVisit?.visitDate ? month : undefined;
	visitDateYear ??= appealDetails.siteVisit?.visitDate ? year : undefined;
	visitStartTimeHour ??= appealDetails.siteVisit?.visitStartTime ? startTimeHour : undefined;
	visitStartTimeMinute ??= appealDetails.siteVisit?.visitStartTime ? startTimeMinute : undefined;
	visitEndTimeHour ??= appealDetails.siteVisit?.visitEndTime ? endTimeHour : undefined;
	visitEndTimeMinute ??= appealDetails.siteVisit?.visitEndTime ? endTimeMinute : undefined;

	/**
	 * @type {(SummaryListRowProperties)[]}
	 */

	/** @type {PageComponent} */
	const siteInformationComponent = {
		type: 'details',
		parameters: {
			summaryText: 'Site information',
			html: '',
			pageComponents: [
				{
					type: 'summary-list',
					parameters: {
						classes: 'govuk-summary-list--no-border',
						rows: [
							mappedData.appeal.siteAddress.display.summaryListItem,
							mappedData.appeal.lpaHealthAndSafety.display.summaryListItem,
							mappedData.appeal.appellantHealthAndSafety.display.summaryListItem,
							mappedData.appeal.lpaNeighbouringSites.display.summaryListItem,
							mappedData.appeal.inspectorNeighbouringSites.display.summaryListItem
						].map(removeSummaryListActions)
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: 'visit-type',
			idPrefix: 'visit-type',
			fieldset: {
				legend: {
					text: 'Select visit type',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			value: visitType,
			items: [
				{
					value: 'unaccompanied',
					text: 'Unaccompanied'
				},
				{
					value: 'accessRequired',
					text: 'Access Required'
				},
				{
					value: 'accompanied',
					text: 'Accompanied'
				}
			]
		}
	};

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
		legendText: 'Select date',
		hint: 'For example, 27 3 2023',
		errors: errors
	});

	/** @type {PageComponent} */
	const selectTimeHtmlComponent = {
		type: 'html',
		parameters: {
			html: '<h2>Select time</h2><p class="govuk-hint">Optional for unaccompanied visits</p><p class="govuk-hint">Use the 24-hour clock. For example 16:30</p>'
		}
	};

	const selectStartTimeComponent = timeInput({
		id: 'visit-start-time',
		value: { hour: visitStartTimeHour, minute: visitStartTimeMinute },
		legendText: 'Start time',
		legendClasses: 'govuk-fieldset__legend--s',
		fieldsetClasses: 'govuk-!-margin-bottom-4',
		showLabels: false
	});

	const selectEndTimeComponent = timeInput({
		id: 'visit-end-time',
		value: { hour: visitEndTimeHour, minute: visitEndTimeMinute },
		legendText: 'End time',
		legendClasses: 'govuk-fieldset__legend--s',
		fieldsetClasses: 'govuk-!-margin-bottom-6',
		showLabels: false
	});

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming will inform the relevant parties of the site visit '
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `${titlePrefix} site visit - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `${titlePrefix} site visit`,
		submitButtonText: 'Confirm',
		prePageComponents: [siteInformationComponent],
		pageComponents: [
			selectVisitTypeComponent,
			selectDateComponent,
			selectTimeHtmlComponent,
			selectStartTimeComponent,
			selectEndTimeComponent,
			insetTextComponent
		]
	};

	if (pageContent.prePageComponents) {
		preRenderPageComponents(pageContent.prePageComponents);
	}

	return pageContent;
}

/**
 * @typedef {'new'|'unchanged'|'visit-type'|'date-time'|'all'} SiteVisitConfirmationPageType
 */

/**
 * @param {string} pageType
 * @returns {pageType is SiteVisitConfirmationPageType}
 */
export function stringIsSiteVisitConfirmationPageType(pageType) {
	return (
		pageType === 'new' ||
		pageType === 'unchanged' ||
		pageType === 'visit-type' ||
		pageType === 'date-time' ||
		pageType === 'all'
	);
}

/**
 * @param {SiteVisitConfirmationPageType} pageType
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function scheduleOrManageSiteVisitConfirmationPage(pageType, appealDetails) {
	/** @type {PageContent} */
	const pageContent = {
		title: '',
		pageComponents: []
	};

	/** @type {PageComponent} */
	const bodyCopyComponent = {
		type: 'html',
		parameters: {
			html: '<p class="govuk-body">The relevant parties have been informed. The case timetable has been updated.</p>'
		}
	};

	/** @type {PageComponent} */
	const backToCaseDetailsComponent = {
		type: 'html',
		parameters: {
			html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealDetails.appealId}">Go back to case details</a></p>`
		}
	};

	switch (pageType) {
		case 'new':
			pageContent.title = 'Site visit scheduled';
			pageContent.pageComponents = [
				{
					type: 'panel',
					parameters: {
						titleText: 'Site visit scheduled',
						headingLevel: 1,
						html: `Appeal reference<br><strong>${appealShortReference(
							appealDetails.appealReference
						)}</strong>`
					}
				},
				bodyCopyComponent,
				backToCaseDetailsComponent
			];
			break;
		case 'unchanged':
			pageContent.title = 'No changes made';
			pageContent.pageComponents = [
				{
					type: 'panel',
					parameters: {
						titleText: 'No changes made',
						headingLevel: 1,
						html: `Appeal reference<br><strong>${appealShortReference(
							appealDetails.appealReference
						)}</strong>`
					}
				},
				{
					type: 'html',
					parameters: {
						html: `<p class="govuk-body">No emails have been sent.</p>`
					}
				},
				backToCaseDetailsComponent
			];
			break;
		case 'visit-type':
			pageContent.title = 'Site visit type changed';
			pageContent.pageComponents = [
				{
					type: 'panel',
					parameters: {
						titleText: 'Site visit type changed',
						headingLevel: 1,
						html: `Appeal reference<br><strong>${appealShortReference(
							appealDetails.appealReference
						)}</strong>`
					}
				},
				bodyCopyComponent,
				backToCaseDetailsComponent
			];
			break;
		case 'date-time':
			pageContent.title = 'Site visit rescheduled';
			pageContent.pageComponents = [
				{
					type: 'panel',
					parameters: {
						titleText: 'Site visit rescheduled',
						headingLevel: 1,
						html: `Appeal reference<br><strong>${appealShortReference(
							appealDetails.appealReference
						)}</strong>`
					}
				},
				bodyCopyComponent,
				backToCaseDetailsComponent
			];
			break;
		case 'all':
		default:
			pageContent.title = 'Site visit changed';
			pageContent.pageComponents = [
				{
					type: 'panel',
					parameters: {
						titleText: 'Site visit changed',
						headingLevel: 1,
						html: `Appeal reference<br><strong>${appealShortReference(
							appealDetails.appealReference
						)}</strong>`
					}
				},
				bodyCopyComponent,
				backToCaseDetailsComponent
			];
			break;
	}

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function siteVisitBookedPage(appealId, appealReference) {
	return {
		title: 'Site visit is booked already',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Site visit is booked already',
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">Manage the site visit to change visit type, date or time.</p>`
				}
			},
			{
				type: 'button',
				parameters: {
					text: 'Manage the site visit',
					href: `/appeals-service/appeal-details/${appealId}/site-visit/manage-visit`,
					classes: 'govuk-!-margin-top-3'
				}
			}
		]
	};
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
 * @returns {import('./site-visit.service.js').UpdateOrCreateSiteVisitParameters}
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
				: undefined,
		visitEndTime:
			visitEndTimeHour && visitEndTimeMinute
				? dayMonthYearHourMinuteToISOString({
						day: visitDateDay,
						month: visitDateMonth,
						year: visitDateYear,
						hour: visitEndTimeHour,
						minute: visitEndTimeMinute
				  })
				: undefined,
		apiVisitType: mapWebVisitTypeToApiVisitType(visitType),
		previousVisitType: '',
		inspectorName
	};
}

/**
 * @typedef {'unchanged'|'visit-type'|'date-time'|'all'} SiteVisitChangeType
 */

/**
 * @typedef {Object} BannerTypeAndChangeType
 * @property {import('#lib/mappers/components/page-components/notification-banners.mapper.js').NotificationBannerDefinitionKey} bannerType
 * @property {SiteVisitChangeType} changeType
 */

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('./site-visit.service.js').UpdateOrCreateSiteVisitParameters} updateOrCreateSiteVisitParameters
 * @returns {BannerTypeAndChangeType}
 */
export function getSiteVisitSuccessBannerTypeAndChangeType(
	appealDetails,
	updateOrCreateSiteVisitParameters
) {
	/**
	 * @type {BannerTypeAndChangeType}
	 */
	const bannerTypeAndChangeType = {
		bannerType: 'siteVisitChangedDefault',
		changeType: 'unchanged'
	};
	const oldVisitDate = appealDetails.siteVisit?.visitDate;
	const oldVisitStartTime = appealDetails.siteVisit?.visitStartTime;
	const oldVisitEndTime = appealDetails.siteVisit?.visitEndTime;
	const oldApiVisitType = appealDetails.siteVisit?.visitType;
	const visitTypeChanged =
		oldApiVisitType &&
		updateOrCreateSiteVisitParameters.apiVisitType &&
		oldApiVisitType.toLowerCase() !== updateOrCreateSiteVisitParameters.apiVisitType.toLowerCase();
	const dateTimeChanged =
		oldVisitDate !== updateOrCreateSiteVisitParameters.visitDate ||
		(!(oldVisitStartTime === null && updateOrCreateSiteVisitParameters.visitStartTime === '') &&
			oldVisitStartTime !== updateOrCreateSiteVisitParameters.visitStartTime) ||
		(!(oldVisitEndTime === null && updateOrCreateSiteVisitParameters.visitEndTime === '') &&
			oldVisitEndTime !== updateOrCreateSiteVisitParameters.visitEndTime);

	if (visitTypeChanged && !dateTimeChanged) {
		bannerTypeAndChangeType.bannerType = 'siteVisitTypeChanged';
		bannerTypeAndChangeType.changeType = 'visit-type';
	} else if (!visitTypeChanged && dateTimeChanged) {
		bannerTypeAndChangeType.bannerType = 'siteVisitRescheduled';
		bannerTypeAndChangeType.changeType = 'date-time';
	} else if (visitTypeChanged && dateTimeChanged) {
		bannerTypeAndChangeType.bannerType = 'siteVisitChangedDefault';
		bannerTypeAndChangeType.changeType = 'all';
	} else {
		bannerTypeAndChangeType.bannerType = 'siteVisitNoChanges';
		bannerTypeAndChangeType.changeType = 'unchanged';
	}

	if (visitTypeChanged) {
		updateOrCreateSiteVisitParameters.previousVisitType = oldApiVisitType;
	}

	return bannerTypeAndChangeType;
}

/**
 * @param {import('./site-visit.service.js').UpdateOrCreateSiteVisitParameters} updateOrCreateSiteVisitParameters
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
