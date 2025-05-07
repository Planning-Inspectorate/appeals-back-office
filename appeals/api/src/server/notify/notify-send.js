import path from 'path';
import { fileURLToPath } from 'url';
import config from '#config/config.js';
import {
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOTIFICATION_PERSONALISATION
} from '@pins/appeals/constants/support.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { emulateSendEmail } from '#notify/emulate-notify.js';
import logger from '#utils/logger.js';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const templatesDir = path.join(__dirname, 'templates');

export const nunjucksEnv = nunjucks.configure(templatesDir, {
	throwOnUndefined: true
});

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
	if (personalisation?.appeal_reference_number === null) {
		throw new Error(ERROR_NOTIFICATION_PERSONALISATION);
	}
	const genericTemplate = config.govNotify.template.generic;
	const content = renderTemplate(`${templateName}.content.md`, personalisation);
	const subject = renderTemplate(`${templateName}.subject.md`, personalisation);
	try {
		if (config.useNotifyEmulator) {
			emulateSendEmail(templateName, recipientEmail, subject, content);
		} else {
			await notifyClient.sendEmail(genericTemplate, recipientEmail, { subject, content });
		}

		const prismaClient = (await import('#utils/database-connector.js')).databaseConnector;
		if (prismaClient) {
			await prismaClient.appealNotification.createMany({
				data: [
					{
						caseReference: String(personalisation.appeal_reference_number),
						template: templateName,
						subject,
						recipient: recipientEmail,
						message: content
					}
				]
			});
		}
	} catch (error) {
		logger.error(error);
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};

/**
 * @param {string} name
 * @param {Personalisation} personalisation
 * @returns {string}
 */
function renderTemplate(name, personalisation) {
	try {
		return nunjucksEnv.render(name, personalisation).trim();
	} catch (/** @type {any} */ e) {
		logger.error({ error: e, template: name }, 'failed to render template');
		const message = e?.message || '';

		// notify error messages are in the form:
		// [template path] [Line X, Column Y]
		// error message
		const matches = message.match(/\[Line (\d+), Column (\d+)\]\s+(.*)/);
		if (matches) {
			const line = matches[1];
			const column = matches[2];
			const errorMessage = matches[3] || 'issue';
			if (message.includes('attempted to output null or undefined value')) {
				throw new Error(
					stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
						`missing parameter at line #${line} and column #${column} in template: ${name}`
					])
				);
			}
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`'${errorMessage}' at line #${line} and column #${column} in template: ${name}`
				])
			);
		} else if (message.includes('template not found')) {
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`template not found: ${name}`
				])
			);
		}
		throw new Error(
			stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
				`unknown error: ${message}`
			])
		);
	}
}

export default {
	templatesDir,
	nunjucksEnv,
	notifySend
};
