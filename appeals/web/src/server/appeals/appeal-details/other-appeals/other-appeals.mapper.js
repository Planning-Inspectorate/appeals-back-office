import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { addressToString } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { generateHorizonAppealUrl } from '#lib/display-page-formatter.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @param {string} appealReferenceInputValue
 * @param {string} origin
 * @param {{msg : string} | undefined} error
 * @returns {Promise<PageContent>}
 */
export async function addOtherAppealsPage(appealData, appealReferenceInputValue, origin, error) {
	/** @type {PageComponent[]} */
	const addOtherAppealsPageContent = [
		{
			type: 'html',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: ''
			},
			parameters: {
				html: '<form method="POST">'
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'add-other-appeals-reference',
				name: 'addOtherAppealsReference',
				errorMessage: error?.msg ? { text: error.msg } : null,
				label: {
					text: 'Enter the appeal reference number',
					classes: 'govuk-label--l',
					isPageHeading: true
				},
				classes: 'govuk-input--width-10',
				value: appealReferenceInputValue
			}
		},

		{
			type: 'button',
			parameters: {
				id: 'filters-submit',
				type: 'submit',
				classes: 'govuk-button',
				text: 'Continue'
			}
		},
		{
			type: 'html',
			wrapperHtml: {
				opening: '',
				closing: '</div></div>'
			},
			parameters: {
				html: '</form>'
			}
		}
	];

	/** @type {PageContent} */
	const pageContent = {
		title: `Add related appeal - ${appealData.appealReference}`,
		backLinkUrl: origin,
		preHeading: `Appeal ${appealData.appealReference}`,
		pageComponents: [...addOtherAppealsPageContent]
	};

	return pageContent;
}

/**
 * @param {Appeal} currentAppeal
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkableAppealSummary} relatedAppeal
 * @param {string} origin
 * @returns {PageContent}
 */
