import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAppellantPhotosAndPlans = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'accurate-photographs-plans',
		text: 'Did the appellant submit complete and accurate photographs and plans?',
		value: lpaQuestionnaireData.didAppellantSubmitCompletePhotosAndPlans,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/accurate-photographs-plans/change`,
		editable: userHasUpdateCase
	});
