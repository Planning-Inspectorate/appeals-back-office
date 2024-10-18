import { shouldDisplayChangeLinksForLPAQStatus } from '../appeal.mapper.js';
import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaInspectorAccess = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'lpa-inspector-access',
		text: 'Inspection access (LPA answer)',
		value: appealDetails.inspectorAccess.lpaQuestionnaire?.isRequired,
		valueDetails: appealDetails.inspectorAccess.lpaQuestionnaire.details,
		defaultText: '',
		link: `${currentRoute}/inspector-access/change/lpa`,
		editable:
			userHasUpdateCasePermission &&
			shouldDisplayChangeLinksForLPAQStatus(
				appealDetails.documentationSummary?.lpaQuestionnaire?.status
			),
		classes: 'appeal-lpa-inspector-access',
		withShowMore: true,
		showMoreLabelText: 'Inspection access details (LPA answer)'
	});
