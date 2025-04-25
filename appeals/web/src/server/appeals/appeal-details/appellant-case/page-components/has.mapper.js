import { removeSummaryListActions } from '#lib/mappers/index.js';
import {
	documentUploadUrlTemplate,
	mapDocumentManageUrl
} from '#lib/mappers/data/appellant-case/common.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';

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
export function generateHASComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
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
				mappedAppellantCaseData.siteArea.display.summaryListItem,
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
				mappedAppellantCaseData.developmentDescription.display.summaryListItem,
				mappedAppellantCaseData.applicationDecisionDate.display.summaryListItem,
				mappedAppellantCaseData.decisionLetter.display.summaryListItem,
				mappedAppellantCaseData.applicationDecision.display.summaryListItem
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
			rows: [removeSummaryListActions(mappedAppellantCaseData.appealType.display.summaryListItem)]
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
				mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
				mappedAppellantCaseData.appealStatement.display.summaryListItem,
				mappedAppellantCaseData.costsDocument.display.summaryListItem
			]
		}
	};

	/**
	 * @type {PageComponent}
	 */
	const additionalDocumentsSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'pins-summary-list--fullwidth-value',
			card: {
				title: {
					text: 'Additional documents'
				},
				actions: {
					items:
						isFolderInfo(appellantCaseData.documents.appellantCaseCorrespondence) &&
						appellantCaseData.documents?.appellantCaseCorrespondence?.documents &&
						appellantCaseData.documents?.appellantCaseCorrespondence?.documents.length > 0
							? [
									{
										text: 'Change',
										visuallyHiddenText: 'additional documents',
										href: mapDocumentManageUrl(
											appellantCaseData.appealId,
											appellantCaseData.documents.appellantCaseCorrespondence.folderId
										)
									},
									...(userHasUpdateCasePermission
										? [
												{
													text: 'Add',
													visuallyHiddenText: 'additional documents',
													href: displayPageFormatter.formatDocumentActionLink(
														appellantCaseData.appealId,
														appellantCaseData.documents.appellantCaseCorrespondence,
														documentUploadUrlTemplate
													)
												}
										  ]
										: [])
							  ]
							: [
									...(userHasUpdateCasePermission
										? [
												{
													text: 'Add',
													visuallyHiddenText: 'additional documents',
													href: displayPageFormatter.formatDocumentActionLink(
														appellantCaseData.appealId,
														appellantCaseData.documents.appellantCaseCorrespondence,
														documentUploadUrlTemplate
													)
												}
										  ]
										: [])
							  ]
				}
			},
			rows: mappedAppellantCaseData.additionalDocuments.display.summaryListItems
		}
	};

	return [
		appellantSummary,
		appealSiteSummary,
		applicationSummary,
		appealSummary,
		uploadedDocuments,
		additionalDocumentsSummary
	];
}
