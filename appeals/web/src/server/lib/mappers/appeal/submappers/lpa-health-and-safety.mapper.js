import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { convertFromBooleanToYesNo } from '../../../boolean-formatter.js';
import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaHealthAndSafety = ({ appealDetails, currentRoute }) => {
	const lpaHealthAndSafetyActionItems = shouldDisplayChangeLinksForLPAQStatus(
		appealDetails.documentationSummary?.lpaQuestionnaire?.status
	)
		? [
				{
					text: 'Change',
					href: `${currentRoute}/safety-risks/change/lpa`,
					visuallyHiddenText: 'potential safety risks (L P A answer)',
					attributes: { 'data-cy': 'change-lpa-health-and-safety' }
				}
		  ]
		: [];

	return {
		id: 'lpa-health-and-safety',
		display: {
			summaryListItem: {
				key: {
					text: 'Potential safety risks (LPA answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.healthAndSafety.lpaQuestionnaire?.hasIssues),
						appealDetails.healthAndSafety.lpaQuestionnaire?.details
					)
				},
				actions: {
					items: lpaHealthAndSafetyActionItems
				},
				classes: 'appeal-lpa-health-and-safety'
			}
		}
	};
};
