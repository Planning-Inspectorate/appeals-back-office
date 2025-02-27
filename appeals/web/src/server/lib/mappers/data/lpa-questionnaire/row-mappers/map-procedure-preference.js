import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').RowMapper} */
export const mapProcedurePreference = ({ lpaQuestionnaireData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference',
		text: 'Procedure preference',
		editable: true,
		value: capitalize(lpaQuestionnaireData.lpaProcedurePreference || 'Not applicable'),
		link: `${currentRoute}/procedure-preference/change`,
		cypressDataName: 'change-procedure-preference'
	});
