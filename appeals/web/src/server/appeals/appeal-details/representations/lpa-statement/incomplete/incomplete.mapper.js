import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate, addBusinessDays } from '#lib/dates.js';
import { yesNoInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function rejectLpaStatementPage(appealDetails) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why is the statement incomplete?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.',
		headingClasses: 'govuk-heading-l'
	};

	return pageContent;
}

/**
 * @param {import('got').Got} apiClient
 * @param {Appeal} appealDetails
 * @returns {Promise<PageContent>}
 * */
export async function setNewDatePage(apiClient, appealDetails) {
	const extendedDeadline = await addBusinessDays(apiClient, new Date(), 7);
	const deadlineString = dateISOStringToDisplayDate(extendedDeadline.toISOString());

	/** @type {PageContent} */
	const pageContent = {
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/incomplete/reasons`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		submitButtonProperties: {
			text: 'Continue'
		},
		pageComponents: [
			yesNoInput({
				name: 'setNewDate',
				legendText: 'Do you want to allow the LPA to resubmit their statement?',
				hint: `The LPA can resubmit their comments by ${deadlineString}`
			})
		]
	};

	return pageContent;
}
