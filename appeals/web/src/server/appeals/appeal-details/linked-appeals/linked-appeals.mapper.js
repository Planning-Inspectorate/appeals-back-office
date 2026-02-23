import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapNotificationBannersFromSession, radiosInput } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { LINK_APPEALS_UNLINK_OPERATION } from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @param {import('express-session').Session} session
 * @returns {PageContent}
 */
export function manageLinkedAppealsPage(appealData, session) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const linkedAppeals = [appealData, ...appealData.linkedAppeals];

	const rows = linkedAppeals.map((linkedAppeal) => {
		const unlinkUrl =
			`/appeals-service/appeal-details/${appealData.appealId}/linked-appeals${linkedAppeal.isParentAppeal}` &&
			// @ts-ignore
			linkedAppeal.linkedAppeals?.length > 1
				? 'unlink-lead-appeal'
				: `unlink-appeal/${linkedAppeal.appealId}`;
		const childAppealRef = appealShortReference(linkedAppeal?.appealReference) || '';
		const hiddenText = `appeal ${numberToAccessibleDigitLabel(childAppealRef)}`;

		return [
			{
				html: `<a class="govuk-link" href="/appeals-service/appeal-details/${
					linkedAppeal?.appealId
				}" aria-label="Appeal ${numberToAccessibleDigitLabel(
					childAppealRef
				)}" data-cy="${linkedAppeal?.appealReference}">${childAppealRef}</a>${linkedAppeal.isParentAppeal ? ' (lead)' : ''}<br>${linkedAppeal.appealType}`
			},
			{
				html: (() => {
					return `<a class="govuk-link" data-cy="unlink-appeal-${appealData.appealReference}" href="${unlinkUrl}">Unlink<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
				})(),
				classes: 'govuk-!-text-align-right'
			}
		];
	});

	const changeLeadUrl =
		linkedAppeals?.length > 2 ? 'change-lead-appeal' : `confirm-change-lead-appeal`;

	const changeLeadAppealLink = `<div class="govuk-!-padding-bottom-10"><a class="govuk-link" href="/appeals-service/appeal-details/${
		appealData?.appealId
	}/linked-appeals/${changeLeadUrl}" aria-label="change-lead-appeal" data-cy="${appealData?.appealReference}"
								  >Change lead appeal</a></div>`;

	/** @type {PageComponent} */
	const childAppealsTable = {
		type: 'table',
		parameters: {
			rows: [
				[
					{
						html: changeLeadAppealLink,
						colspan: 2
					}
				],
				...rows
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Linked appeals - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} (lead)`,
		heading: 'Linked appeals',
		pageComponents: [
			...mapNotificationBannersFromSession(session, 'manageLinkedAppeals', appealData.appealId),
			childAppealsTable
		]
	};

	return pageContent;
}

/**
 *
 * @param {string} operation
 * @returns {string}
 */
function operationText(operation) {
	return `${operation === 'unlink' ? 'unlink' : 'update'} lead appeal`;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} childRef
 * @returns {PageContent}
 */
export function unlinkAppealPage(appealData, childRef) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const shortChildAppealReference = appealShortReference(childRef);
	const titleAndHeading = `Confirm that you want to unlink linked appeal ${shortChildAppealReference}`;

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/manage`,
		preHeading: `Appeal ${shortAppealReference} (lead)`,
		heading: titleAndHeading,
		pageComponents: []
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {Appeal} leadAppeal
 * @param {string} operation
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function changeLeadAppealPage(appealData, leadAppeal, operation, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const titleAndHeading = 'Which is the new lead appeal?';

	/** @type {PageComponent} */
	const childAppealsComponent = radiosInput({
		name: 'leadAppeal',
		value: `${leadAppeal?.appealId ?? ''}`,
		idPrefix: 'lead-appeal',
		legendText: titleAndHeading,
		legendIsPageHeading: true,
		items: appealData.linkedAppeals.map((appeal) => ({
			attributes: { 'data-cy': appealShortReference(appeal.appealReference) },
			value: appeal.appealId,
			text: appealShortReference(appeal.appealReference),
			hint: {
				html: `<span>${appeal.address.addressLine1}</span></br><span>${appeal.appealType}</span>`
			}
		})),
		errorMessage: errors?.leadAppeal.msg ?? null
	});

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/manage`,
		preHeading: `Appeal ${shortAppealReference} (lead) - ${operationText(operation)}`,
		pageComponents: [childAppealsComponent]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {Appeal} leadAppeal
 * @param {string} operation
 * @returns {PageContent}
 */
export function confirmChangeLeadAppealPage(appealData, leadAppeal, operation) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const titleAndHeading = `Check details and ${operationText(operation)}`;

	const changePath =
		operation === LINK_APPEALS_UNLINK_OPERATION ? 'unlink-lead-appeal' : 'change-lead-appeal';

	const backLinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/${
		appealData.linkedAppeals.length > 1 ? changePath : 'manage'
	}`;

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Which is the new lead appeal?'
					},
					value: {
						// @ts-ignore
						html: `<span>${appealShortReference(leadAppeal.appealReference)}</span></br><span>${leadAppeal.address?.addressLine1}</span></br><span>${leadAppeal.appealType}</span>`
					},
					actions: {
						items: [
							{
								href: backLinkUrl,
								text: 'Change',
								visuallyHiddenText: 'lead appeal'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		heading: titleAndHeading,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} (lead) - ${operationText(operation)}`,
		pageComponents: [summaryListComponent],
		submitButtonProperties: {
			text: capitalizeFirstLetter(operationText(operation)),
			type: 'submit'
		}
	};

	return pageContent;
}
