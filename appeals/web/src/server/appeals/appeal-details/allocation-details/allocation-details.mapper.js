import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import("./allocation-details.service.js").AllocationDetailsLevel} AllocationDetailsLevel
 * @typedef {import("./allocation-details.service.js").AllocationDetailsSpecialism} AllocationDetailsSpecialism
 * @typedef {import("../appeal-details.types.js").WebAppeal} Appeal
 */

/**
 * @param {{ allocationDetailsLevels: AllocationDetailsLevel[] }} allocationDetailsData
 * @param { string | undefined } selectedAllocationLevel
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function allocationDetailsLevelPage(
	allocationDetailsData,
	selectedAllocationLevel,
	appealDetails
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Select allocation level - ${shortAppealReference}`,
		backLinkText: 'Back to case details',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Select allocation level',
		pageComponents: [
			{
				type: 'radios',
				wrapperHtml: {
					opening: '<div class="govuk-!-margin-top-8">',
					closing: '</div>'
				},
				parameters: {
					name: 'allocation-level',
					idPrefix: 'allocation-level',
					value: selectedAllocationLevel || null,
					items: allocationDetailsData.allocationDetailsLevels.map((item) => ({
						value: item.level,
						text: item.level
					}))
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
 * @returns {PageContent}
 */
export function allocationDetailsSpecialismPage(
	allocationDetailsData,
	selectedAllocationLevel,
	selectedAllocationSpecialisms,
	appealDetails
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Select allocation specialisms - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/allocation-details/allocation-level`,
		backLinkText: 'Back',
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Select allocation specialisms',
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
								text: selectedAllocationLevel && selectedAllocationLevel.level
							}
						},
						{
							key: {
								text: 'Band'
							},
							value: {
								text: selectedAllocationLevel && selectedAllocationLevel.band
							}
						}
					]
				}
			},
			{
				type: 'checkboxes',
				parameters: {
					name: 'allocation-specialisms',
					idPrefix: 'allocation-specialisms',
					classes: 'govuk-checkboxes--small',
					fieldset: {
						legend: {
							text: 'Select allocation specialism',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: allocationDetailsData.allocationDetailsSpecialisms.map((item) => ({
						text: item.name,
						value: item.id,
						checked:
							selectedAllocationSpecialisms && selectedAllocationSpecialisms.includes(item.id)
					}))
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
	const selectedAllocationSpecialismsHtml = selectedAllocationSpecialisms
		.map((selectedAllocationSpecialism) => `<li>${selectedAllocationSpecialism}</li>`)
		.join('');

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
								text: 'Band'
							},
							value: {
								text: selectedAllocationLevel.band
							}
						},
						{
							key: {
								text: 'Specialism'
							},
							value: {
								html: `<ul class="govuk-!-padding-0 govuk-!-margin-0 govuk-!-margin-left-4">${selectedAllocationSpecialismsHtml}</ul>`
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
