import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapProcedurePreferenceDuration = ({ lpaQuestionnaireData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference-duration',
		text: 'Expected length of procedure',
		editable: true,
		value:
			'lpaProcedurePreferenceDuration' in lpaQuestionnaireData &&
			lpaQuestionnaireData?.lpaProcedurePreferenceDuration !== null
				? `${lpaQuestionnaireData.lpaProcedurePreferenceDuration} day${
						lpaQuestionnaireData.lpaProcedurePreferenceDuration > 1 ? 's' : ''
				  }`
				: 'Not applicable',
		link: `${currentRoute}/procedure-preference/duration/change`,
		cypressDataName: 'change-procedure-preference-duration'
	});
