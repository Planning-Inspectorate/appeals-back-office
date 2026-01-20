import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCrownLand = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'is-site-on-crown-land',
		text: 'Is the appeal site on Crown land?',
		// @ts-ignore
		value: lpaQuestionnaireData?.isSiteOnCrownLand,
		link: `${currentRoute}/is-site-on-crown-land`,
		editable: userHasUpdateCase
	});
