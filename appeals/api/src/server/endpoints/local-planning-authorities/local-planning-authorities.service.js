import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import lpaRepository from '#repositories/lpa.repository.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {Appeal} appeal
 * @param {number} newLpaId
 * @returns {Promise<void>}
 */
const changeLpa = async (appeal, newLpaId) => {
	await lpaRepository.updateLpaByAppealId(appeal, newLpaId);
	await broadcasters.broadcastAppeal(appeal.id);
};

export const lpaService = {
	changeLpa
};
