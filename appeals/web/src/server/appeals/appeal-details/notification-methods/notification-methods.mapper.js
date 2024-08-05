/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaqData
 * @param {import('@pins/appeals.api').Api.AllLPANotificationMethodsResponse} notificationMethods
 * @param {{id: number}[]} storedSessionData
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeNotificationMethodsPage = (
	appealData,
	lpaqData,
	notificationMethods,
	storedSessionData,
	backLinkUrl
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentValues = storedSessionData
		? storedSessionData
		: lpaqData.lpaNotificationMethods?.map((notificationMethod) => ({
				id: notificationMethods.find((method) => method.name === notificationMethod.name)?.id
		  })) || [];

	/** @type {PageContent} */
	const pageContent = {
		title: `Change notification methods`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change notification methods`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'notificationMethodsCheckboxes',
					id: 'notification-methods-checkboxes',
					fieldSet: {
						legend: {
							text: `Which notification methods apply?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: notificationMethods.map((notificationMethod) => ({
						text: notificationMethod.name,
						value: notificationMethod.id,
						checked: currentValues?.some((method) => method.id === notificationMethod.id)
					}))
				}
			}
		]
	};

	return pageContent;
};
