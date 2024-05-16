import { NotifyClient as GovNotify } from 'notifications-node-client';
import config from '#config/config.js';
import logger from './logger.js';
import {
	ERROR_GOV_NOTIFY_CONNECTIVITY,
	ERROR_GOV_NOTIFY_API_KEY_NOT_SET,
	NODE_ENV_PRODUCTION
} from '#endpoints/constants.js';
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

		return (recipientEmail =
			testMailbox || NODE_ENV !== NODE_ENV_PRODUCTION ? testMailbox : recipientEmail);
	}

	/**
	 * @param {NotifyTemplate} template
	 * @param {string | undefined} recipientEmail
	 * @param {{[key: string]: string}} [personalisation]
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
			if (config.NODE_ENV !== NODE_ENV_PRODUCTION) {
				logger.error(error);
			}
			// @ts-ignore
			if (
				typeof error === 'object' &&
				error !== null &&
				'response' in error &&
				error.response.status
			) {
				// @ts-ignore
				logger.error(
					stringTokenReplacement(ERROR_GOV_NOTIFY_CONNECTIVITY, [error.response.status])
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
