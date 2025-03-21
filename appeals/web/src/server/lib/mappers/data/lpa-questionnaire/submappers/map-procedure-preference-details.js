import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreferenceDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'procedure-preference-details',
		text: 'Why would you prefer this procedure?',
		value: lpaQuestionnaireData.lpaProcedurePreferenceDetails || 'Not applicable',
		link: `${currentRoute}/procedure-preference/details/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Reason for preference details'
	});
