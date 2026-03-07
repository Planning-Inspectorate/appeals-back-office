/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption} ReasonOption
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {Appeal} appealData
 * @param {(ReasonOption & {selected: boolean, text: string })[]} appealGrounds
 * @param {string} backLinkUrl
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const groundsFactsCheckPage = (appealData, appealGrounds, backLinkUrl, errors) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const mappedGroundOptions = appealGrounds.map((grounds) => {
		const groundsId = `grounds-facts-${grounds.id}-1`;
		const groundsName = `groundsFacts-${grounds.id}`;
		const groundsError = errors?.[`${groundsName}-1`];
		return {
			value: grounds.id,
			text: `Ground (${grounds.name})`,
			checked: grounds.selected || !!grounds.text,
			conditional: grounds.hasText
				? {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: groundsId,
									name: groundsName,
									value: grounds.text ?? '',
									...(groundsError && { errorMessage: { text: groundsError.msg } }),
									label: {
										text: 'Enter a reason',
										classes: 'govuk-label--s'
									}
								}
							}
						])
					}
				: undefined
		};
	});
	/** @type {PageContent} */
	const pageContent = {
		title: 'Which grounds do not match the facts?',
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					idPrefix: 'grounds-facts',
					name: 'groundsFacts',

					fieldset: {
						legend: {
							text: 'Which grounds do not match the facts?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					// @ts-ignore
					items: mappedGroundOptions,
					errorMessage: errors && { text: errors }
				}
			}
		]
	};

	return pageContent;
};
