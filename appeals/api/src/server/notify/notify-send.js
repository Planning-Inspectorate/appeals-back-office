import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '#config/config.js';
import {
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { emulateSendEmail } from '#notify/emulate-notify.js';
import logger from '#utils/logger.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/**
 * @typedef {Record<string, string | string[]>} Personalisation
 */

/**
 * @typedef {object} NotifySend
 * @property {string} templateName
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {string | null | undefined} recipientEmail
 * @property {Personalisation} personalisation
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
		const templatePath = path.join(__dirname, 'templates', `${templateName}.md`);
		try {
			templateCache[templateName] = fs.readFileSync(templatePath, { encoding: 'utf8' }).trim();
		} catch {
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`a missing template "${templateName}.md"`
				])
			);
		}
	}
	return templateCache[templateName];
}

/**
 * Populate the template with substituted personalisation values
 *
 * @param {string} template
 * @param {Personalisation} personalisation
 * @returns {string}
 */
function populateTemplate(template, personalisation) {
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
	if (content.includes('((') && content.includes('))')) {
		const message = 'missing personalisation parameters: ' + content.match(/\((\w+)\)/g);
		throw new Error(stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [message]));
	}
	// Make sure all white space at the end of each line is removed for the sake of Windows machines
	return content
		.split('\n')
		.map((line) => line.trim())
		.join('\n');
}

/**
 * @param {NotifySend} options
 * @returns {Promise<void>}
 */
export const notifySend = async (options) => {
	const { templateName, notifyClient, recipientEmail, personalisation } = options;
	if (!templateName) {
		throw new Error(
			stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
				'a missing template name'
			])
		);
	}
	if (!recipientEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}
	const genericTemplate = config.govNotify.template.generic;
	const content = populateTemplate(getTemplate(`${templateName}.content`), personalisation);
	const subject = populateTemplate(getTemplate(`${templateName}.subject`), personalisation);
	try {
		if (config.useNotifyEmulator) {
			emulateSendEmail(templateName, recipientEmail, subject, content);
		} else {
			await notifyClient.sendEmail(genericTemplate, recipientEmail, { subject, content });
		}
	} catch (error) {
		logger.error(error);
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};
