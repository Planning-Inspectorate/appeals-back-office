import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { notifySend } from '#notify/notify-send.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {Appeal} appeal
 * @param {Date} withdrawalRequestDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureUserId
 * @returns
 */
export const publishWithdrawal = async (
	appeal,
	withdrawalRequestDate,
	notifyClient,
	siteAddress,
	azureUserId
) => {
	const result = await appealRepository.setAppealWithdrawal(
		appeal.id,
		new Date(withdrawalRequestDate)
	);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const lpaEmail = appeal.lpa?.email || '';

	const eventType = appeal.siteVisit ? 'site visit' : '';
	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		withdrawal_date: formatDate(new Date(withdrawalRequestDate || ''), false),
		event_type: eventType,
		event_set: !!eventType
	};

	if (recipientEmail) {
		await notifySend({
			templateName: 'appeal-withdrawn-appellant',
			notifyClient,
			recipientEmail,
			personalisation
		});

		await notifySend({
			templateName: 'appeal-withdrawn-lpa',
			notifyClient,
			recipientEmail: lpaEmail,
			personalisation
		});
	}

	if (result) {
		await transitionState(appeal.id, azureUserId, APPEAL_CASE_STATUS.WITHDRAWN);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
