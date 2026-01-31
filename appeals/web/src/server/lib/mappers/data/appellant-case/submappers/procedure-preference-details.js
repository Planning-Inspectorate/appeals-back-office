import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreferenceDetails = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'procedure-preference-details',
		text: 'Why would you prefer this appeal procedure?',
		value: appellantCaseData.appellantProcedurePreferenceDetails || 'Not answered',
		link: `${currentRoute}/procedure-preference/details/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		withShowMore: true,
		showMoreLabelText: 'Reason for preference details'
	});
