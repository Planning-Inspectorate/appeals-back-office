import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreference = ({ lpaQuestionnaireData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference',
		text: 'Which procedure do you think is most appropriate for this appeal?',
		editable: true,
		value: capitalize(lpaQuestionnaireData.lpaProcedurePreference || 'Not applicable'),
		link: `${currentRoute}/procedure-preference/change`,
		cypressDataName: 'change-procedure-preference'
	});
