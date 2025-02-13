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
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
					closing: '</div></div>'
				},
				parameters: {
					text: `Confirming will activate the timetable on ${today}. Start letters will be sent to the relevant parties.`
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening:
						'<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds"><form action="" method="POST" novalidate>',
					closing: '</form></div></div>'
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
