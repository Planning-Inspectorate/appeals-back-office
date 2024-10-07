import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';
import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
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
		userHasEditPermission:
			userHasUpdateCasePermission &&
			shouldDisplayChangeLinksForLPAQStatus(
				appealDetails.documentationSummary?.lpaQuestionnaire?.status
			),
		classes: 'appeal-lpa-health-and-safety'
	});
