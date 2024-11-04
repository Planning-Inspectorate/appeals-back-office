import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapSiteWithinGreenBelt = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'site-within-green-belt',
		text: 'Green belt',
		value: lpaQuestionnaireData.isGreenBelt,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/green-belt/change/lpa`,
		editable: userHasUpdateCase
	});
