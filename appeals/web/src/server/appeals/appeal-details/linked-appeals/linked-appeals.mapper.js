import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function manageLinkedAppealsPage(appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const linkedAppeals = [appealData, ...appealData.linkedAppeals];

	const rows = linkedAppeals.map((linkedAppeal) => {
		const unlinkUrl =
			`/appeals-service/appeal-details/${appealData.appealId}/linked-appeals${linkedAppeal.isParentAppeal}` &&
			// @ts-ignore
			linkedAppeal.linkedAppeals?.length > 1
				? 'select-lead-appeal'
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

	const changeLeadAppealLink = `<div class="govuk-!-padding-bottom-10"><a class="govuk-link" href="/appeals-service/appeal-details/${
		appealData?.appealId
	}/linked-appeals/change-lead-appeal" aria-label="change-lead-appeal" data-cy="${appealData?.appealReference}"
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
		pageComponents: [childAppealsTable]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} childRef
 * @param {string} appealId
 * @returns {PageContent}
 */
export function unlinkAppealPage(appealData, childRef, appealId) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const shortChildAppealReference = appealShortReference(childRef);
	const titleAndHeading = `Confirm that you want to unlink linked appeal ${shortChildAppealReference}`;

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/linked-appeals/manage`,
		preHeading: `Appeal ${shortAppealReference} (lead)`,
		heading: titleAndHeading,
		pageComponents: []
	};

	return pageContent;
}
