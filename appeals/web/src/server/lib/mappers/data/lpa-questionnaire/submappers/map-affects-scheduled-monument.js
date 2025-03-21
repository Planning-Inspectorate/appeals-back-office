import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAffectsScheduledMonument = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'affects-scheduled-monument',
		text: 'Would the development affect a scheduled monument?',
		value: lpaQuestionnaireData.affectsScheduledMonument,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/affects-scheduled-monument/change`,
		editable: userHasUpdateCase
	});
