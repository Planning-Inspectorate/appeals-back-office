import { appealShortReference } from '#lib/appeals-formatter.js';
import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { mapNotificationBannersFromSession, sortNotificationBanners } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { generateAccordionItems } from './accordions/index.js';
import { generateCaseNotes } from './case-notes/case-notes.mapper.js';
import { generateStatusTags } from './status-tags/status-tags.mapper.js';
import { mapStatusDependentNotifications } from '#lib/mappers/utils/map-status-dependent-notifications.js';
import { formatCaseOfficerDetailsForCaseSummary } from '#lib/mappers/utils/format-case-officer-details-for-case-summary.js';

export const pageHeading = 'Case details';

/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */

/**
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {GetCaseNotesResponse} appealCaseNotes
 * @param {string} currentRoute
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('./representations/representations.service.js').Representation|undefined} [appellantFinalComments]
 * @param {import('./representations/representations.service.js').Representation|undefined} [lpaFinalComments]
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} [appellantCase]
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(
	appealDetails,
	appealCaseNotes,
	currentRoute,
	session,
	request,
	appellantFinalComments,
	lpaFinalComments,
	appellantCase
) {
	const mappedData = await initialiseAndMapAppealData(
		appealDetails,
		currentRoute,
		session,
		request,
		false,
		appellantFinalComments,
		lpaFinalComments,
		appellantCase
	);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/**
	 * @type {PageComponent}
	 */
	const caseSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'pins-summary-list--no-border',
			rows: [
				...(mappedData.appeal.caseOfficer.display.summaryListItem
					? [
							formatCaseOfficerDetailsForCaseSummary(
								mappedData.appeal.caseOfficer.display.summaryListItem
							)
					  ]
					: []),
				...(mappedData.appeal.siteAddress.display.summaryListItem
					? [mappedData.appeal.siteAddress.display.summaryListItem]
					: []),
				...(mappedData.appeal.localPlanningAuthority.display.summaryListItem
					? [mappedData.appeal.localPlanningAuthority.display.summaryListItem]
					: [])
			]
		}
	};

	const caseNotes = await generateCaseNotes(appealCaseNotes, request);
	const caseDownload = mappedData.appeal.downloadCaseFiles.display.htmlItem
		? [mappedData.appeal.downloadCaseFiles.display.htmlItem]
		: [];

	const accordion = generateAccordionItems(appealDetails, mappedData, session);

	const statusDependentNotifications = mapStatusDependentNotifications(appealDetails, request);
	const notificationBanners = sortNotificationBanners([
		...statusDependentNotifications,
		...mapNotificationBannersFromSession(session, 'appealDetails', appealDetails.appealId)
	]);

	const pageComponents = [
		...notificationBanners,
		...(await generateStatusTags(mappedData, appealDetails, request)),
		caseSummary,
		...caseDownload,
		caseNotes,
		accordion
	];

	preRenderPageComponents(pageComponents);

	return {
		title: `Case details - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Case details',
		headingClasses: 'govuk-heading-xl govuk-!-margin-bottom-3',
		pageComponents
	};
}
