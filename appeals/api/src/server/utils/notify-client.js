import config from '#config/config.js';
import {
	ERROR_GOV_NOTIFY_API_KEY_NOT_SET,
	ERROR_GOV_NOTIFY_CONNECTIVITY,
	NODE_ENV_PRODUCTION
} from '@pins/appeals/constants/support.js';
import { NotifyClient as GovNotify } from 'notifications-node-client';
import logger from './logger.js';
import stringTokenReplacement from './string-token-replacement.js';

/** @typedef {import('@pins/appeals.api').Appeals.NotifyTemplate} NotifyTemplate */

class NotifyClient {
	/** @type {any} */
	govNotify = null;

	constructor() {
		this.init();
	}

	init() {
		if (config.govNotify.api.key) {
			this.govNotify = new GovNotify(config.govNotify.api.key);
			return;
		}

		logger.error(ERROR_GOV_NOTIFY_API_KEY_NOT_SET);
	}

	/**
	 * @param {string} recipientEmail
	 * @returns {string}
	 */
	setRecipientEmail(recipientEmail) {
		const {
			govNotify: { testMailbox },
			NODE_ENV
		} = config;

		return NODE_ENV !== NODE_ENV_PRODUCTION ? testMailbox : recipientEmail;
	}

	/**
	 * @param {NotifyTemplate} template
	 * @param {string | undefined} recipientEmail
	 * @param {{[key: string]: string | string[]}} [personalisation]
	 */
	async sendEmail(template, recipientEmail, personalisation) {
		if (!this.govNotify) {
			logger.error('GovNotify client is not initialized.');
			return;
		}

		if (!recipientEmail) {
			logger.error('No recipient email provided.');
			return;
		}

		try {
			recipientEmail = this.setRecipientEmail(recipientEmail);
			await this.govNotify.sendEmail(template.id, recipientEmail, {
				emailReplyToId: null,
				personalisation,
				reference: null
			});
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'response' in error &&
				// @ts-ignore
				error.response?.status
			) {
				logger.error(
					error,
					stringTokenReplacement(ERROR_GOV_NOTIFY_CONNECTIVITY, [
						// @ts-ignore
						error.response?.status,
						template.id
					])
				);
			} else {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				logger.error(`An unexpected error occurred: ${errorMessage}`);
			}
			throw error;
		}
	}
}

export default NotifyClient;
