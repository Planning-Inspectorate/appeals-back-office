import appealRepository from '#repositories/appeal.repository.js';
import { currentStatus } from '#utils/current-status.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { formatLinkableAppealSummary } from './linkable-appeal.formatter.js';

const linkableCaseStatuses = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION,
	APPEAL_CASE_STATUS.READY_TO_START,
	APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
];

/**
 *
 * @param {string} appealReference
 * @param {string} linkableType
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export const getLinkableAppealSummaryByCaseReference = async (appealReference, linkableType) => {
	let appeal = await appealRepository.getAppealByAppealReference(appealReference);
	if (!appeal) {
		logger.debug('Case not found in BO, now trying to query Horizon');
		const horizonAppeal = await getAppealFromHorizon(appealReference).catch((error) => {
			throw error;
		});
		return formatHorizonGetCaseData(horizonAppeal);
	} else if (
		isLinkedAppealsActive(appeal) &&
		linkableType === CASE_RELATIONSHIP_LINKED &&
		//@ts-ignore
		!linkableCaseStatuses.includes(currentStatus(appeal))
	) {
		throw 432;
	} else {
		return formatLinkableAppealSummary(appeal);
	}
};
