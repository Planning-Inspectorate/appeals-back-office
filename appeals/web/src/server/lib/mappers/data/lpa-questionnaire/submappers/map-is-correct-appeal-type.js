import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsCorrectAppealType = ({
	appealDetails,
	lpaQuestionnaireData,
	userHasUpdateCase,
	currentRoute
}) =>
	booleanSummaryListItem({
		id: 'is-correct-appeal-type',
		text: `Is ${appealDetails.appealType?.toLowerCase()} the correct type of appeal?`,
		value: lpaQuestionnaireData.isCorrectAppealType,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-correct-appeal-type/change`,
		editable: userHasUpdateCase
	});
