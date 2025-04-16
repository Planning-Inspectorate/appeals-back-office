import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { CASE_OUTCOME_INVALID, ERROR_NO_RECIPIENT_EMAIL } from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
// eslint-disable-next-line no-unused-vars
import NotifyClient from '#utils/notify-client.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { notifySend } from '#notify/notify-send.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Appeals} DecisionType */

/**
 *
 * @param {Appeal} appeal
 * @param {string} invalidDecisionReason
 * @param {string} azureUserId
 * @param { NotifyClient } notifyClient
 * @returns
 */

export const publishInvalidDecision = async (
	appeal,
	invalidDecisionReason,
	azureUserId,
	notifyClient
) => {
	const outcome = CASE_OUTCOME_INVALID;
	const result = await appealRepository.setInvalidAppealDecision(appeal.id, {
		invalidDecisionReason,
		outcome
	});

	if (result) {
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			reasons: invalidDecisionReason
		};

		if (!recipientEmail || !appeal.lpa?.email) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		await Promise.all([
			notifySend({
				templateName: 'decision-is-invalid-appellant',
				notifyClient,
				recipientEmail,
				personalisation
			}),
			notifySend({
				templateName: 'decision-is-invalid-lpa',
				notifyClient,
				recipientEmail,
				personalisation
			})
		]);
		await transitionState(appeal.id, azureUserId, APPEAL_CASE_STATUS.INVALID);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
