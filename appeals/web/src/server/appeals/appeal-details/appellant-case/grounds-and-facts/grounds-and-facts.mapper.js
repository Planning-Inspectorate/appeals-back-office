/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {Appeal} appealData
 * @param {Array<import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption>} groundsForAppeal
\ * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export const groundsAndFactsPage = (
	appealData,
	groundsForAppeal,
	errorMessage
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const mappedGroundOptions = groundsForAppeal.map((ground) => ({
		value: ground.name,
		text: `Ground (${ground.name})`,
		conditional: {
			html: renderPageComponentsToHtml([
				{
					type: 'input',
					parameters: {
						name: `ground-${ground.name}`,
						id: `ground-${ground.name}`,
						label: {
							text: 'Enter a reason',
						}
					}
				}
			])
		}

	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Choose your grounds of appeal',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					idPrefix: 'grounds-and-facts',
					name: 'groundsAndFacts',

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
