import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent[]}
 */
export function generateLdcComponents(appealDetails, appellantCaseData, mappedAppellantCaseData) {
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
				{
					key: { text: 'Are you claiming costs as part of your appeal?' },
					value: {
						text: convertFromBooleanToYesNo(appellantCaseData.appellantCostsAppliedFor, 'No data')
					}
				},
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
					text: 'Application details'
				}
			},
			rows: [
				mappedAppellantCaseData.applicationDate.display.summaryListItem,
				mappedAppellantCaseData.siteUseAtTimeOfApplication.display.summaryListItem,
				mappedAppellantCaseData.developmentDescription.display.summaryListItem,
				mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
				mappedAppellantCaseData.relatedAppeals.display.summaryListItem
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
					text: 'Appeal details'
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
					text: 'Upload documents'
				}
			},
			rows: [
				mappedAppellantCaseData.applicationForm.display.summaryListItem,
				mappedAppellantCaseData.appealStatement.display.summaryListItem,
				mappedAppellantCaseData.costsDocument.display.summaryListItem,
				mappedAppellantCaseData.supportingDocuments.display.summaryListItem,
				mappedAppellantCaseData.statusPlanningObligation.display.summaryListItem,
				mappedAppellantCaseData.planningObligation.display.summaryListItem,
				mappedAppellantCaseData.statementCommonGround.display.summaryListItem,
				mappedAppellantCaseData.newPlansDrawings.display.summaryListItem,
				mappedAppellantCaseData.otherNewDocuments.display.summaryListItem
			]
		}
	};

	const pageComponents = [
		beforeYouStartSectionSummary,
		appellantSummary,
		appealSiteSummary,
		applicationSummary,
		appealSummary,
		uploadedDocuments
	];

	return pageComponents;
}
