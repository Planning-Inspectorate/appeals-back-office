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
export function generateS20Components(
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
						text: '2. Site details'
					}
				},
				rows: [
					mappedAppellantCaseData.siteAddress.display.summaryListItem,
					mappedAppellantCaseData.siteArea.display.summaryListItem,
					mappedAppellantCaseData.inGreenBelt.display.summaryListItem,
					mappedAppellantCaseData.siteOwnership.display.summaryListItem,
					mappedAppellantCaseData.ownersKnown.display.summaryListItem,
					mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
					mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem
				]
			}
		};

		pageComponents[siteDetailsComponentIndex] = appealSiteSummary;
	}

	const applicationSummaryComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'application-summary'
	);

	if (applicationSummaryComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const applicationSummary = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'application-summary'
				},
				card: {
					title: {
						text: '3. Application details'
					}
				},
				rows: [
					mappedAppellantCaseData.applicationDate.display.summaryListItem,
					mappedAppellantCaseData.developmentDescription.display.summaryListItem,
					mappedAppellantCaseData.relatedAppeals.display.summaryListItem,
					mappedAppellantCaseData.developmentType.display.summaryListItem
				]
			}
		};

		pageComponents[applicationSummaryComponentIndex] = applicationSummary;
	}

	/**
	 * @type {PageComponent}
	 */
	const appealSummary = {
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
					text: '4. Appeal details'
				}
			},
			rows: [
				mappedAppellantCaseData.procedurePreference.display.summaryListItem,
				mappedAppellantCaseData.procedurePreferenceDetails.display.summaryListItem,
				mappedAppellantCaseData.procedurePreferenceDuration.display.summaryListItem,
				mappedAppellantCaseData.inquiryNumberOfWitnesses.display.summaryListItem
			]
		}
	};
	const secondToLastPosition = pageComponents.length - 2;
	pageComponents.splice(secondToLastPosition, 0, appealSummary);

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
						text: '5. Upload documents'
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
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					mappedAppellantCaseData.designAccessStatement.display.summaryListItem,
					mappedAppellantCaseData.supportingDocuments.display.summaryListItem,
					mappedAppellantCaseData.newPlansDrawings.display.summaryListItem,
					mappedAppellantCaseData.otherNewDocuments.display.summaryListItem
				]
			}
		};

		pageComponents[uploadedDocumentsComponentIndex] = uploadedDocuments;
	}

	return pageComponents;
}
