import path from 'path';
import fs from 'fs';
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
 * Template variable names must:
 * - Be within double brackets (( ... ))
 * - Start with a lowercase letter
 * - Only contain lowercase letters, digits, underscores
 * - Underscore is allowed, but not at the start or end and no double underscores
 *
 * @param {string} template
 */
function validateTemplate(template) {
	const regex = /\(\((.*?)\)\)/g; // capture everything inside ((...))

	const allMatches = [...template.matchAll(regex)].map((match) => match[1]);

	// Define the valid pattern
	const validPattern = /^[a-z](?!.*__)[a-z0-9_]*[a-z0-9]$/;

	// Filter to get only invalid matches
	const invalidMatches = allMatches.filter((match) => !validPattern.test(match));
	if (invalidMatches.length > 0) {
		throw new Error(
			stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
				`the following corrupt parameter definitions in the template: ((${invalidMatches.join(
					')), (('
				)}))`
			])
		);
	}
}

/**
 * Retrieves template held in cache or from the file if not retrieved before
 *
 * @param {string} templateName
 * @returns {string}
 */
function getTemplate(templateName) {
	if (!templateCache[templateName]) {
		const templatePath = path.join(__dirname, 'templates', `${templateName}.md`);
		let template;
		try {
			template = fs.readFileSync(templatePath, { encoding: 'utf8' }).trim();
		} catch {
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`a missing template "${templateName}.md"`
				])
			);
		}
		validateTemplate(template);
		templateCache[templateName] = template;
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
		const message = 'missing personalisation parameters: ' + content.match(/\(\((.*)\)\)/g);
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
	if (personalisation?.appeal_reference_number === null) {
		throw new Error(ERROR_NOTIFICATION_PERSONALISATION);
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
