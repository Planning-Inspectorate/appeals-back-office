import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryNumberOfWitnesses = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'inquiry-number-of-witnesses',
		text: 'How many witnesses would you expect to give evidence at the inquiry?',
		editable: !appellantCaseData.isEnforcementChild,
		value:
			appellantCaseData?.appellantProcedurePreferenceWitnessCount != null
				? `${appellantCaseData.appellantProcedurePreferenceWitnessCount}`
				: 'Not answered',
		link: `${currentRoute}/procedure-preference/inquiry/witnesses/change`,
		cypressDataName: 'change-inquiry-number-of-witnesses'
	});
