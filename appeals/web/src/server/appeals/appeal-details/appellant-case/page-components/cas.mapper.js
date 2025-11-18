import { generateHASComponents } from './has.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {PageComponent[]}
 */
export function generateCASComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const pageComponents = generateHASComponents(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData,
		userHasUpdateCasePermission
	);

	const uploadedDocumentsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'uploaded-documents'
	);

	if (uploadedDocumentsComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const uploadedDocuments = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'uploaded-documents'
				},
				card: {
					title: {
						text: '4. Upload documents'
					}
				},
				rows: [
					mappedAppellantCaseData.applicationForm.display.summaryListItem,
					mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
					mappedAppellantCaseData.appealStatement.display.summaryListItem,
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					mappedAppellantCaseData.designAndAccessStatement.display.summaryListItem,
					mappedAppellantCaseData.supportingDocuments.display.summaryListItem
				]
			}
		};
		pageComponents[uploadedDocumentsComponentIndex] = uploadedDocuments;
	}

	const additionalDocumentsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'additional-documents'
	);
	if (additionalDocumentsComponentIndex !== -1) {
		pageComponents.splice(additionalDocumentsComponentIndex, 1);
	}

	return pageComponents;
}
