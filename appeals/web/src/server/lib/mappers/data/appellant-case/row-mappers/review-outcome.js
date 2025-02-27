import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapReviewOutcome = ({ appellantCaseData }) => ({
	...textSummaryListItem({
		id: 'review-outcome',
		text: 'Appellant case review outcome',
		editable: true,
		value: appellantCaseData.validation?.outcome || 'Not yet reviewed',
		link: `/appeals-service/appeal-details/${appellantCaseData.appealId}/lpa-questionnaire`,
		cypressDataName: 'change-review-outcome'
	}),
	input: {
		displayName: 'Review outcome',
		instructions: [
			{
				type: 'radios',
				properties: {
					name: 'reviewOutcome',
					idPrefix: 'review-outcome',
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
