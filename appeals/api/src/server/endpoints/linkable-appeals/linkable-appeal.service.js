import logger from '#utils/logger.js';
import appealRepository from '#repositories/appeal.repository.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import { formatLinkableAppealSummary } from './linkable-appeal.formatter.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { currentStatus } from '#utils/current-status.js';

const linkableCaseStatuses = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION,
	APPEAL_CASE_STATUS.READY_TO_START,
	APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
];

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
	} else if (!linkableCaseStatuses.includes(currentStatus(appeal))) {
		throw 432;
	} else {
		return formatLinkableAppealSummary(appeal);
	}
};
