/** @type {import('../mapper.js').SubMapper} */
export const mapReviewOutcome = ({ appellantCaseData }) => ({
	id: 'review-outcome',
	display: {
		summaryListItem: {
			key: {
				text: 'Appellant case review outcome'
			},
			value: {
				text: appellantCaseData.validation?.outcome || 'Not yet reviewed'
			},
			actions: {
				items: [
					{
						text: 'Change',
						visuallyHiddenText: 'Appellant case review outcome',
						href: `/appeals-service/appeal-details/${appellantCaseData.appealId}/lpa-questionnaire`,
						attributes: { 'data-cy': 'change-review-outcome' }
					}
				]
			}
		}
	},
	input: {
		displayName: 'Review outcome',
		instructions: [
			{
				type: 'radios',
				properties: {
					name: 'reviewOutcome',
					value: appellantCaseData.validation?.outcome,
					fieldset: {
						legend: {
							text: 'What is the outcome of your review?',
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: [
						{
							value: 'valid',
							text: 'Valid'
						},
						{
							value: 'invalid',
							text: 'Invalid'
						},
						{
							value: 'incomplete',
							text: 'Incomplete'
						}
					]
				}
			}
		]
	}
});
