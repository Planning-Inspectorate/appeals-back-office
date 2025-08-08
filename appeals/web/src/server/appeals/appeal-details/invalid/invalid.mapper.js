import { appealShortReference } from '#lib/appeals-formatter.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealData
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export function mapInvalidAppealReasonsPage(appealData, session, errorMessage) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const selectedReasons = session.appealInvalidReasons;

	/** @type {import('#appeals/appeals.types.js').CheckboxItemParameter[]} */
	const invalidAppealReasonOptions = invalidAppealReasons.map((item) => ({
		text: item.text,
		value: item.value,
		checked: selectedReasons && selectedReasons.includes(item.id)
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal invalid?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/cancel`,
		preHeading: `Appeal ${shortAppealReference} - mark as invalid`,
		pageComponents: [
			{
				type: 'hint',
				parameters: {
					text: 'Select all that apply'
				}
			},
			{
				type: 'checkboxes',
				parameters: {
					name: 'appealInvalidReasons',
					idPrefix: 'appeal-invalid-reasons',
					classes: 'govuk-checkboxes--medium',
					items: invalidAppealReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	invalidAppealReasonOptions
		.filter((option) => option.value == 'other-reason')
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'appealInvalidReasons-',
				'appeal-invalid-reasons-',
				'Enter a reason'
			)
		);
	return pageContent;
}

const invalidAppealReasons = [
	{
		id: 1,
		text: 'Appeal has not been submitted on time',
		value: 'appeal-not-on-time'
	},
	{
		id: 2,
		text: 'Documents have not been submitted on time',
		value: 'documents-not-on-time'
	},
	{
		id: 3,
		text: 'The appellant does not have the right to appeal',
		value: 'appellant-no-right'
	},
	{
		id: 4,
		text: 'Other reason',
		value: 'other-reason'
	}
];
