import { generateS20Components } from './s20.mapper.js';

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
export function generateS78Components(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const pageComponents = generateS20Components(
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
		/**
		 * @type {PageComponent}
		 */
		const appealSiteSummary = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'site-details'
				},
				card: {
					title: {
						text: 'Site details'
					}
				},
				rows: [
					mappedAppellantCaseData.siteAddress.display.summaryListItem,
					mappedAppellantCaseData.siteArea.display.summaryListItem,
					mappedAppellantCaseData.inGreenBelt.display.summaryListItem,
					mappedAppellantCaseData.siteOwnership.display.summaryListItem,
					mappedAppellantCaseData.ownersKnown.display.summaryListItem,
					mappedAppellantCaseData.partOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.tenantOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.otherTenantsOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
					mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem,
					...(appellantCaseData.anySignificantChanges != null
						? [mappedAppellantCaseData.anySignificantChanges.display.summaryListItem]
						: []),
					...(appellantCaseData.screeningOpinionIndicatesEiaRequired != null
						? [mappedAppellantCaseData.screeningOpinionIndicatesEiaRequired.display.summaryListItem]
						: [])
				]
			}
		};

		pageComponents[siteDetailsComponentIndex] = appealSiteSummary;
	}

	const appealDetailsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === 'appeal-summary'
	);

	if (appealDetailsComponentIndex !== -1 && appellantCaseData.reasonForAppealAppellant != null) {
		/**
		 * @type {PageComponent}
		 */
		const appealDetailsSummary = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'appeal-summary'
				},
				card: {
					title: {
						text: 'Appeal details'
					}
				},
				rows: [
					mappedAppellantCaseData.procedurePreference.display.summaryListItem,
					mappedAppellantCaseData.procedurePreferenceDetails.display.summaryListItem,
					mappedAppellantCaseData.procedurePreferenceDuration.display.summaryListItem,
					mappedAppellantCaseData.inquiryNumberOfWitnesses.display.summaryListItem,
					mappedAppellantCaseData.reasonForAppealAppellant.display.summaryListItem
				]
			}
		};

		pageComponents[appealDetailsComponentIndex] = appealDetailsSummary;
	}

	const uploadedDocumentsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'uploaded-documents'
	);

	if (uploadedDocumentsComponentIndex !== -1 && appellantCaseData.ownershipCertificate != null) {
		/**
		 * @type {PageComponent}
		 */
		const uploadedDocumentsSummary = {
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
					mappedAppellantCaseData.applicationForm.display.summaryListItem,
					mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
					mappedAppellantCaseData.decisionLetter.display.summaryListItem,
					mappedAppellantCaseData.appealStatement.display.summaryListItem,
					mappedAppellantCaseData.statusPlanningObligation.display.summaryListItem,
					mappedAppellantCaseData.planningObligation.display.summaryListItem,
					mappedAppellantCaseData.statementCommonGround.display.summaryListItem,
					mappedAppellantCaseData.ownershipCertificate.display.summaryListItem,
					mappedAppellantCaseData.ownershipCertificateExpedited.display.summaryListItem,
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					mappedAppellantCaseData.designAccessStatement.display.summaryListItem,
					mappedAppellantCaseData.supportingDocuments.display.summaryListItem,
					mappedAppellantCaseData.newPlansDrawings.display.summaryListItem,
					mappedAppellantCaseData.otherNewDocuments.display.summaryListItem
				]
			}
		};

		pageComponents[uploadedDocumentsComponentIndex] = uploadedDocumentsSummary;
	}

	return pageComponents;
}
