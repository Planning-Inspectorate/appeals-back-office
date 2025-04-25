/**
 * This file houses the functions which send Notify emails
 * for certain representation types when they transition
 * to certain statuses. Once you've added a new function
 * here you can wire it up in the service map and the existing
 * code will the switching logic for you.
 */

import { FRONT_OFFICE_URL } from '@pins/appeals/constants/support.js';
import { formatExtendedDeadline, formatReasons, formatSiteAddress } from './utils.js';
import { notifySend } from '#notify/notify-send.js';

/**
 * @typedef {object} ServiceArgs
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {Appeal} appeal
 * @property {Representation} representation
 * @property {boolean} allowResubmit
 * */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#endpoints/representations/representations.service.js').UpdatedDBRepresentation} Representation */
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
	const { ipCommentsDueDate = null } = appeal.appealTimetable || {};
	const extendedDeadline = await formatExtendedDeadline(allowResubmit, ipCommentsDueDate);
	const recipientEmail = representation.represented?.email;
	if (recipientEmail) {
		const templateName = extendedDeadline
			? 'ip-comment-rejected-deadline-extended'
			: 'ip-comment-rejected';

		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons,
			deadline_date: extendedDeadline
		};

		await notifySend({
			templateName,
			notifyClient,
			recipientEmail,
			personalisation
		});
	}
};

/** @type {Service} */
export const appellantFinalCommentRejection = async ({ notifyClient, appeal, representation }) => {
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	await notifySend({
		templateName: 'final-comment-rejected-appellant',
		notifyClient,
		recipientEmail,
		personalisation: {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons
		}
	});
};

/** @type {Service} */
export const lpaFinalCommentRejection = async ({ notifyClient, appeal, representation }) => {
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);

	const recipientEmail = appeal.lpa?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	await notifySend({
		templateName: 'final-comment-rejected-lpa',
		notifyClient,
		recipientEmail,
		personalisation: {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			reasons
		}
	});
};

/** @type {Service} */
export const lpaStatementIncomplete = async ({
	notifyClient,
	appeal,
	representation,
	allowResubmit
}) => {
	const siteAddress = formatSiteAddress(appeal);
	const reasons = formatReasons(representation);
	const { lpaStatementDueDate = null } = appeal.appealTimetable || {};
	const extendedDeadline = await formatExtendedDeadline(allowResubmit, lpaStatementDueDate);

	const recipientEmail = appeal.lpa?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	await notifySend({
		templateName: 'lpa-statement-incomplete',
		notifyClient,
		recipientEmail,
		personalisation: {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			deadline_date: extendedDeadline,
			reasons
		}
	});
};
