/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: boolean}} storedSessionData
 * @returns {PageContent}
 */
export const changePlanningObligationPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let planningObligation = appellantCaseData.planningObligation?.hasObligation;

	if (storedSessionData?.radio) {
		planningObligation = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change planning obligation in support',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change planning obligation in support',
		pageComponents: [
			yesNoInput({
				name: 'planningObligationRadio',
				value: planningObligation
			})
		]
	};

	return pageContent;
};

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
		title: 'Change planning obligation status',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change planning obligation status',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'planningObligationStatusRadio',
					id: 'planning-obligation-status-radio',
					fieldSet: {
						legend: {
							text: 'What is the status of the planning obligation?',
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'not_started',
							text: 'Not yet started',
							checked: planningObligationStatus === 'not_started'
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
