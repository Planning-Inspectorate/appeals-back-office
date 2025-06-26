import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	AUDIT_TRAIL_DECISION_ISSUED,
	CASE_OUTCOME_INVALID,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { APPEAL_CASE_STAGE, APPEAL_CASE_STATUS, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';
import { notifySend } from '#notify/notify-send.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Appeals} DecisionType */
/** @typedef {import('#endpoints/appeals.js').NotifyClient} NotifyClient

/**
 *
 * @param {Appeal} appeal
 * @param {string} appealDocumentType
 * @returns {boolean}
 */
const hasCostsDocument = (appeal, appealDocumentType) => {
	const folder = appeal.folders?.find(
		(folder) => folder.path === `${APPEAL_CASE_STAGE.COSTS}/${appealDocumentType}`
	);
	return !!folder?.documents?.length;
};

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
		const lpaEmail = appeal.lpa?.email || '';
		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			reasons: [invalidDecisionReason]
		};

		if (!recipientEmail || !appeal.lpa?.email) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}

		const hasAppellantCostsDecision = hasCostsDocument(
			appeal,
			APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER
		);

		const hasLpaCostsDecision = hasCostsDocument(
			appeal,
			APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER
		);

		await Promise.all([
			await notifySend({
				templateName: 'decision-is-invalid-appellant',
				notifyClient,
				recipientEmail,
				personalisation: { ...personalisation, has_costs_decision: hasAppellantCostsDecision }
			}),
			await notifySend({
				templateName: 'decision-is-invalid-lpa',
				notifyClient,
				recipientEmail: lpaEmail,
				personalisation: { ...personalisation, has_costs_decision: hasLpaCostsDecision }
			})
		]);

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: azureUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [outcome])
		});

		await transitionState(appeal.id, azureUserId, APPEAL_CASE_STATUS.INVALID);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
