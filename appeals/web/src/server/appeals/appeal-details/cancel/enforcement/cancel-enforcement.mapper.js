import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appeal
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption[]} reasonOptions
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @param {import('@pins/express').ValidationErrors} [errors]
 * @returns {PageContent}
 */
export const invalidReasonPage = (appeal, reasonOptions, backLinkUrl, values = {}, errors) => {
	const shortAppealReference = appealShortReference(appeal.appealReference);
	/** @type {import('#appeals/appeals.types.js').CheckboxItemParameter[]} */
	const items = reasonOptions.map((reason) => ({
		value: String(reason.id),
		text: reason.name,
		checked: values['invalidReason']?.includes(String(reason.id)),
		conditional: reason.hasText
			? {
					html: renderPageComponentsToHtml([
						{
							type: 'input',
							parameters: {
								id: `invalid-reason-${reason.id}-1`,
								name: `invalidReason-${reason.id}`,
								value: values[`invalidReason-${reason.id}`] || '',
								errorMessage: errors?.[`invalidReason-${reason.id}-1`]?.msg,
								label: {
									text: 'Enter a reason',
									classes: 'govuk-label--s'
								}
							}
						}
					])
				}
			: undefined
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal invalid?`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Why is the appeal invalid?',
		hint: 'Select all that apply.',
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					attributes: {
						id: 'invalid-reason-checkboxes'
					},
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					items,
					errorMessage: errors?.invalidReason && { text: errors.invalidReason.msg }
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appeal
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @param {import('@pins/express').ValidationErrors} [errors]
 * @returns {PageContent}
 */
export const legalInterestPage = (appeal, backLinkUrl, values = {}, errors) => {
	const shortAppealReference = appealShortReference(appeal.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Did the appellant send any information about their legal interest in the land?',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'legalInterest',
				value: values['legalInterest'],
				legendText:
					'Did the appellant send any information about their legal interest in the land?',
				legendIsPageHeading: true,
				errorMessage: errors?.legalInterest?.msg,
				attributes: {
					id: 'legal-interest'
				}
			})
		]
	};

	return pageContent;
};
