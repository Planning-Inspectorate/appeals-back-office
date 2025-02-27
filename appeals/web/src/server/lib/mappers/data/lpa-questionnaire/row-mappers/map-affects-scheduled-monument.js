import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapAffectsScheduledMonument = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'affects-scheduled-monument',
		text: 'Affects scheduled monument',
		value: lpaQuestionnaireData.affectsScheduledMonument,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/affects-scheduled-monument/change`,
		editable: userHasUpdateCase
	});
