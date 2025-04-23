import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealShortReference, linkedAppealStatus } from '#lib/appeals-formatter.js';
import { generateHorizonAppealUrl } from '#lib/display-page-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @param {string} appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} [leadLinkedAppeal]
 * @param {Appeal} [leadAppealData]
 * @returns {PageContent}
 */
export function manageLinkedAppealsPage(appealData, appealId, leadLinkedAppeal, leadAppealData) {
	const isChildAppeal = appealData.isChildAppeal === true;
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const isChildOfHorizonAppeal = isChildAppeal && leadLinkedAppeal?.externalSource;

	/** @type {PageComponent[]} **/
	const pageComponents = [];

	/** @type {PageComponent} */
	const appealStatusTagComponent = {
		type: 'status-tag',
		wrapperHtml: {
			opening: '<div class="govuk-!-margin-bottom-2">',
			closing: '</div>'
		},
		parameters: {
			status: linkedAppealStatus(!isChildAppeal, isChildAppeal)
		}
	};
	pageComponents.push(appealStatusTagComponent);

	if (isChildAppeal) {
		/** @type {PageComponent} */
		const leadAppealTable = {
			wrapperHtml: {
				opening: `<h2 class="govuk-!-margin-top-6">Lead appeal of ${shortAppealReference}</h2>`,
				closing: ''
			},
			type: 'table',
			parameters: {
				head: [
					{ text: 'Appeal Ref' },
					{ text: 'Appeal type' },
					{ text: 'Action', classes: 'govuk-!-text-align-right' }
				],
				firstCellIsHeader: false,
				rows: [
					[
						{
							html: isChildOfHorizonAppeal
								? `<a class="govuk-link" href="${generateHorizonAppealUrl(
										leadLinkedAppeal?.appealId
								  )}">${leadLinkedAppeal?.appealReference}</a>`
								: `<a class="govuk-link" href="/appeals-service/appeal-details/${
										leadLinkedAppeal?.appealId
								  }" aria-label="Appeal ${numberToAccessibleDigitLabel(
										appealShortReference(leadLinkedAppeal?.appealReference) || ''
								  )}">${appealShortReference(leadLinkedAppeal?.appealReference)}</a>`
						},
						{
							text:
								(isChildOfHorizonAppeal
									? leadLinkedAppeal.externalAppealType
									: leadLinkedAppeal?.appealType) || 'Unknown'
						},
						{
							html: (() => {
								const unlinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/unlink-appeal/${appealId}/${leadLinkedAppeal?.relationshipId}/${appealId}`;
								const leadAppealRef = appealShortReference(leadLinkedAppeal?.appealReference) || '';
								const hiddenText = `appeal ${numberToAccessibleDigitLabel(leadAppealRef)}`;

								return `<a class="govuk-link" href="${unlinkUrl}">Unlink<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
							})(),
							classes: 'govuk-!-text-align-right'
						}
					]
				]
			}
		};
		pageComponents.push(leadAppealTable);
	}

	const sourceOfLinkedChildAppeals = isChildAppeal
		? leadAppealData?.linkedAppeals
		: appealData.linkedAppeals;
	const childAppealsRows = sourceOfLinkedChildAppeals
		? sourceOfLinkedChildAppeals
				.filter(
					(linkedAppeal) =>
						!linkedAppeal.isParentAppeal && linkedAppeal.appealId !== Number(appealId)
				)
				.map((linkedAppeal) => {
					return [
						{
							html: linkedAppeal.externalSource
								? `<a class="govuk-link" href="${generateHorizonAppealUrl(
										linkedAppeal?.appealId
								  )}" data-cy="${linkedAppeal?.appealReference}"
								  >${linkedAppeal?.appealReference}</a>`
								: `<a class="govuk-link" href="/appeals-service/appeal-details/${
										linkedAppeal?.appealId
								  }" aria-label="Appeal ${numberToAccessibleDigitLabel(
										appealShortReference(linkedAppeal?.appealReference) || ''
								  )}" data-cy="${linkedAppeal?.appealReference}"
								  >${appealShortReference(linkedAppeal?.appealReference)}</a>`
						},
						{
							text:
								(linkedAppeal.externalSource
									? linkedAppeal.externalAppealType
									: linkedAppeal.appealType) || 'Unknown'
						},
						{
							html: (() => {
								const unlinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/unlink-appeal/${linkedAppeal.appealId}/${linkedAppeal.relationshipId}/${appealId}`;
								const childAppealRef = appealShortReference(linkedAppeal?.appealReference) || '';
								const hiddenText = `appeal ${numberToAccessibleDigitLabel(childAppealRef)}`;

								return `<a class="govuk-link" data-cy="unlink-appeal-${appealData.appealReference}" href="${unlinkUrl}">Unlink<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
							})(),
							classes: 'govuk-!-text-align-right'
						}
					];
				})
		: [];

	const childAppealsHeading = isChildAppeal
		? `Other child appeals of ${appealShortReference(leadAppealData?.appealReference)}`
		: `Child appeals of ${shortAppealReference}`;

	/** @type {PageComponent} */
	const childAppealsTable = {
		wrapperHtml: {
			opening: `<h2 class="govuk-!-margin-top-6">${childAppealsHeading}</h2>`,
			closing: ''
		},
		type: 'table',
		parameters: {
			head: [
				{ text: 'Appeal Ref' },
				{ text: 'Appeal type' },
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			firstCellIsHeader: false,
			rows: childAppealsRows
		}
	};

	if (childAppealsRows.length > 0) {
		pageComponents.push(childAppealsTable);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Manage linked appeals - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Manage linked appeals',
		pageComponents
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {{ appealReference: string }} [sessionData]
 * @param {string} [backLinkUrl]
 * @returns {PageContent}
 */
export function addLinkedAppealPage(appealData, sessionData, backLinkUrl) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Add linked appeal - ${shortAppealReference}`,
		backLinkUrl: backLinkUrl || `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - add linked appeal`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'appeal-reference',
					name: 'appeal-reference',
					type: 'text',
					value: sessionData?.appealReference,
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: true,
						text: 'Appeal reference',
						classes: 'govuk-label--l'
					}
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @returns {PageContent}
 */
export function addLinkedAppealCheckAndConfirmPage(appealData, linkCandidateSummary) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const linkCandidateHtml = `
		<span>${linkCandidateSummary.appealReference}${
		linkCandidateSummary.source === 'horizon' ? ' (Horizon)' : ''
	}</span>
		<br>
		<span>${linkCandidateSummary.appealType}</span>
	`;

	const leadAppealHtml = `
		<span>${appealData.appealReference}${appealData.source === 'horizon' ? ' (Horizon)' : ''}</span>
		<br>
		<span>${appealData.appealType}</span>
	`;

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of the appeal you're linking to ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`,
		preHeading: `Appeal ${shortAppealReference} (lead)`,
		heading: 'Check details and add linked appeal',
		submitButtonProperties: {
			text: 'Add linked appeal'
		},
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-5',
					rows: [
						{
							key: {
								text: 'Appeal reference'
							},
							value: {
								html: linkCandidateHtml
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add?backUrl=/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add/check-and-confirm`
									}
								]
							}
						},
						{
							key: {
								text: 'Which is the lead appeal?'
							},
							value: {
								html: leadAppealHtml
							}
						}
					]
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">${appealData.appealReference} will be the lead appeal of ${linkCandidateSummary.appealReference}</p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @returns {PageContent}
 * */
export function alreadyLinkedPage(appealData, linkCandidateSummary) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const title = `You have already linked appeal ${linkCandidateSummary.appealReference}`;

	/** @type {PageContent} */
	const pageContent = {
		title,
		heading: title,
		preHeading: `Appeal ${shortAppealReference}`,
		submitButtonProperties: {
			text: 'Add a different linked appeal'
		}
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} childRef
 * @param {string} appealId
 * @param {string} relationshipId
 * @param {string} backLinkAppealId
 * @returns {PageContent}
 */
export function unlinkAppealPage(appealData, childRef, appealId, relationshipId, backLinkAppealId) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const shortChildAppealReference = appealShortReference(childRef);
	const titleAndHeading = `Do you want to unlink the appeal ${shortChildAppealReference} from appeal ${shortAppealReference}?`;

	/** @type {PageComponent} */
	const selectAppealTypeRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'unlinkAppeal',
			idPrefix: 'unlink-appeal',
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
		backLinkUrl: generateUnlinkAppealBackLinkUrl(appealId, relationshipId, backLinkAppealId),
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectAppealTypeRadiosComponent]
	};

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} relationshipId
 * @param {string} backLinkAppealId
 * @returns {string}
 */
export function generateUnlinkAppealBackLinkUrl(appealId, relationshipId, backLinkAppealId) {
	return appealId === backLinkAppealId
		? `/appeals-service/appeal-details/${backLinkAppealId}/linked-appeals/manage`
		: `/appeals-service/appeal-details/${backLinkAppealId}/linked-appeals/manage/${relationshipId}/${appealId}`;
}
