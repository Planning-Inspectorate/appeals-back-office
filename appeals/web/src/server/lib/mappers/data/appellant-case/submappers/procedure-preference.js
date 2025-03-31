import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreference = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference',
		text: 'How would you prefer us to decide your appeal?',
		editable: true,
		value: capitalize(appellantCaseData.appellantProcedurePreference || 'Not answered'),
		link: `${currentRoute}/procedure-preference/change`,
		cypressDataName: 'change-procedure-preference'
	});
