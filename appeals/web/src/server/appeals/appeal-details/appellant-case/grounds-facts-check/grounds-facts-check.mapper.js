/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {Appeal} appealData
 * @param {Array<import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption>} appealGrounds
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export const groundsFactsCheckPage = (appealData, appealGrounds, errorMessage) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const mappedGroundOptions = appealGrounds.map((ground) => ({
		value: ground.name,
		text: `Ground (${ground.name})`,
		conditional: {
			html: renderPageComponentsToHtml([
				{
					type: 'input',
					parameters: {
						name: `ground-${ground.name}`,
						id: ground.id,
						label: {
							text: 'Enter a reason'
						}
					}
				}
			])
		}
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Which grounds do not match the facts?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
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
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	return pageContent;
};
