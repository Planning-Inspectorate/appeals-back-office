import { removeSummaryListActions } from '#lib/mappers/index.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent[]}
 */
export function generateCASAdvertComponents(appealDetails, mappedAppellantCaseData) {
	/**
	 * @type {PageComponent}
	 */
	const appellantSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			card: {
				title: {
					text: '1. Appellant details'
				}
			},
			rows: [
				mappedAppellantCaseData.appellant.display.summaryListItem,
				...(appealDetails.agent ? [mappedAppellantCaseData.agent.display.summaryListItem] : [])
			]
		}
	};

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
				mappedAppellantCaseData.inGreenBelt.display.summaryListItem,
				mappedAppellantCaseData.siteOwnership.display.summaryListItem,
				mappedAppellantCaseData.ownersKnown.display.summaryListItem,
				mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
				mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem
			]
		}
	};

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
				mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem,
				mappedAppellantCaseData.applicationReference.display.summaryListItem,
				mappedAppellantCaseData.applicationDate.display.summaryListItem,
				mappedAppellantCaseData.relatedAppeals.display.summaryListItem,
				mappedAppellantCaseData.applicationDecision.display.summaryListItem,
				mappedAppellantCaseData.applicationDecisionDate.display.summaryListItem,
				mappedAppellantCaseData.decisionLetter.display.summaryListItem
			]
		}
	};

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
				removeSummaryListActions(mappedAppellantCaseData.applicationType.display.summaryListItem)
			]
		}
	};

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
				mappedAppellantCaseData.appealStatement.display.summaryListItem,
				mappedAppellantCaseData.costsDocument.display.summaryListItem,
				mappedAppellantCaseData.supportingDocuments.display.summaryListItem
			]
		}
	};

	return [
		appellantSummary,
		appealSiteSummary,
		applicationSummary,
		appealSummary,
		uploadedDocuments
	];
}
