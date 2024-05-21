import { initialiseAndMapAppealData } from '#lib/mappers/appeal.mapper.js';
import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { capitalize } from 'lodash-es';
import { hourMinuteToApiDateString, dayMonthYearToApiDateString } from '#lib/dates.js';

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
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {WebSiteVisitType|null|undefined} visitType
 * @param {string|null|undefined} visitDateDay
 * @param {string|null|undefined} visitDateMonth
 * @param {string|null|undefined} visitDateYear
 * @param {string|null|undefined} visitStartTimeHour
 * @param {string|null|undefined} visitStartTimeMinute
 * @param {string|null|undefined} visitEndTimeHour
 * @param {string|null|undefined} visitEndTimeMinute
 * @returns {Promise<PageContent>}
 */
export async function scheduleOrManageSiteVisitPage(
	pageType,
	appealDetails,
	currentRoute,
	session,
	visitType,
	visitDateDay,
	visitDateMonth,
	visitDateYear,
	visitStartTimeHour,
	visitStartTimeMinute,
	visitEndTimeHour,
	visitEndTimeMinute
) {
	const mappedData = await initialiseAndMapAppealData(appealDetails, currentRoute, session, true);
	const titlePrefix = capitalize(pageType);

	visitType ??= mapGetApiVisitTypeToWebVisitType(appealDetails.siteVisit?.visitType);
	visitDateDay ??= appealDetails.siteVisit?.visitDate
		? new Date(appealDetails.siteVisit?.visitDate).getDate().toString()
		: undefined;
	visitDateMonth ??= appealDetails.siteVisit?.visitDate
		? (new Date(appealDetails.siteVisit?.visitDate).getMonth() + 1).toString()
		: undefined;
	visitDateYear ??= appealDetails.siteVisit?.visitDate
		? new Date(appealDetails.siteVisit?.visitDate).getFullYear().toString()
		: undefined;
	visitStartTimeHour ??= appealDetails.siteVisit?.visitStartTime
		? appealDetails.siteVisit?.visitStartTime.split(':')[0]?.toString()
		: undefined;
	visitStartTimeMinute ??= appealDetails.siteVisit?.visitStartTime
		? appealDetails.siteVisit?.visitStartTime.split(':')[1]?.toString()
		: undefined;
	visitEndTimeHour ??= appealDetails.siteVisit?.visitEndTime
		? appealDetails.siteVisit?.visitEndTime.split(':')[0]?.toString()
		: undefined;
	visitEndTimeMinute ??= appealDetails.siteVisit?.visitEndTime
		? appealDetails.siteVisit?.visitEndTime.split(':')[1]?.toString()
		: undefined;

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
						].map((row) => removeSummaryListActions(row))
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
			id: 'visit-type',
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

	/** @type {PageComponent} */
	const selectDateComponent = {
		type: 'date-input',
		parameters: {
			id: 'visit-date',
			namePrefix: 'visit-date',
			fieldset: {
				legend: {
					text: 'Select date',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			hint: {
				text: 'For example, 27 3 2023'
			},
			items: [
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'day',
					value: visitDateDay || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'month',
					value: visitDateMonth || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
					name: 'year',
					value: visitDateYear || ''
				}
			]
		}
	};

	/** @type {PageComponent} */
	const selectTimeHtmlComponent = {
		type: 'html',
		parameters: {
			html: '<h2>Select time</h2><p class="govuk-hint">Optional for unaccompanied visits</p><p class="govuk-hint">Use the 24-hour clock. For example 16:30</p>'
		}
	};

	/** @type {PageComponent} */
	const selectStartTimeComponent = {
		type: 'time-input',
		wrapperHtml: {
			opening:
				'<fieldset class="govuk-fieldset govuk-!-margin-bottom-4"><legend class="govuk-fieldset__legend govuk-fieldset__legend--s">Start time</legend>',
			closing: '</fieldset>'
		},
		parameters: {
			id: 'visit-start-time',
			hour: {
				value: visitStartTimeHour
			},
			minute: {
				value: visitStartTimeMinute
			}
		}
	};

	/** @type {PageComponent} */
	const selectEndTimeComponent = {
		type: 'time-input',
		wrapperHtml: {
			opening:
				'<fieldset class="govuk-fieldset govuk-!-margin-bottom-6"><legend class="govuk-fieldset__legend govuk-fieldset__legend--s">End time</legend>',
			closing: '</fieldset>'
		},
		parameters: {
			id: 'visit-end-time',
			hour: {
				value: visitEndTimeHour
			},
			minute: {
				value: visitEndTimeMinute
			}
		}
	};

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
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `${titlePrefix} site visit`,
		submitButtonText: 'Confirm',
		pageComponents: [
			siteInformationComponent,
			selectVisitTypeComponent,
			selectDateComponent,
			selectTimeHtmlComponent,
			selectStartTimeComponent,
			selectEndTimeComponent,
			insetTextComponent
		]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
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
 * @param {Appeal} appealDetails
 * @param {string|undefined} visitType
 * @returns {PageContent}
 */
export function setVisitTypePage(appealDetails, visitType) {
	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: 'visit-type',
			fieldset: {
				legend: {
					text: 'Select visit type',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: 'unaccompanied',
					text: 'Unaccompanied',
					checked: visitType === 'unaccompanied'
				},
				{
					value: 'accessRequired',
					text: 'Access required',
					checked: visitType === 'accessRequired'
				},
				{
					value: 'accompanied',
					text: 'Accompanied',
					checked: visitType === 'accompanied'
				}
			]
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Select site visit type - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Select site visit type',
		pageComponents: [selectVisitTypeComponent]
	};

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
	visitType
) {
	return {
		appealIdNumber: parseInt(appealId, 10),
		visitDate: dayMonthYearToApiDateString({
			day: parseInt(visitDateDay, 10),
			month: parseInt(visitDateMonth, 10),
			year: parseInt(visitDateYear, 10)
		}),
		visitStartTime: hourMinuteToApiDateString(visitStartTimeHour, visitStartTimeMinute),
		visitEndTime: hourMinuteToApiDateString(visitEndTimeHour, visitEndTimeMinute),
		apiVisitType: mapWebVisitTypeToApiVisitType(visitType),
		previousVisitType: ''
	};
}

