import { APPEAL_DEVELOPMENT_TYPES } from '#appeals/appeal-details/appellant-case/application-development-type/appeal-development-type.constants.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDevelopmentType = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const code = appellantCaseData?.developmentType;
	const entry = APPEAL_DEVELOPMENT_TYPES.find((item) => item.value === code);
	const label = entry?.label || 'Not provided';

	return textSummaryListItem({
		id: 'development-type',
		text: 'Development type',
		value: label,
		link: `${currentRoute}/application-development-type/change`,
		editable: userHasUpdateCase
	});
};
