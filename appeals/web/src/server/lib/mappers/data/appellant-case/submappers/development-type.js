import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_DEVELOPMENT_TYPES } from '@pins/appeals/constants/appellant-cases.constants.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDevelopmentType = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const code = appellantCaseData?.developmentType;
	const entry = APPEAL_DEVELOPMENT_TYPES.find(
		(/** @type {{value: string, label: string}} */ item) => item.value === code
	);
	const label = capitalizeFirstLetter(entry?.label || 'Not answered');

	return textSummaryListItem({
		id: 'development-type',
		text: 'Development type',
		value: label,
		link: `${currentRoute}/application-development-type/change`,
		editable: userHasUpdateCase
	});
};
