/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} templateName
 * @param {{}} [personalisation]
 * @returns {Promise<{renderedHtml:string}>}
 */
export const generateNotifyPreview = (apiClient, templateName, personalisation) =>
	apiClient.post(`appeals/notify-preview/${templateName}`, { json: personalisation }).json();
