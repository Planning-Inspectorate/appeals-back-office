import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '#config/config.js';
import { ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL } from '@pins/appeals/constants/support.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/**
 * @typedef {object} NotifySend
 * @property {string} templateName
 * @property {string} subjectTemplate
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {string} recipientEmail
 * @property {Record<string, string | string[]>} personalisation
 */

/**
 * @type {Record<string, string>}
 */
const templateCache = {};

/**
 * Retrieves template held in cache or from the file if not retrieved before
 *
 * @param {string} templateName
 * @returns {string}
 */
function getTemplate(templateName) {
	if (!templateCache[templateName]) {
		const templatePath = path.join(__dirname, './templates', `${templateName}.md`);
		templateCache[templateName] = fs.readFileSync(templatePath, { encoding: 'utf8' });
	}
	return templateCache[templateName];
}

/**
 * @param {NotifySend} options
 * @returns {Promise<void>}
 */
const notifySend = async (options) => {
	const { templateName, subjectTemplate, notifyClient, recipientEmail, personalisation } = options;
	const genericTemplate = config.govNotify.template.generic;
	try {
		const template = getTemplate(templateName);
		const content = Object.keys(personalisation).reduce(
			// @ts-ignore
			(result, key) => {
				let value = personalisation[key];
				// Allow for arrays
				if (Array.isArray(value)) {
					value = value.map((item) => '- ' + item).join('\n');
				}
				return result.replaceAll(`((${key}))`, value);
			},
			template
		);
		const subject = Object.keys(personalisation).reduce(
			// @ts-ignore
			(result, key) => result.replaceAll(`((${key}))`, personalisation[key]),
			subjectTemplate
		);
		await notifyClient.sendEmail(genericTemplate, recipientEmail, { content, subject });
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};

export default notifySend;
