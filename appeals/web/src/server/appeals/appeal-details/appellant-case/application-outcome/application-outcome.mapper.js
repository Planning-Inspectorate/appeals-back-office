/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationOutcomePage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change application decision outcome',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			radiosInput({
				name: 'applicationOutcome',
				idPrefix: 'application-outcome',
				legendText: 'Change application decision outcome',
				legendIsPageHeading: true,
				items: [
					{
						value: 'granted',
						text: 'Granted with conditions',
						checked: storedSessionData
							? storedSessionData === 'granted'
							: appellantCaseData.applicationDecision === 'granted'
					},
					{
						value: 'refused',
						text: 'Refused',
						checked: storedSessionData
							? storedSessionData === 'refused'
							: appellantCaseData.applicationDecision === 'refused'
					},
					{
						value: 'not_received',
						text: 'Not received',
						checked: storedSessionData
							? storedSessionData === 'not_received'
							: appellantCaseData.applicationDecision === 'not_received'
					}
				]
			})
		]
	};

	return pageContent;
};
