import { appealShortReference } from '#lib/appeals-formatter.js';
/**
 * @typedef {import("#lib/api/allocation-details.api.js").AllocationDetailsLevel} AllocationDetailsLevel
 * @typedef {import("#lib/api/allocation-details.api.js").AllocationDetailsSpecialism} AllocationDetailsSpecialism
 * @typedef {import("../appeal-details.types.js").WebAppeal} Appeal
 */

/**
 * @param {{ allocationDetailsLevels: AllocationDetailsLevel[] }} allocationDetailsData
 * @param { string | undefined } selectedAllocationLevel
 * @param {Appeal} appealDetails
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export function allocationDetailsLevelPage(
	allocationDetailsData,
	selectedAllocationLevel,
	appealDetails,
	errorMessage = undefined
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Allocation level - ${shortAppealReference}`,
		backLinkText: 'Back to case details',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'allocation-level',
					idPrefix: 'allocation-level',
					value: selectedAllocationLevel || null,
					fieldset: {
						legend: {
							text: 'Allocation level',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: allocationDetailsData.allocationDetailsLevels.map((item) => ({
						value: item.level,
						text: item.level
					})),
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {{ allocationDetailsLevels: AllocationDetailsLevel[]; allocationDetailsSpecialisms: AllocationDetailsSpecialism[]; }} allocationDetailsData
 * @param { AllocationDetailsLevel | undefined } selectedAllocationLevel
 * @param { number[] } selectedAllocationSpecialisms
 * @param {Appeal} appealDetails
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export function allocationDetailsSpecialismPage(
	allocationDetailsData,
	selectedAllocationLevel,
	selectedAllocationSpecialisms,
	appealDetails,
	errorMessage
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Allocation specialisms - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/allocation-details/allocation-level`,
		backLinkText: 'Back',
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Allocation specialisms',
		pageComponents: [
			{
				type: 'hint',
				parameters: {
					text: 'Select all that apply'
				}
			},
			{
				type: 'checkboxes',
				parameters: {
					name: 'allocation-specialisms',
					idPrefix: 'allocation-specialisms',
					classes: 'govuk-checkboxes--medium',
					items: allocationDetailsData.allocationDetailsSpecialisms.map((item) => ({
						text: item.name,
						value: item.id,
						checked:
							selectedAllocationSpecialisms && selectedAllocationSpecialisms.includes(item.id)
					})),
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param { AllocationDetailsLevel } selectedAllocationLevel
 * @param { number[] } selectedAllocationSpecialisms
 * @param { Appeal } appealDetails
 * @returns {PageContent}
 */
export function allocationDetailsCheckAnswersPage(
	selectedAllocationLevel,
	selectedAllocationSpecialisms,
	appealDetails
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	let selectedAllocationSpecialismsHtml;
	if (selectedAllocationSpecialisms.length === 1) {
		selectedAllocationSpecialismsHtml = selectedAllocationSpecialisms[0];
	} else {
		const listSpecialismItems = selectedAllocationSpecialisms
			.map((selectedAllocationSpecialism) => `<li>${selectedAllocationSpecialism}</li>`)
			.join('');
		selectedAllocationSpecialismsHtml = `<ul class="govuk-!-padding-0 govuk-!-margin-0 govuk-!-margin-left-4">${listSpecialismItems}</ul>`;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Check answers - ${shortAppealReference}`,
		backLinkText: 'Back',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/allocation-details/allocation-specialism`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check answers',
		pageComponents: [
			{
				type: 'summary-list',
				wrapperHtml: {
					opening:
						'<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds govuk-!-margin-top-5 govuk-!-margin-bottom-6">',
					closing: '</div></div>'
				},
				parameters: {
					rows: [
						{
							key: {
								text: 'Level'
							},
							value: {
								text: selectedAllocationLevel.level
							},
							actions: {
								items: [
									{
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/allocation-details/allocation-level`,
										text: 'Change',
										visuallyHiddenText: 'level'
									}
								]
							}
						},
						{
							key: {
								text: 'Specialism'
							},
							value: {
								html: selectedAllocationSpecialismsHtml
							},
							actions: {
								items: [
									{
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/allocation-details/allocation-specialism`,
										text: 'Change',
										visuallyHiddenText: 'specialism'
									}
								]
							}
						}
					]
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening: '<form action="" method="POST" novalidate>',
					closing: '</form>'
				},
				parameters: {
					text: 'Confirm',
					type: 'submit'
				}
			}
		]
	};

	return pageContent;
}
