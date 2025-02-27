import { shouldDisplayChangeLinksForLPAQStatus } from '../common.js';
import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
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
