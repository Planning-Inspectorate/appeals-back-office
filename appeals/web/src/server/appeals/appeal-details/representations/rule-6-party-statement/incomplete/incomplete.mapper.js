import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @param {string} rule6PartyId
 * @returns {PageContent}
 */
export function rejectRule6PartyStatementPage(appealDetails, rule6PartyId) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why is the statement incomplete?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {string} deadlineString
 * @param {string} rule6PartyId
 * @returns {PageContent}
 * */
export function setNewDatePage(appealDetails, deadlineString, rule6PartyId) {
	/** @type {PageContent} */
	const pageContent = {
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/reasons`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		submitButtonProperties: {
			text: 'Continue'
		},
		pageComponents: [
			yesNoInput({
				name: 'setNewDate',
				legendText: 'Do you want to allow the rule 6 party to resubmit their statement?',
				hint: `We will update the statement due date to ${deadlineString}.`
			})
		]
	};

	return pageContent;
}
