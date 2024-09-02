import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { convertFromBooleanToYesNo } from '../../../boolean-formatter.js';
import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaInspectorAccess = ({ appealDetails, currentRoute }) => {
	const lpaInspectorAccessActionItems = shouldDisplayChangeLinksForLPAQStatus(
		appealDetails.documentationSummary?.lpaQuestionnaire?.status
	)
		? [
				{
					text: 'Change',
					href: `${currentRoute}/inspector-access/change/lpa`,
					visuallyHiddenText: 'inspection access (L P A answer)',
					attributes: { 'data-cy': 'change-inspection-access-lpa' }
				}
		  ]
		: [];

	return {
		id: 'lpa-inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspection access (LPA answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.inspectorAccess.lpaQuestionnaire?.isRequired),
						appealDetails.inspectorAccess.lpaQuestionnaire.details
					)
				},
				actions: {
					items: lpaInspectorAccessActionItems
				},
				classes: 'appeal-lpa-inspector-access'
			}
		}
	};
};
