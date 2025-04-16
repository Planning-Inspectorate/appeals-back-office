import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealDecision = ({ appealDetails }) => {
	const actionText = (() => {
		switch (appealDetails.appealStatus) {
			case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
				return 'Issue';
			case APPEAL_CASE_STATUS.INVALID:
			case APPEAL_CASE_STATUS.COMPLETE:
				return 'View';
			default:
				return null;
		}
	})();

	return documentationFolderTableItem({
		id: 'appeal-decision',
		text: 'Decision',
		textClasses: 'appeal-decision-documentation',
		statusText:
			appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE ||
			appealDetails.appealStatus === APPEAL_CASE_STATUS.INVALID
				? 'Issued'
				: 'Awaiting decision',
		statusTextClasses: 'appeal-decision-status',
		receivedText: appealDetails.decision?.letterDate
			? dateISOStringToDisplayDate(appealDetails.decision.letterDate)
			: 'Not applicable',
		receivedTextClasses: 'appeal-decision-due-date',
		actionHtml: actionText
			? `<a class="govuk-link" href="${generateIssueDecisionUrl(
					appealDetails.appealId
			  )}">${actionText}<span class="govuk-visually-hidden"> decision</span></a>`
			: '',
		actionHtmlClasses: 'appeal-decision-actions'
	});
};
