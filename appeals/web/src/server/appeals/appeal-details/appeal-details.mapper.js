import { appealShortReference } from '#lib/appeals-formatter.js';
import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { buildNotificationBanners } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { generateAccordionItems } from './accordions/index.js';
import { generateCaseNotes } from './case-notes/case-notes.mapper.js';
import { generateCaseSummary } from './case-summary/case-summary.mapper.js';
import { generateStatusTags } from './status-tags/status-tags.mapper.js';

export const pageHeading = 'Case details';

/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */

/**
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {GetCaseNotesResponse} appealCaseNotes
 * @param {string} currentRoute
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('./accordions/index.js').RepresentationTypesAwaitingReview} [representationTypesAwaitingReview]
 * @param {*} [appellantFinalComments]
 * @param {*} [lpaFinalComments]
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(
	appealDetails,
	appealCaseNotes,
	currentRoute,
	session,
	request,
	representationTypesAwaitingReview,
	appellantFinalComments,
	lpaFinalComments
) {
	const mappedData = await initialiseAndMapAppealData(
		appealDetails,
		currentRoute,
		session,
		false,
		appellantFinalComments,
		lpaFinalComments
	);
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const caseNotes = await generateCaseNotes(appealCaseNotes, request);
	const caseDownload = mappedData.appeal.downloadCaseFiles.display.htmlItem
		? [mappedData.appeal.downloadCaseFiles.display.htmlItem]
		: [];

	const accordion = generateAccordionItems(
		appealDetails,
		mappedData,
		session,
		representationTypesAwaitingReview
	);

	const pageComponents = [
		...buildNotificationBanners(session, 'appealDetails', appealDetails.appealId),
		...(await generateStatusTags(mappedData, appealDetails, request)),
		generateCaseSummary(mappedData),
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
