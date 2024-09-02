import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { convertFromBooleanToYesNo } from '../../../boolean-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantHealthAndSafety = ({ appealDetails, currentRoute }) => ({
	id: 'appellant-case-health-and-safety',
	display: {
		summaryListItem: {
			key: {
				text: 'Potential safety risks (appellant answer)'
			},
			value: {
				html: displayPageFormatter.formatAnswerAndDetails(
					convertFromBooleanToYesNo(
						appealDetails.healthAndSafety.appellantCase.hasIssues,
						'No answer provided'
					),
					appealDetails.healthAndSafety.appellantCase.details
				)
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/safety-risks/change/appellant`,
						visuallyHiddenText: 'potential safety risks (appellant answer)',
						attributes: { 'data-cy': 'change-appellant-case-health-and-safety' }
					}
				]
			},
			classes: 'appeal-appellant-health-and-safety'
		}
	}
});
