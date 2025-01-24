/**
 * This file houses the functions which send Notify emails
 * for certain representation types when they transition
 * to certain statuses. Once you've added a new function
 * here you can wire it up in the service map and the existing
 * code will the switching logic for you.
 */

import config from '#config/config.js';
import { ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL, FRONT_OFFICE_URL } from '#endpoints/constants.js';
import { formatExtendedDeadline, formatReasons, formatSiteAddress } from './utils.js';

/**
 * @typedef {object} ServiceArgs
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {Appeal} appeal
 * @property {Representation} representation
 * @property {boolean} allowResubmit
 * */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {(args: ServiceArgs) => Promise<void>} Service */

/** @type {Service} */
export const ipCommentRejection = async ({
	notifyClient,
	appeal,
	representation,
	allowResubmit
}) => {
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);
	const extendedDeadline = await formatExtendedDeadline(allowResubmit);
	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	const templateId = extendedDeadline
		? config.govNotify.template.commentRejectedDeadlineExtended
		: config.govNotify.template.commentRejected;

	try {
		await notifyClient.sendEmail(templateId, recipientEmail, {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons,
			deadline_date: extendedDeadline
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};

/** @type {Service} */
export const appellantFinalCommentRejection = async ({ notifyClient, appeal, representation }) => {
	const templateId = config.govNotify.template.commentRejected.appellant;
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	try {
		await notifyClient.sendEmail(templateId, recipientEmail, {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};

/** @type {Service} */
export const lpaFinalCommentRejection = async ({ notifyClient, appeal, representation }) => {
	const templateId = config.govNotify.template.commentRejected.lpa;
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);

	const recipientEmail = appeal.lpa?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	try {
		await notifyClient.sendEmail(templateId, recipientEmail, {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};
