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
export function generateCASAdvertComponents(
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

	const siteDetailsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === 'site-details'
	);

	if (siteDetailsComponentIndex !== -1) {
		const rows = pageComponents[siteDetailsComponentIndex].parameters.rows;

		// remove the site area row
		const siteAreaIndex = rows.findIndex(
			(/** @type {{ key: {text: string}; }} */ row) => row.key.text === 'appeal-site-area'
		);
		if (siteAreaIndex !== -1) {
			rows.splice(siteAreaIndex, 1);
		}

		// add the highway land row and advertisementInPosition row
		const appealSiteAddressIndex = rows.findIndex(
			(/** @type {{ classes: string; }} */ row) => row.classes === 'appeal-site-address'
		);
		const highwayLand = mappedAppellantCaseData.highwayLand.display.summaryListItem;

		const advertisementInPosition =
			mappedAppellantCaseData.advertisementInPosition.display.summaryListItem;

		rows.splice(appealSiteAddressIndex + 1, 0, highwayLand, advertisementInPosition);

		const landownerPermission = mappedAppellantCaseData.landownerPermission.display.summaryListItem;

		rows.splice(rows.length - 1, 0, landownerPermission);
	}

	const applicationSummaryComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'application-summary'
	);

	if (applicationSummaryComponentIndex !== -1) {
		const rows = pageComponents[applicationSummaryComponentIndex].parameters.rows;

		const developmentDescriptionIndex = rows.findIndex(
			(/** @type {{ classes: string; }} */ row) => row.classes === 'appeal-development-description'
		);
		const advertisementDescription =
			mappedAppellantCaseData.advertisementDescription.display.summaryListItem;
		const changedAdvertisementDescriptionDoc =
			mappedAppellantCaseData.changedAdvertisementDescriptionDocument.display.summaryListItem;
		const indexAfterDescription = developmentDescriptionIndex + 1;

		rows[developmentDescriptionIndex] = advertisementDescription;
		rows.splice(indexAfterDescription, 0, changedAdvertisementDescriptionDoc);
	}

	const uploadedDocumentsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'uploaded-documents'
	);

	if (uploadedDocumentsComponentIndex !== -1) {
		/** @type {PageComponent} */
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
					mappedAppellantCaseData.appealStatement.display.summaryListItem,
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
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
