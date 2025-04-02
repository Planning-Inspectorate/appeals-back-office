import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/components/page-components/radio.js';
import { APPEAL_CASE_PROCEDURE } from 'pins-data-model';

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

/**
 * @param {string} appealReference
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function selectProcedurePage(appealReference, backLinkUrl) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal procedure',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)} - start case`,
		pageComponents: [
			radiosInput({
				name: 'appealProcedure',
				idPrefix: 'appeal-procedure',
				legendText: 'Appeal procedure',
				legendIsPageHeading: true,
				items: [
					{
						value: APPEAL_CASE_PROCEDURE.WRITTEN,
						text: 'Written representations',
						checked: false
					},
					{
						value: APPEAL_CASE_PROCEDURE.HEARING,
						text: 'Hearing',
						checked: false
					},
					{
						value: APPEAL_CASE_PROCEDURE.INQUIRY,
						text: 'Inquiry',
						checked: false
					}
				]
			})
		]
	};

	return pageContent;
}
