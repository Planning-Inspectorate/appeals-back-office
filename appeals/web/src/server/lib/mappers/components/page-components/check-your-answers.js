/**
 * @typedef {object} CheckYourAnswersParams
 * @property {string} title
 * @property {string} backLinkUrl
 * @property {string} preHeading
 * @property {string} heading
 * @property {string} submitButtonText
 * @property {{ [key: string]: {value?: string, html?: string, actions?: { [text: string]: string }} }} responses
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
	responses
}) => {
	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			parameters: {
				rows: Object.entries(responses).map(([key, { value, html, actions = {} }]) => ({
					key: { text: key },
					value: value
						? {
								text: value
						  }
						: {
								html
						  },
					actions: {
						items: Object.entries(actions).map(([text, href]) => ({
							text,
							href
						}))
					}
				}))
			}
		}
	];

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
