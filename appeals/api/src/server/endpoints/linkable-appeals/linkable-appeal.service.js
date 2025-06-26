import logger from '#utils/logger.js';
import appealRepository from '#repositories/appeal.repository.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import { formatLinkableAppealSummary } from './linkable-appeal.formatter.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/**
 *
 * @param {string} appealReference
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export const getLinkableAppealSummaryByCaseReference = async (appealReference) => {
	let appeal = await appealRepository.getAppealByAppealReference(appealReference);
	if (!appeal) {
		logger.debug('Case not found in BO, now trying to query Horizon');
		const horizonAppeal = await getAppealFromHorizon(appealReference).catch((error) => {
			throw error;
		});
		return formatHorizonGetCaseData(horizonAppeal);
	} else if (appeal.appealStatus.some(({ status }) => status === APPEAL_CASE_STATUS.STATEMENTS)) {
		throw 432;
	} else {
		return formatLinkableAppealSummary(appeal);
	}
};
