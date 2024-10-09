import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';
import { booleanSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapNeighboringSiteIsAffected = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	booleanSummaryListItem({
		id: 'neighbouring-site-is-affected',
		text: 'Could a neighbouring site be affected?',
		value: appealDetails.isAffectingNeighbouringSites,
		defaultText: 'No answer provided',
		link: `${currentRoute}/neighbouring-sites/change/affected`,
		editable:
			userHasUpdateCasePermission &&
			shouldDisplayChangeLinksForLPAQStatus(
				appealDetails.documentationSummary?.lpaQuestionnaire?.status
			),
		classes: 'appeal-neighbouring-site-is-affected'
	});
