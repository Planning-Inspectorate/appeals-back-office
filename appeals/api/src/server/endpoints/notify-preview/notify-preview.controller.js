/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { generateNotifyPreview } from '#notify/emulate-notify.js';
import { renderTemplate } from '#notify/notify-send.js';
import { loadEnvironment } from '@pins/platform';
const environment = loadEnvironment(process.env.NODE_ENV);
/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const generateNotifyTemplate = async (req, res) => {
	const personalisation = {
		...req.body,
		front_office_url: environment.FRONT_OFFICE_URL || ''
	};
	const template = renderTemplate(req.params.templateName, personalisation);
	const renderedHtml = generateNotifyPreview(template);
	const reply = { renderedHtml: renderedHtml };
	return res.send(reply);
};

export { generateNotifyTemplate };
