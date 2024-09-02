import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { convertFromBooleanToYesNo } from '../../../boolean-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantInspectorAccess = ({ appealDetails, currentRoute }) => ({
	id: 'appellant-case-inspector-access',
	display: {
		summaryListItem: {
			key: {
				text: 'Inspection access (appellant answer)'
			},
			value: {
				html: displayPageFormatter.formatAnswerAndDetails(
					convertFromBooleanToYesNo(
						appealDetails.inspectorAccess.appellantCase.isRequired,
						'No answer provided'
					),
					appealDetails.inspectorAccess.appellantCase.details
				)
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/inspector-access/change/appellant`,
						visuallyHiddenText: 'inspection access (appellant answer)',
						attributes: { 'data-cy': 'change-inspection-access-appellant' }
					}
				]
			},
			classes: 'appeal-appellant-inspector-access'
		}
	}
});
