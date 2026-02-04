import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {object} CheckYourAnswersParams
 * @property {string} title
 * @property {string} backLinkUrl
 * @property {string} preHeading
 * @property {string} heading
 * @property {string} submitButtonText
 * @property {{ [key: string]: {value?: string, html?: string, pageComponents?: PageComponent[], actions?: { [text: string]: { href: string, visuallyHiddenText: string, attributes?: Record<string, string> } }} }} responses
 * @property {PageComponent[]} [before]
 * @property {PageComponent[]} [after]
 */

/**
 * @param {CheckYourAnswersParams} params
 */
export const checkYourAnswersComponent = ({
	title,
	backLinkUrl,
	preHeading,
	heading,
	submitButtonText,
	responses,
	before = [],
	after = []
}) => {
	/** @type {PageComponent[]} */
	const pageComponents = [
		...before,
		{
			type: 'summary-list',
			parameters: {
				rows: Object.entries(responses).map(
					([key, { value, html, pageComponents: rowComponents, actions = {} }]) => {
						return {
							key: { text: key },
							value: value
								? {
										text: value
									}
								: {
										html,
										pageComponents: rowComponents || []
									},
							actions: {
								items: Object.entries(actions).map(([text, item]) => {
									return {
										html: `${text} <span class="govuk-visually-hidden">${item.visuallyHiddenText}</span>`,
										href: item.href,
										...(item.attributes && { attributes: item.attributes })
									};
								})
							}
						};
					}
				)
			}
		},
		...after
	];

	preRenderPageComponents(pageComponents);

	return {
		title,
		backLinkUrl,
		preHeading,
		heading,
		submitButtonProperties: {
			text: submitButtonText
		},
		pageComponents
	};
};

export const checkYourAnswersTemplate = 'patterns/check-and-confirm-page.pattern.njk';

/**
 * @param {CheckYourAnswersParams} params
 * @param {import("@pins/express").RenderedResponse<{}, {}>} response
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {void}
 */
export const renderCheckYourAnswersComponent = (params, response, errors) => {
	return response.render(checkYourAnswersTemplate, {
		errors,
		pageContent: checkYourAnswersComponent(params)
	});
};
