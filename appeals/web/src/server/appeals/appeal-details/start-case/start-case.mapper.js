import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} today
 * @returns {PageContent}
 */
export function startCasePage(appealId, appealReference, today) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Start case',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Start case',
		pageComponents: [
			{
				type: 'warning-text',
				parameters: {
					text: `Confirming will activate the timetable on ${today}. Start letters will be sent to the relevant parties.`
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

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function startCaseConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Case started',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Case started',
					headingLevel: 1,
					html: `Case reference number<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">Case timetable activated. The relevant parties have been informed.</p>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} today
 * @returns {PageContent}
 */
export function changeDatePage(appealId, appealReference, today) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Change start date',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Change start date',
		pageComponents: [
			{
				type: 'warning-text',
				parameters: {
					text: `Confirming will change the start day to ${today} and update the case timetable. New start letters will be sent to relevant parties.`
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

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function changeDateConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Start date changed',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Start date changed',
					headingLevel: 1,
					html: `Case reference number<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">Case timetable updated. The relevant parties have been informed.</p>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}
