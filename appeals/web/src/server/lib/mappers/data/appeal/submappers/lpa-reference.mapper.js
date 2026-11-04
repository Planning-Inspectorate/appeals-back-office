import { textSummaryListItem } from '#lib/mappers/index.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaReference = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const isGeneric = isGenericAppealType(appealDetails?.appealType);

	return textSummaryListItem({
		id: 'lpa-reference',
		text: 'Planning application reference',
		value: appealDetails.planningApplicationReference || 'No application reference',
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCasePermission,
		actionText: isGeneric && !appealDetails.planningApplicationReference ? 'Add' : 'Change',
		classes: 'appeal-lpa-reference'
	});
};
