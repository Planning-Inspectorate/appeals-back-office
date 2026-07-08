import { isFeatureActive } from '#common/feature-flags.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import {
	documentUploadUrlTemplate,
	mapDocumentManageUrl
} from '#lib/mappers/data/appellant-case/common.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';

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
	const lpaText = 'Local planning authority';

	/**
	 * @type {PageComponent}
	 */
	const beforeYouStartSectionSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id: 'before-you-start'
			},
			card: {
				title: {
					text: 'Before you start'
				}
			},
			rows: [
				...(mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem
					? [
							{
								...mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem,
								key: {
									text: lpaText
								}
							}
						]
					: []),
				removeSummaryListActions(mappedAppellantCaseData.applicationType.display.summaryListItem),
				mappedAppellantCaseData.applicationDecision.display.summaryListItem,
				mappedAppellantCaseData.applicationDecisionDate.display.summaryListItem,
				mappedAppellantCaseData.applicationReference.display.summaryListItem
			]
		}
	};

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
			attributes: {
				id: 'appellant-details'
			},
			card: {
				title: {
					text: 'Appellant details'
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
					text: 'Site details'
				}
			},
			rows: [
				mappedAppellantCaseData.siteAddress.display.summaryListItem,
				mappedAppellantCaseData.siteArea.display.summaryListItem,
				mappedAppellantCaseData.inGreenBelt.display.summaryListItem,
				mappedAppellantCaseData.siteOwnership.display.summaryListItem,
				mappedAppellantCaseData.ownersKnown.display.summaryListItem,
				mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
				mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem,
				mappedAppellantCaseData.anySignificantChanges?.display?.summaryListItem
			].filter(Boolean)
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
					text: 'Application details'
				}
			},
			rows: [
				mappedAppellantCaseData.applicationDate.display.summaryListItem,
				mappedAppellantCaseData.developmentDescription.display.summaryListItem,
				mappedAppellantCaseData.relatedAppeals.display.summaryListItem,
				mappedAppellantCaseData.decisionLetter.display.summaryListItem
			].filter(Boolean)
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
					text: 'Upload documents'
				}
			},
			rows: [
				mappedAppellantCaseData.applicationForm.display.summaryListItem,
				mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
				// we want to hide the appeal statement for appeals submitted 1st April 2026 onwards
				...(beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate)
					? [mappedAppellantCaseData.appealStatement.display.summaryListItem]
					: []),
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
			attributes: {
				id: 'additional-documents'
			},
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
									...(userHasUpdateCasePermission && !appellantCaseData.isEnforcementChild
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
									...(userHasUpdateCasePermission && !appellantCaseData.isEnforcementChild
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

	const isExpeditedAppealsActive = isFeatureActive(FEATURE_FLAG_NAMES.EXPEDITED_APPEALS);
	const isExpeditedEligible =
		isExpeditedAppealsActive &&
		(appealDetails.appealType === APPEAL_TYPE.HOUSEHOLDER ||
			appealDetails.appealType === APPEAL_TYPE.CAS_PLANNING ||
			appealDetails.appealType === APPEAL_TYPE.CAS_ADVERTISEMENT) &&
		!beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate);

	const components = [
		beforeYouStartSectionSummary,
		appellantSummary,
		appealSiteSummary,
		applicationSummary
	];

	if (isExpeditedEligible) {
		components.push({
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
				rows: [mappedAppellantCaseData.reasonForAppealAppellant.display.summaryListItem].filter(
					Boolean
				)
			}
		});
	}

	components.push(uploadedDocuments, additionalDocumentsSummary);

	return components;
}
