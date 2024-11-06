import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreference = ({ appellantCaseData, currentRoute }) => ({
	id: 'procedure-preference',
	display: {
		summaryListItem: {
			key: {
				text: 'Procedure preference'
			},
			value: {
				text: capitalize(appellantCaseData.appellantProcedurePreference || 'Not answered')
			},
			actions: {
				items: [
					{
						text: 'Change',
						visuallyHiddenText: 'procedure preference',
						href: `${currentRoute}/procedure-preference/change`,
						attributes: { 'data-cy': 'change-procedure-preference' }
					}
				]
			}
		}
	}
});
