import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsAppealInvalid = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'is-appeal-invalid',
		text: 'Do you think the appeal is invalid?',
		value: lpaQuestionnaireData.lpaConsiderAppealInvalid,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-appeal-invalid/change`,
		editable: userHasUpdateCase
	});
