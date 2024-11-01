import { permissionNames } from '#environment/permissions.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapReviewOutcome = ({ lpaQuestionnaireData, session }) => ({
	id: 'review-outcome',
	display: {
		summaryListItem: {
			key: {
				text: 'LPA Questionnaire review outcome'
			},
			value: {
				text: lpaQuestionnaireData.validation?.outcome || 'Not yet reviewed'
			},
			actions: {
				items: [
					mapActionComponent(permissionNames.updateCase, session, {
						text: 'Change',
						visuallyHiddenText: 'LPA Questionnaire review outcome',
						href: `/appeals-service/appeal-details/${lpaQuestionnaireData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
						attributes: { 'lpaQuestionnaireData-cy': 'change-review-outcome' }
					})
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
					name: 'review-outcome',
					value: lpaQuestionnaireData.validation?.outcome,
					items: [
						{
							value: 'complete',
							text: 'Complete'
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
