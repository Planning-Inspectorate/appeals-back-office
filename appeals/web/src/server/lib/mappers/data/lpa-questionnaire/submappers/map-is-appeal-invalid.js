import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsAppealInvalid = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'is-appeal-invalid',
		text: 'Do you think the appeal is invalid?',
		value: lpaQuestionnaireData.lpaConsiderAppealInvalid,
		valueDetails: lpaQuestionnaireData.lpaAppealInvalidReasons,
		defaultText: 'No answer provided',
		addCyAttribute: true,
		link: `${currentRoute}/is-appeal-invalid/change`,
		editable: userHasUpdateCase
	});
