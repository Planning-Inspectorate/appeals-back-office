import config from '#config/config.js';
import { emulateSendEmail, generateNotifyPreview } from '#notify/emulate-notify.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_SYSTEM_UUID,
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOTIFICATION_PERSONALISATION
} from '@pins/appeals/constants/support.js';
import { EOL } from 'node:os';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
export const emailRequestCache = new Set();

export const templatesDir = path.join(__dirname, 'templates');

export const nunjucksEnv = nunjucks.configure(templatesDir, {
	throwOnUndefined: true
});
/**
 * @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal
 * @typedef {Record<string, string | undefined | null | string[] | boolean | number | Object>} Personalisation
 */

/**
 * @typedef {object} NotifySend
 * @property {string} templateName
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {string | null | undefined} recipientEmail
 * @property {Personalisation} personalisation
 * @property {string|undefined} [azureAdUserId]
 * @property {any} [appeal]
 */

/**
 * @param {Appeal | null} [appeal]
 * @returns {boolean | null}
 */
const resolveSuppression = (appeal) => {
	if (appeal?.suppressNotifications === true) return true;
	if (appeal?.suppressNotifications === false) return false;
	if (appeal?.appealType?.suppressNotifications === true) return true;
	if (appeal?.appealType?.suppressNotifications === false) return false;
	return null;
};

/**
 * @param {Appeal | null} [appeal]
 * @param {string | null} [appealReference]
 * @param {import('#db-client/client.ts').PrismaClient | any} [prismaClient]
 * @returns {Promise<boolean>}
 */
export const isNotificationSuppressed = async (appeal, appealReference, prismaClient) => {
	const memoryCheck = resolveSuppression(appeal);
	if (memoryCheck !== null) return memoryCheck;

	if (prismaClient && appealReference) {
		try {
			const appealRecord = await prismaClient.appeal.findUnique({
				where: { reference: appealReference },
				select: {
					suppressNotifications: true,
					appealType: {
						select: {
							suppressNotifications: true
						}
					}
				}
			});

			const dbCheck = resolveSuppression(appealRecord);
			if (dbCheck !== null) return dbCheck;
		} catch (error) {
			logger.error(
				error,
				`Failed to resolve notification suppression for appeal ${appealReference}`
			);
			throw error;
		}
	}

	return false;
};

/**
 * @param {NotifySend} options
 * @returns {Promise<boolean>}
 */
export const notifySend = async (options) => {
	const { templateName, notifyClient, recipientEmail, personalisation, azureAdUserId, appeal } =
		options;
	if (!templateName) {
		throw new Error(
			stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
				'a missing template name'
			])
		);
	}
	if (!personalisation || !personalisation.appeal_reference_number) {
		throw new Error(ERROR_NOTIFICATION_PERSONALISATION);
	}

	const appealReference = String(personalisation.appeal_reference_number);
	const prismaClient = (await import('#utils/database-connector.js')).databaseConnector;

	const suppressed = await isNotificationSuppressed(appeal, appealReference, prismaClient);
	if (suppressed) {
		logger.info(
			{ appealReference, templateName },
			'Notification suppressed by appeal/appealType configuration.'
		);
		return false;
	}

	if (!recipientEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}
	if (!personalisation.front_office_url) {
		personalisation.front_office_url = config.frontOffice.url;
	}

	const fingerprint = `${appealReference}-${templateName}-${recipientEmail}`;

	if (process.env.NODE_ENV !== 'test') {
		if (emailRequestCache.has(fingerprint)) {
			logger.info('Blocking duplicate.');
			return false;
		}
		emailRequestCache.add(fingerprint);
		setTimeout(() => emailRequestCache.delete(fingerprint), 2000);
	}

	let existingNotification;

	if (process.env.NODE_ENV !== 'test' && prismaClient) {
		const previousEmail = await prismaClient.appealNotification.findFirst({
			where: {
				caseReference: appealReference,
				template: templateName,
				recipient: recipientEmail
			},
			orderBy: { dateCreated: 'desc' }
		});

		if (previousEmail) {
			const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

			existingNotification = await prismaClient.appealNotification.findFirst({
				where: {
					caseReference: appealReference,
					template: templateName,
					recipient: recipientEmail,
					dateCreated: { gte: thirtySecondsAgo }
				}
			});
		}
	}

	const genericTemplate = config.govNotify.template.generic;
	const content = renderTemplate(`${templateName}.content.md`, personalisation).replaceAll(
		'\r\n',
		'\n'
	);

	if (content === existingNotification?.message) {
		logger.info({ appealReference, templateName }, 'Blocked: Identical email found in 30s window.');
		return false;
	}

	const subject = renderTemplate(`${templateName}.subject.md`, personalisation);
	const renderedMessage = generateNotifyPreview(content);
	const renderedSubject = generateNotifyPreview(`Subject: ${subject}`, true);
	try {
		if (config.useNotifyEmulator) {
			emulateSendEmail(
				personalisation.appeal_reference_number?.toString() || 'UNKNOWN REF',
				templateName,
				recipientEmail,
				subject,
				content
			);
		} else {
			await notifyClient.sendEmail(genericTemplate, recipientEmail, { subject, content });
		}

		if (prismaClient) {
			await prismaClient.appealNotification.createMany({
				data: [
					{
						caseReference: String(personalisation.appeal_reference_number),
						template: templateName,
						subject,
						renderedSubject,
						recipient: recipientEmail,
						message: content,
						renderedMessage,
						sender: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID
					}
				]
			});
		}
		return true;
	} catch (error) {
		logger.error(error);
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL, { cause: error });
	}
};

/**
 * @param {string} name
 * @param {Personalisation} personalisation
 * @returns {string}
 */
export const renderTemplate = (name, personalisation) => {
	try {
		// note that nunjucks returns a string with EOL characters specific to the os; we want to replace them with \n to make them the same in the logs and tests.
		return nunjucksEnv.render(name, personalisation).trim().split(EOL).join('\n');
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
					]),
					{ cause: e }
				);
			}
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`'${errorMessage}' at line #${line} and column #${column} in template: ${name}`
				]),
				{ cause: e }
			);
		} else if (message.includes('template not found')) {
			throw new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					`template not found: ${name}`
				]),
				{ cause: e }
			);
		}
		throw new Error(
			stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
				`unknown error: ${message}`
			]),
			{ cause: e }
		);
	}
};

export default {
	templatesDir,
	nunjucksEnv,
	notifySend,
	renderTemplate,
	emailRequestCache
};
