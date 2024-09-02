import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { generateAppealDecisionActionListItems } from '../appeal.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppealDecision = ({ appealDetails }) => ({
	id: 'appeal-decision',
	display: {
		tableItem: [
			{
				text: 'Appeal decision',
				classes: 'appeal-decision-documentation'
			},
			{
				text:
					appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE ? 'Sent' : 'Awaiting decision',
				classes: 'appeal-decision-status'
			},
			{
				text: 'Not applicable',
				classes: 'appeal-decision-due-date'
			},
			{
				html: `<ul class="govuk-summary-list__actions-list">${generateAppealDecisionActionListItems(
					appealDetails
				)}</ul>`,
				classes: 'appeal-decision-actions'
			}
		]
	}
});
