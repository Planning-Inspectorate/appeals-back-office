import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	FRONT_OFFICE_URL,
	STATE_TARGET_COMPLETE
} from '#endpoints/constants.js';
import formatDate from '#utils/date-formatter.js';
import config from '#config/config.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */

/**
 *
 * @param {Appeal} appeal
 * @param {string} outcome
 * @param {Date} documentDate
 * @param {Document} document
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureUserId
 * @returns
 */
export const publishDecision = async (
	appeal,
	outcome,
	documentDate,
	document,
	notifyClient,
	siteAddress,
	azureUserId
) => {
	const result = await appealRepository.setAppealDecision(appeal.id, {
		documentDate,
		documentGuid: document.guid,
		version: document.latestDocumentVersion?.version || 1,
		outcome
	});

	if (result) {
		const emailVariables = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			url: FRONT_OFFICE_URL,
			decision_date: formatDate(new Date(documentDate || ''), false)
		};
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		const lpaEmail = appeal.lpa?.email || '';

		if (recipientEmail) {
			try {
				await notifyClient.sendEmail(
					config.govNotify.template.decisionIsAllowedSplitDismissed.appellant,
					recipientEmail,
					emailVariables
				);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (lpaEmail) {
			try {
				await notifyClient.sendEmail(
					config.govNotify.template.decisionIsAllowedSplitDismissed.lpa,
					lpaEmail,
					emailVariables
				);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		await transitionState(
			appeal.id,
			appeal.appealType || null,
			azureUserId,
			appeal.appealStatus,
			STATE_TARGET_COMPLETE
		);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
