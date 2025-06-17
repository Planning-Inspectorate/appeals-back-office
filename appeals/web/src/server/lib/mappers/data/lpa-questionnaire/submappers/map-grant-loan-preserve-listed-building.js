import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapGrantLoanToPreserve = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'grant-loan-preserve-listed-building',
		text: 'Was a grant or loan made to preserve the listed building at the appeal site?',
		value: lpaQuestionnaireData.preserveGrantLoan,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/grant-loan-preserve-listed-building/change`,
		editable: userHasUpdateCase
	});
