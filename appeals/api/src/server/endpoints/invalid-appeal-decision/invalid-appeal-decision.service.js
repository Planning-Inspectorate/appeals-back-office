import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	CASE_OUTCOME_INVALID,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NO_RECIPIENT_EMAIL,
	STATE_TARGET_INVALID
} from '#endpoints/constants.js';
import config from '#config/config.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
// eslint-disable-next-line no-unused-vars
import NotifyClient from '#utils/notify-client.js';

/** @typedef {import('@pins/appeals.api').Appeals.RepositoryGetByIdResultItem} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecisionOutcomeType} DecisionType */

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
		const emailVariables = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.planningApplicationReference,
			site_address: siteAddress,
			reasons: invalidDecisionReason
		};

		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		try {
			await Promise.all([
				notifyClient.sendEmail(
					config.govNotify.template.decisionIsInvalidAppellant,
					recipientEmail,
					emailVariables
				),
				notifyClient.sendEmail(
					config.govNotify.template.decisionIsInvalidLPA,
					appeal.lpa.email,
					emailVariables
				)
			]);
		} catch (error) {
			throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
		}
		await transitionState(
			appeal.id,
			appeal.appealType,
			azureUserId,
			appeal.appealStatus,
			STATE_TARGET_INVALID
		);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
