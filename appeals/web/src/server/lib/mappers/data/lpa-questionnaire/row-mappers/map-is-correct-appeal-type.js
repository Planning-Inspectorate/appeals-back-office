import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapIsCorrectAppealType = ({ lpaQuestionnaireData, userHasUpdateCase, currentRoute }) =>
	booleanSummaryListItem({
		id: 'is-correct-appeal-type',
		text: 'Correct appeal type',
		value: lpaQuestionnaireData.isCorrectAppealType,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-correct-appeal-type/change`,
		editable: userHasUpdateCase
	});
