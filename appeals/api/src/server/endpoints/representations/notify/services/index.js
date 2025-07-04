/**
 * This file houses the functions which send Notify emails
 * for certain representation types when they transition
 * to certain statuses. Once you've added a new function
 * here you can wire it up in the service map and the existing
 * code will the switching logic for you.
 */

import { formatExtendedDeadline, formatReasons, formatSiteAddress } from './utils.js';
import { notifySend } from '#notify/notify-send.js';
import { getDetailsForCommentResubmission } from '@pins/appeals/utils/notify.js';

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
	const { ipCommentDueBeforeResubmissionDeadline, resubmissionDueDate } =
		await getDetailsForCommentResubmission(allowResubmit, ipCommentsDueDate);
	const recipientEmail = representation.represented?.email;

	if (recipientEmail) {
		const templateName = resubmissionDueDate
			? 'ip-comment-rejected-deadline-extended'
			: 'ip-comment-rejected';

		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			reasons,
			deadline_date: resubmissionDueDate,
			ip_comment_due_before_resubmission_deadline: ipCommentDueBeforeResubmissionDeadline
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
	const extendedDeadline = await formatExtendedDeadline(allowResubmit, lpaStatementDueDate, 3);

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
			deadline_date: extendedDeadline,
			reasons
		}
	});
};
