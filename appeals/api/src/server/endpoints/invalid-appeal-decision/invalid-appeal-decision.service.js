import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { CASE_OUTCOME_INVALID, STATE_TARGET_INVALID } from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Appeals.RepositoryGetByIdResultItem} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecisionOutcomeType} DecisionType */

/**
 *
 * @param {Appeal} appeal
 * @param {string} invalidDecisionReason
 * @param {string} azureUserId
 * @returns
 */

export const publishInvalidDecision = async (appeal, invalidDecisionReason, azureUserId) => {
	const outcome = CASE_OUTCOME_INVALID;
	const result = await appealRepository.setInvalidAppealDecision(appeal.id, {
		invalidDecisionReason,
		outcome
	});

	if (result) {
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
