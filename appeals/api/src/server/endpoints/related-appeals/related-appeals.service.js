import appealRepository from '#repositories/appeal.repository.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import logger from '#utils/logger.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import { formatRelatableAppealSummary } from './related-appeals.formatter.js';

/**
 *
 * @param {string} appealReference
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export const getRelatableAppealSummaryByCaseReference = async (appealReference) => {
	let appeal = await appealRepository.getAppealByAppealReference(appealReference);
	if (!appeal) {
		logger.debug('Case not found in BO, now trying to query Horizon');
		const horizonAppeal = await getAppealFromHorizon(appealReference).catch((error) => {
			throw error;
		});
		return formatHorizonGetCaseData(horizonAppeal);
	} else {
		return formatRelatableAppealSummary(appeal);
	}
};
