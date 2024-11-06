/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreferenceDuration = ({ appellantCaseData, currentRoute }) => ({
	id: 'procedure-preference-duration',
	display: {
		summaryListItem: {
			key: {
				text: 'Expected length of procedure'
			},
			value: {
				text:
					'appellantProcedurePreferenceDuration' in appellantCaseData &&
					appellantCaseData?.appellantProcedurePreferenceDuration !== null
						? `${appellantCaseData.appellantProcedurePreferenceDuration} days`
						: 'Not applicable'
			},
			actions: {
				items: [
					{
						text: 'Change',
						visuallyHiddenText: 'Expected length of procedure',
						href: `${currentRoute}/procedure-preference/duration/change`,
						attributes: { 'data-cy': 'change-procedure-preference-duration' }
					}
				]
			}
		}
	}
});
