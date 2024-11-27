import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { generateDecisionDocumentDownloadHtml } from '../common.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} appealDetails
 * @returns {string}
 */
function generateAppealDecisionActionListItems(appealDetails) {
	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			return `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${generateIssueDecisionUrl(
				appealDetails.appealId
			)}">Issue</a></li>`;
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			return `<li class="govuk-summary-list__actions-list-item">${generateDecisionDocumentDownloadHtml(
				appealDetails
			)}</li>`;
		}
		default: {
			return '';
		}
	}
}

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealDecision = ({ appealDetails }) =>
	documentationFolderTableItem({
		id: 'appeal-decision',
		text: 'Appeal decision',
		textClasses: 'appeal-decision-documentation',
		statusText:
			appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE ? 'Sent' : 'Awaiting decision',
		statusTextClasses: 'appeal-decision-status',
		receivedText: 'Not applicable',
		receivedTextClasses: 'appeal-decision-due-date',
		actionHtml: `<ul class="govuk-summary-list__actions-list">${generateAppealDecisionActionListItems(
			appealDetails
		)}</ul>`,
		actionHtmlClasses: 'appeal-decision-actions'
	});
