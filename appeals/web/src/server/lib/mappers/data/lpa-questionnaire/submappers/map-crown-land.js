import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCrownLand = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'is-on-crown-land',
		text: 'Is the appeal site on Crown land?',
		value: lpaQuestionnaireData?.isSiteOnCrownLand,
		link: `${currentRoute}/is-on-crown-land/change`,
		editable: userHasUpdateCase
	});