/**
 * @typedef {'unchanged'|'visit-type'|'date-time'|'all'} ScheduleOrManageSiteVisitConfirmationPageType
 */

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('./site-visit.service.js').UpdateOrCreateSiteVisitParameters} updateOrCreateSiteVisitParameters
 * @returns {ScheduleOrManageSiteVisitConfirmationPageType}
 */
export function mapPostScheduleOrManageSiteVisitConfirmationPageType(
	appealDetails,
	updateOrCreateSiteVisitParameters
) {
	const oldVisitDate = appealDetails.siteVisit?.visitDate;

	// TODO: Tech debt (BOAT-981): align date conversion to use date-fns
	const oldVisitDateString = String(oldVisitDate) && String(oldVisitDate).split('T')[0];

	const oldApiVisitType = appealDetails.siteVisit?.visitType;
	const oldVisitStartTime = appealDetails.siteVisit?.visitStartTime;
	const oldVisitEndTime = appealDetails.siteVisit?.visitEndTime;
	const visitTypeChanged =
		oldApiVisitType &&
		updateOrCreateSiteVisitParameters.apiVisitType &&
		oldApiVisitType.toLowerCase() !== updateOrCreateSiteVisitParameters.apiVisitType.toLowerCase();
	const dateTimeChanged =
		oldVisitDateString !== updateOrCreateSiteVisitParameters.visitDate ||
		(!(oldVisitStartTime === null && updateOrCreateSiteVisitParameters.visitStartTime === '') &&
			oldVisitStartTime !== updateOrCreateSiteVisitParameters.visitStartTime) ||
		(!(oldVisitEndTime === null && updateOrCreateSiteVisitParameters.visitEndTime === '') &&
			oldVisitEndTime !== updateOrCreateSiteVisitParameters.visitEndTime);

	/** @type {ScheduleOrManageSiteVisitConfirmationPageType} */
	let confirmationPageTypeToRender = 'unchanged';

	if (visitTypeChanged && !dateTimeChanged) {
		confirmationPageTypeToRender = 'visit-type';
	} else if (!visitTypeChanged && dateTimeChanged) {
		confirmationPageTypeToRender = 'date-time';
	} else if (visitTypeChanged && dateTimeChanged) {
		confirmationPageTypeToRender = 'all';
	}

	if (visitTypeChanged) {
		updateOrCreateSiteVisitParameters.previousVisitType = oldApiVisitType;
	}

	return confirmationPageTypeToRender;
}
