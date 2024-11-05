import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapIsAonbNationalLandscape = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-aonb-national-landscape',
		text: 'In area of outstanding natural beauty',
		value: lpaQuestionnaireData.isAonbNationalLandscape,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-aonb-national-landscape/change`,
		editable: userHasUpdateCase
	});
