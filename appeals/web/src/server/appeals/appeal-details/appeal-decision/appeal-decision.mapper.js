import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate, getTodaysISOString } from '#lib/dates.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapDecisionOutcome } from '../issue-decision/issue-decision.utils.js';
import { buildDecisionDocumentLinkHtml } from '#lib/mappers/data/appeal/common.js';

/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} AppellantCase */
/** @typedef {import('../appeal-details.types.js').WebAppeal} Appeal */
/** @typedef {{folderId: number, documentId: string, documentName: string, letterDate: string, outcome: string}} Decision */

/**
 *
 * @param {number} appealId
 * @param {string} appealReference
 * @param {Decision} decision
 * @param {string | undefined} firstDocumentDate
 * @param {number } version
 * @returns {PageContent}
 */
export const appealDecisionPage = (
	appealId,
	appealReference,
	decision,
	firstDocumentDate,
	version
) => {
	const letterDate = decision?.letterDate
		? version > 1 && firstDocumentDate
			? `${dateISOStringToDisplayDate(firstDocumentDate)} (reissued on ${dateISOStringToDisplayDate(
					decision.letterDate
			  )})`
			: dateISOStringToDisplayDate(decision.letterDate)
		: dateISOStringToDisplayDate(getTodaysISOString());

	const baseUrl = `/appeals-service/appeal-details/${appealId}`;
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Decision'
					},
					value: {
						text: decision?.outcome && mapDecisionOutcome(decision.outcome)
					}
				},
				{
					key: {
						text: 'Decision issued date'
					},
					value: {
						text: decision?.outcome && letterDate
					}
				},
				{
					key: {
						text: 'Decision letter'
					},
					value: {
						html: buildDecisionDocumentLinkHtml(appealId, decision, decision.documentName)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `${baseUrl}/update-decision-letter/upload-decision-letter?backUrl=${baseUrl}/appeal-decision`,
								visuallyHiddenText: 'decision letter'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageComponent[]} */
	const pageComponents = [summaryListComponent];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal decision',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Appeal decision',
		pageComponents
	};

	return pageContent;
};
