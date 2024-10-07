import { textDisplayField } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppealType = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textDisplayField({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType || 'No appeal type',
		link: `${currentRoute}/change-appeal-type/appeal-type`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-appeal-type'
	});
