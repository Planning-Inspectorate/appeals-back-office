import { addressToString } from '#lib/address-formatter.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import { generateHorizonAppealUrl } from '#lib/display-page-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.NotValidReasonOption} NotValidReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @param {string} appealReferenceInputValue
 * @param {string} origin
 * @returns {Promise<PageContent>}
 */
export async function addOtherAppealsPage(appealData, appealReferenceInputValue, origin) {
	/** @type {PageComponent[]} */
	const addOtherAppealsPageContent = [
		{
			type: 'html',
			parameters: {
				html: `<form method="POST">`
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'addOtherAppealsReference',
				name: 'addOtherAppealsReference',
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
		heading: 'What is the appeal reference?',
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
			type: 'table',
			wrapperHtml: {
				opening:
					'<div class="govuk-grid-row"><div class="govuk-grid-column-full govuk-!-margin-top-5 govuk-!-margin-bottom-6">',
				closing: '</div></div>'
			},
			parameters: {
				firstCellIsHeader: false,
				rows: [
					[
						{
							html: '<strong>Appeal reference</strong>'
						},
						{
							html: `${relatedAppeal.appealReference}${
								relatedAppeal.source === 'horizon' ? ' (Horizon)' : ''
							}`
						}
					],
					[
						{
							html: '<strong>Appeal type</strong>'
						},
						{
							html: relatedAppeal.appealType || ''
						}
					],
					[
						{
							html: '<strong>Site address</strong>'
						},
						{
							html: relatedAppeal.siteAddress ? addressToString(relatedAppeal.siteAddress) : ''
						}
					],
					[
						{
							html: '<strong>Local planning authority (LPA)</strong>'
						},
						{
							html: relatedAppeal.localPlanningDepartment || ''
						}
					],
					[
						{
							html: '<strong>Appellant name</strong>'
						},
						{
							html: relatedAppeal.appellantName || ''
						}
					],
					[
						{
							html: '<strong>Agent name</strong>'
						},
						{
							html: relatedAppeal.agentName || ''
						}
					]
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
			parameters: {
				name: 'relateAppealsAnswer',
				id: 'relateAppealsAnswer',
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
	const notificationBanners = buildNotificationBanners(
		request.session,
		'manageRelatedAppeals',
		request.currentAppeal.appealId
	);

	/** @type {PageComponent[]} **/
	const pageComponents = [...notificationBanners];

	const otherAppealsRows = appealData.otherAppeals.map((otherAppeal) => {
		const shortAppealReference = appealShortReference(otherAppeal.appealReference);

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
				html: `<a class="govuk-link" data-cy="remove-appeal-${appealData.appealReference}" href="${origin}/other-appeals/remove/${shortAppealReference}/${otherAppeal.relationshipId}">Remove</a>`
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
			head: [{ text: 'Appeal Reference' }, { text: 'Appeal type' }, { text: 'Action' }],
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
	/** @type {PageComponent} */
	const selectAppealTypeRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'removeAppealRelationship',
			fieldset: {
				legend: {
					classes: 'govuk-fieldset__legend--m'
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

	const shortAppealReference = appealShortReference(appealData.appealReference);
	const titleAndHeading = `Do you want to remove the relationship between appeal ${relatedAppealShortReference} and appeal ${shortAppealReference}?`;

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: `${origin}/other-appeals/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: titleAndHeading,
		pageComponents: [selectAppealTypeRadiosComponent]
	};

	return pageContent;
}
