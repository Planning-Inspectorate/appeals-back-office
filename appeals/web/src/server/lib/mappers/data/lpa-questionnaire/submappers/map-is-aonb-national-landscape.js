import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsAonbNationalLandscape = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-aonb-national-landscape',
		text: 'Is the site in a national landscape?',
		value: lpaQuestionnaireData.isAonbNationalLandscape,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-aonb-national-landscape/change`,
		editable: userHasUpdateCase
	});
