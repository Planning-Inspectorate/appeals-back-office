import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';
import { shouldDisplayChangeLinksForLPAQStatus } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaHealthAndSafety = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'lpa-health-and-safety',
		text: 'Potential safety risks (LPA answer)',
		value: appealDetails.healthAndSafety.lpaQuestionnaire?.hasIssues,
		valueDetails: appealDetails.healthAndSafety.lpaQuestionnaire?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/lpa`,
		editable:
			userHasUpdateCasePermission &&
			shouldDisplayChangeLinksForLPAQStatus(
				appealDetails.documentationSummary?.lpaQuestionnaire?.status
			),
		classes: 'appeal-lpa-health-and-safety',
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details (LPA answer)'
	});
