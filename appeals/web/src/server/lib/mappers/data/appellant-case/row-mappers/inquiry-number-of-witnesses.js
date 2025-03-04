/** @type {import('../mapper.js').RowMapper} */
export const mapInquiryNumberOfWitnesses = ({ appellantCaseData, currentRoute }) => ({
	id: 'inquiry-number-of-witnesses',
	display: {
		summaryListItem: {
			key: {
				text: 'Expected number of witnesses'
			},
			value: {
				text: appellantCaseData.appellantProcedurePreferenceWitnessCount || 'Not applicable'
			},
			actions: {
				items: [
					{
						text: 'Change',
						visuallyHiddenText: 'expected number of witnesses',
						href: `${currentRoute}/procedure-preference/inquiry/witnesses/change`,
						attributes: { 'data-cy': 'change-inquiry-number-of-witnesses' }
					}
				]
			}
		}
	}
});
