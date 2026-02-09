import { generateEnforcementNoticeComponents } from './enforcement-notice.mapper.js';

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
export function generateEnforcementListedComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const pageComponents = generateEnforcementNoticeComponents(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData,
		userHasUpdateCasePermission
	);

	const landComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === 'site-details'
	);

	if (landComponentIndex !== -1) {
		const rows = pageComponents[landComponentIndex].parameters.rows;
		const rowIndex = rows.findIndex(
			(/** @type {{ key: { text: string; }; }} */ row) =>
				row?.key?.text === 'Do you have written or verbal permission to use the land?'
		);
		if (rowIndex !== -1) {
			rows.splice(rowIndex, 1);
		}
	}

	const groundsAndFactsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'grounds-and-facts'
	);
	if (groundsAndFactsComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const groundsAndFactsSummary = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'grounds-and-facts'
				},
				card: {
					title: {
						text: 'Grounds and facts'
					}
				},
				rows: [
					mappedAppellantCaseData.descriptionOfAllegedBreach.display.summaryListItem,
					mappedAppellantCaseData.groundsForAppeal.display.summaryListItem,
					// @ts-ignore
					...getSummaryListItems(mappedAppellantCaseData.factsForGrounds),
					// @ts-ignore
					...getSummaryListItems(mappedAppellantCaseData.supportingDocumentsForGrounds)
				]
			}
		};

		pageComponents[groundsAndFactsComponentIndex] = groundsAndFactsSummary;
	}

	const uploadDocumentsComponentsIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'grounds-and-facts'
	);
	if (uploadDocumentsComponentsIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const uploadDocumentsSummary = {
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
						text: 'Upload documents'
					}
				},
				rows: [
					mappedAppellantCaseData.priorCorrespondenceWithPINS.display.summaryListItem,
					mappedAppellantCaseData.enforcementNoticeDocuments.display.summaryListItem,
					mappedAppellantCaseData.enforcementNoticePlanDocuments.display.summaryListItem,
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					mappedAppellantCaseData.otherNewDocuments.display.summaryListItem
				]
			}
		};

		pageComponents[uploadDocumentsComponentsIndex] = uploadDocumentsSummary;
	}

	return pageComponents;
}

/**
 *
 * @param {Instructions[]} subMapperList
 * @returns {SummaryListRowProperties[]}
 */
const getSummaryListItems = (subMapperList) =>
	// @ts-ignore
	subMapperList?.map((subMapper) => subMapper.display.summaryListItem);
