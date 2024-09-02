import { convertFromBooleanToYesNo } from '../../../boolean-formatter.js';
import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapNeighboringSiteIsAffected = ({ appealDetails, currentRoute }) => {
	const neighbouringSiteIsAffectedActionItems = shouldDisplayChangeLinksForLPAQStatus(
		appealDetails.documentationSummary?.lpaQuestionnaire?.status
	)
		? [
				{
					text: 'Change',
					href: `${currentRoute}/neighbouring-sites/change/affected`,
					visuallyHiddenText: 'could a neighbouring site be affected',
					attributes: { 'data-cy': 'change-neighbouuring-site-is-affected' }
				}
		  ]
		: [];

	return {
		id: 'neighbouring-site-is-affected',
		display: {
			summaryListItem: {
				key: {
					text: 'Could a neighbouring site be affected?'
				},
				value: {
					html:
						convertFromBooleanToYesNo(appealDetails.isAffectingNeighbouringSites) ||
						'No answer provided'
				},
				actions: {
					items: neighbouringSiteIsAffectedActionItems
				},
				classes: 'appeal-neighbouring-site-is-affected'
			}
		}
	};
};
