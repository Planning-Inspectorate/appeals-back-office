import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function updateValidDatePage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Enter valid date for case',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Enter valid date for case ',
		submitButtonProperties: {
			text: 'Confirm',
			type: 'submit'
		},
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">This is the date all case documentation was received and the appeal was valid.</p>`
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
export function decisionValidConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal valid',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal valid',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<span class="govuk-body">The timetable is now created and published.</span>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<h2>What happens next</h2>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">We've sent the start letter email to the Appellant and LPA.</p>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">The case has been published on the Appeals Casework Portal.</p>`
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
