/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: string}} storedSessionData
 * @returns {PageContent}
 */
export const changePlanningObligationStatusPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let planningObligationStatus = appellantCaseData.planningObligation?.status;

	if (storedSessionData?.radio) {
		planningObligationStatus = storedSessionData.radio === null ? null : storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'What is the status of your planning obligation?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'planningObligationStatusRadio',
					idPrefix: 'planning-obligation-status-radio',
					fieldset: {
						legend: {
							text: 'What is the status of your planning obligation?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'not_started',
							text: 'Not started yet',
							// historic data may be 'no started yet'
							checked:
								planningObligationStatus === 'not_started' ||
								planningObligationStatus === 'not started yet'
						},
						{
							value: 'finalised',
							text: 'Finalised',
							checked: planningObligationStatus === 'finalised'
						},
						{
							value: 'not-applicable',
							text: 'Not applicable',
							checked: planningObligationStatus === null
						}
					]
				}
			}
		]
	};

	return pageContent;
};
