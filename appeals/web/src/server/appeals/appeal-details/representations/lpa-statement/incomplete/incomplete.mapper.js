import { appealShortReference } from '#lib/appeals-formatter.js';
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
		hint: 'Select all that apply.'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {string} deadlineString
 * @returns {PageContent}
 * */
export function setNewDatePage(appealDetails, deadlineString) {
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
				hint: `We will update the statement due date to ${deadlineString}.`
			})
		]
	};

	return pageContent;
}
