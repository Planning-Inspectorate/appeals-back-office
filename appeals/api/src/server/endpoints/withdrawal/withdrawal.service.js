import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {Appeal} appeal
 * @param {Date} withdrawalRequestDate
 * @param {string} azureUserId
 * @returns
 */
export const publishWithdrawal = async (appeal, withdrawalRequestDate, azureUserId) => {
	const result = await appealRepository.setAppealWithdrawal(
		appeal.id,
		new Date(withdrawalRequestDate)
	);

	if (result) {
		await transitionState(
			appeal.id,
			appeal.appealType || null,
			azureUserId,
			appeal.appealStatus,
			APPEAL_CASE_STATUS.WITHDRAWN
		);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
