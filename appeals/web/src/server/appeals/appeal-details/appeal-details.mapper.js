// @ts-nocheck
import { appealShortReference } from '#lib/appeals-formatter.js';
import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { mapNotificationBannersFromSession, sortNotificationBanners } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { generateAccordionItems } from './accordions/index.js';
import { generateCaseNotes } from './case-notes/case-notes.mapper.js';
import { generateStatusTags } from './status-tags/status-tags.mapper.js';
import { mapStatusDependentNotifications } from '#lib/mappers/utils/map-status-dependent-notifications.js';
import { formatCaseOfficerDetailsForCaseSummary } from '#lib/mappers/utils/format-case-officer-details-for-case-summary.js';

/** @typedef {import('./appeal-details.types.js').WebAppeal} Appeal */

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
	currentUrl,
	session,
	request,
	appellantFinalComments,
	lpaFinalComments,
	appellantCase
) {
	const mappedData = await initialiseAndMapAppealData(
		appealDetails,
		currentUrl,
		session,
		request,
		false,
		appellantFinalComments,
		lpaFinalComments,
		appellantCase
	);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent} */
	const caseSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'pins-summary-list--no-border',
			rows: [
				...(mappedData.appeal.caseOfficer?.display?.summaryListItem
					? [
							formatCaseOfficerDetailsForCaseSummary(
								mappedData.appeal.caseOfficer.display.summaryListItem
							)
					  ]
					: []),
				...(mappedData.appeal.siteAddress?.display?.summaryListItem
					? [mappedData.appeal.siteAddress.display.summaryListItem]
					: []),
				...(mappedData.appeal.localPlanningAuthority?.display?.summaryListItem
					? [mappedData.appeal.localPlanningAuthority.display.summaryListItem]
					: [])
			]
		}
	};

	const caseNotes = await generateCaseNotes(appealCaseNotes, request);

	// 1. Get the existing "Download case" button component object. It might be undefined.
	const caseDownloadComponent = mappedData.appeal.downloadCaseFiles?.display?.htmlItem;

	// 2. Create the HTML for our new link.
	const downloadAllPdfsLinkHtml = `
        <a class="govuk-link"
           href="/appeals-service/appeal-details/${appealDetails.appealId}/download-all-generated-pdfs"
           role="button"
           data-cy="download-all-generated-pdfs">
          Download all generated PDFs as ZIP
        </a>
    `;

	// 3. If the original "Download case" component exists, append our new link to its HTML content.
	if (caseDownloadComponent && caseDownloadComponent.parameters?.html) {
		const originalHtml = caseDownloadComponent.parameters.html;
		caseDownloadComponent.parameters.html = `
            ${originalHtml}
            <p class="govuk-body" style="margin-top: 15px;">${downloadAllPdfsLinkHtml}</p>
        `;
	}
	// Note: If caseDownloadComponent does NOT exist, we currently do not add our button.
	// This is the safest way to avoid the crash. If the button needs to appear even when
	// "Download case" doesn't, we would need a different strategy.

	const accordion = generateAccordionItems(appealDetails, mappedData, session);
	const statusDependentNotifications = mapStatusDependentNotifications(appealDetails, request);
	const notificationBanners = sortNotificationBanners([
		...statusDependentNotifications,
		...mapNotificationBannersFromSession(session, 'appealDetails', appealDetails.appealId)
	]);
	const statusTags = await generateStatusTags(mappedData, appealDetails, request);

	/** @type {PageComponent[]} */
	const pageComponents = [
		...notificationBanners,
		...(statusTags || []),
		caseSummary,
		caseDownloadComponent,
		caseNotes,
		accordion
	].filter(Boolean);

	preRenderPageComponents(pageComponents);

	return {
		title: `Case details - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Case details',
		headingClasses: 'govuk-heading-xl govuk-!-margin-bottom-3',
		pageComponents
	};
}
