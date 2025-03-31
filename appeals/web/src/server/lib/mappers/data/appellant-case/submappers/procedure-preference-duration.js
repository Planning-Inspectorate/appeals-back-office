import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreferenceDuration = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference-duration',
		text: 'How many days would you expect the inquiry to last?',
		editable: true,
		value:
			'appellantProcedurePreferenceDuration' in appellantCaseData &&
			appellantCaseData?.appellantProcedurePreferenceDuration !== null
				? `${appellantCaseData.appellantProcedurePreferenceDuration} days`
				: 'Not answered',
		link: `${currentRoute}/procedure-preference/duration/change`,
		cypressDataName: 'change-procedure-preference-duration'
	});
