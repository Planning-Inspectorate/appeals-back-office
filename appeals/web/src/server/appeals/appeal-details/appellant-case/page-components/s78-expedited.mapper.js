import { isFeatureActive } from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
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
export function generateS78ExpeditedComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const isExpeditedAppealsActive = isFeatureActive(FEATURE_FLAG_NAMES.EXPEDITED_APPEALS);
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
					...(isExpeditedAppealsActive && appellantCaseData.anySignificantChanges != null
						? [mappedAppellantCaseData.anySignificantChanges.display.summaryListItem]
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

	if (
		appealDetailsComponentIndex !== -1 &&
		isExpeditedAppealsActive &&
		appellantCaseData.reasonForAppealAppellant != null
	) {
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
					mappedAppellantCaseData.statementCommonGround.display.summaryListItem,
					mappedAppellantCaseData.ownershipCertificate.display.summaryListItem,
					...(isExpeditedAppealsActive
						? [mappedAppellantCaseData.ownershipCertificateExpedited.display.summaryListItem]
						: []),
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					...(isExpeditedAppealsActive &&
					appellantCaseData.screeningOpinionIndicatesEiaRequired != null
						? [mappedAppellantCaseData.screeningOpinionIndicatesEiaRequired.display.summaryListItem]
						: []),
					...(isExpeditedAppealsActive
						? [mappedAppellantCaseData?.environmentalStatement.display.summaryListItem]
						: [])
				]
			}
		};

		pageComponents[uploadedDocumentsComponentIndex] = uploadedDocumentsSummary;
	}

	return pageComponents;
}
