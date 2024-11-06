/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryNumberOfWitnesses = ({ appellantCaseData, currentRoute }) => ({
	id: 'inquiry-number-of-witnesses',
	display: {
		summaryListItem: {
			key: {
				text: 'Expected number of witnesses'
			},
			value: {
				text: appellantCaseData.inquiryHowManyWitnesses || 'Not applicable'
			},
			actions: {
				items: [
					{
						text: 'Change',
						visuallyHiddenText: 'Expected number of witnesses',
						href: `${currentRoute}/procedure-preference/inquiry/witnesses/change`,
						attributes: { 'data-cy': 'change-inquiry-number-of-witnesses' }
					}
				]
			}
		}
	}
});
