import { appealShortReference } from '#lib/appeals-formatter.js';
import { initialiseAndMapAppealData } from '#lib/mappers/appeal/appeal.mapper.js';
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
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(
	appealDetails,
	appealCaseNotes,
	currentRoute,
	session,
	request,
	ipCommentsAwaitingReview
) {
	const mappedData = await initialiseAndMapAppealData(appealDetails, currentRoute, session);
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const caseNotes = await generateCaseNotes(appealCaseNotes, request);
	const accordion = generateAccordionItems(
		appealDetails,
		mappedData,
		session,
		ipCommentsAwaitingReview
	);

	const pageComponents = [
		...buildNotificationBanners(session, 'appealDetails', appealDetails.appealId),
		...(await generateStatusTags(mappedData, appealDetails, request)),
		generateCaseSummary(mappedData),
		caseNotes,
		accordion
	];

	preRenderPageComponents(pageComponents);

	return {
		title: `Case details - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Case details',
		pageComponents
	};
}