export function confirmOtherAppealsPage(currentAppeal, relatedAppeal, origin) {
	const relateAppealsAnswer = '';
	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			wrapperHtml: {
				opening:
					'<div class="govuk-grid-row"><div class="govuk-grid-column-full govuk-!-margin-top-5 govuk-!-margin-bottom-6">',
				closing: '</div></div>'
			},
			parameters: {
				rows: [
					{
						key: {
							text: 'Appeal reference'
						},
						value: {
							text: `${relatedAppeal.appealReference}${
								relatedAppeal.source === 'horizon' ? ' (Horizon)' : ''
							}`
						}
					},
					{
						key: {
							text: 'Appeal type'
						},
						value: {
							text: relatedAppeal.appealType || ''
						}
					},
					{
						key: {
							text: 'Site address'
						},
						value: {
							text: relatedAppeal.siteAddress ? addressToString(relatedAppeal.siteAddress) : ''
						}
					},
					{
						key: {
							text: 'Local planning authority (LPA)'
						},
						value: {
							text: relatedAppeal.localPlanningDepartment || ''
						}
					},
					{
						key: {
							text: 'Appellant name'
						},
						value: {
							text: relatedAppeal.appellantName || ''
						}
					},
					{
						key: {
							text: 'Agent name'
						},
						value: {
							text: relatedAppeal.agentName || ''
						}
					}
				]
			}
		}
	];

	const relatedAppealIsCurrentAppeal =
		currentAppeal.appealReference === relatedAppeal.appealReference;
	const appealsAlreadyRelated =
		currentAppeal.otherAppeals.filter(
			(otherAppeal) => otherAppeal.appealReference === relatedAppeal.appealReference
		).length > 0;

	if (relatedAppealIsCurrentAppeal) {
		pageComponents.unshift({
			type: 'warning-text',
			parameters: {
				text: 'You cannot relate an appeal to itself.'
			}
		});
	} else if (appealsAlreadyRelated) {
		pageComponents.unshift({
			type: 'warning-text',
			parameters: {
				text: 'The appeals are already related.'
			}
		});
	} else {
		pageComponents.push({
			type: 'radios',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				name: 'relateAppealsAnswer',
				idPrefix: 'relate-appeals-answer',
				fieldset: {
					legend: {
						text: 'Do you want to relate these appeals?',
						classes: 'govuk-fieldset__legend--m'
					}
				},
				value: relateAppealsAnswer || null,
				items: [
					{
						value: 'yes',
						text: `Yes, relate this appeal to ${currentAppeal.appealReference}`
					},
					{
						value: 'no',
						text: `No, return to search`
					}
				]
			}
		});
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Related appeal details - ${currentAppeal.appealReference}`,
		backLinkUrl: `${origin}/other-appeals/add`,
		preHeading: `Appeal ${currentAppeal.appealReference}`,
		heading: 'Related appeal details',
		submitButtonProperties:
			relatedAppealIsCurrentAppeal || appealsAlreadyRelated
				? {
						text: 'Return to search',
						href: `${origin}/other-appeals/add`
				  }
				: {
						text: 'Continue'
				  },
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} origin
 * @returns {PageContent}
 */
export function manageOtherAppealsPage(appealData, request, origin) {
	const notificationBanners = mapNotificationBannersFromSession(
		request.session,
		'manageRelatedAppeals',
		request.currentAppeal.appealId
	);

	/** @type {PageComponent[]} **/
	const pageComponents = [...notificationBanners];

	const otherAppealsRows = appealData.otherAppeals.map((otherAppeal) => {
		const shortAppealReference = appealShortReference(otherAppeal.appealReference) || '';

		return [
			{
				html:
					otherAppeal.externalSource === true
						? `<a class="govuk-link" href="${generateHorizonAppealUrl(
								otherAppeal.externalId
						  )}" aria-label="Appeal ${numberToAccessibleDigitLabel(
								shortAppealReference || ''
						  )}">${shortAppealReference} (Horizon)</a>`
						: `<a class="govuk-link" href="/appeals-service/appeal-details/${
								otherAppeal.appealId
						  }" aria-label="Appeal ${numberToAccessibleDigitLabel(
								shortAppealReference || ''
						  )}">${shortAppealReference}</a>`
			},
			{
				text: otherAppeal.appealType || otherAppeal.externalAppealType || 'Unknown'
			},
			{
				html: (() => {
					const removeUrl = `${origin}/other-appeals/remove/${shortAppealReference}/${otherAppeal.relationshipId}`;
					const hiddenText = `related appeal ${numberToAccessibleDigitLabel(shortAppealReference)}`;

					return `<a class="govuk-link" data-cy="remove-appeal-${shortAppealReference}" href="${removeUrl}">Remove<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
				})(),
				classes: 'govuk-!-text-align-right'
			}
		];
	});

	/** @type {PageComponent} */
	const otherAppealsTable = {
		wrapperHtml: {
			opening: '<h2 class="govuk-!-margin-top-6">Related appeals</h2>',
			closing: ''
		},
		type: 'table',
		parameters: {
			head: [
				{ text: 'Appeal Reference' },
				{ text: 'Appeal type' },
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			firstCellIsHeader: false,
			rows: otherAppealsRows
		}
	};

	if (otherAppealsRows.length > 0) {
		pageComponents.push(otherAppealsTable);
	}

	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Manage related appeals - ${shortAppealReference}`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Manage related appeals',
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} relatedAppealShortReference
 * @param {string} origin
 * @returns {PageContent}
 */
export function removeAppealRelationshipPage(appealData, relatedAppealShortReference, origin) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const titleAndHeading = `Do you want to remove the relationship between appeal ${relatedAppealShortReference} and appeal ${shortAppealReference}?`;

	/** @type {PageComponent} */
	const selectAppealTypeRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'removeAppealRelationship',
			idPrefix: 'remove-appeal-relationship',
			fieldset: {
				legend: {
					text: titleAndHeading,
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					text: 'Yes',
					value: 'yes'
				},
				{
					text: 'No',
					value: 'no'
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: `${origin}/other-appeals/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectAppealTypeRadiosComponent]
	};

	return pageContent;
}
