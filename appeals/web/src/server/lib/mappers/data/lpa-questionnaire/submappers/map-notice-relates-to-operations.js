import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNoticeRelatesToOperations = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'notice-relates-to-operations',
		text: 'Does the enforcement notice relate to building, engineering, mining or other operations?',
		// @ts-ignore
		value: lpaQuestionnaireData.noticeRelatesToBuildingEngineeringMiningOther,
		link: `${currentRoute}/notice-operations/change`,
		editable: userHasUpdateCase
	});
