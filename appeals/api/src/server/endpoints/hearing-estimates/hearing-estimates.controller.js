import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import * as hearingEstimatesRepository from '#repositories/hearing-estimates.repository.js';
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_HEARING_ESTIMATES_ADDED,
	AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED,
	AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED,
	CASE_RELATIONSHIP_LINKED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const addHearingEstimate = async (req, res) => {
	const { appeal } = req;
	const { preparationTime, sittingTime, reportingTime } = req.body;

	const result = await hearingEstimatesRepository.addHearingEstimate({
		appealId: appeal.id,
		preparationTime: parseFloat(preparationTime),
		sittingTime: parseFloat(sittingTime),
		reportingTime: parseFloat(reportingTime)
	});

	if (isLinkedAppealsActive(appeal)) {
		await addHearingEstimateLinkedChildAppeals({
			azureAdUserId: req.get('azureAdUserId'),
			appealId: appeal.id,
			preparationTime: parseFloat(preparationTime),
			sittingTime: parseFloat(sittingTime),
			reportingTime: parseFloat(reportingTime)
		});
	}
	if (result) {
		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_HEARING_ESTIMATES_ADDED
		});

		await broadcasters.broadcastAppeal(appeal.id);
		await broadcasters.broadcastEventEstimates(
			result.id,
			EVENT_TYPE.HEARING,
			EventType.Create,
			null
		);
	}

	return res.status(201).send({
		hearingEstimateId: result.id
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateHearingEstimate = async (req, res) => {
	const { appeal } = req;
	const { preparationTime, sittingTime, reportingTime } = req.body;

	const existingEstimate = await hearingEstimatesRepository.getHearingEstimateByAppealId(appeal.id);

	if (!existingEstimate) {
		return res.status(404).send({ errors: { hearingEstimateId: ERROR_NOT_FOUND } });
	}

	const result = await hearingEstimatesRepository.updateHearingEstimate({
		appealId: appeal.id,
		preparationTime: parseFloat(preparationTime),
		sittingTime: parseFloat(sittingTime),
		reportingTime: parseFloat(reportingTime)
	});

	if (isLinkedAppealsActive(appeal)) {
		logger.info(`Updating hearing estimates for linked child appeals of appeal ID ${appeal.id}`);
		await updateHearingEstimateLinkedChildAppeals({
			azureAdUserId: req.get('azureAdUserId'),
			appealId: appeal.id,
			preparationTime: parseFloat(preparationTime),
			sittingTime: parseFloat(sittingTime),
			reportingTime: parseFloat(reportingTime)
		});
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	await broadcasters.broadcastEventEstimates(result.id, EVENT_TYPE.HEARING, EventType.Update, null);
	return res.send({
		hearingEstimateId: result.id
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const removeHearingEstimate = async (req, res) => {
	const { appeal } = req;

	const existingEstimate = await hearingEstimatesRepository.getHearingEstimateByAppealId(appeal.id);

	if (!existingEstimate) {
		return res.status(404).send({ errors: { hearingEstimateId: ERROR_NOT_FOUND } });
	}

	const result = await hearingEstimatesRepository.deleteHearingEstimate(appeal.id);

	if (isLinkedAppealsActive(appeal)) {
		logger.info(`Removing hearing estimates for linked child appeals of appeal ID ${appeal.id}`);
		await removeHearingEstimateLinkedChildAppeals({
			azureAdUserId: req.get('azureAdUserId'),
			appealId: appeal.id
		});
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	await broadcasters.broadcastEventEstimates(
		existingEstimate.id,
		EVENT_TYPE.HEARING,
		EventType.Delete,
		existingEstimate
	);
	return res.send({
		hearingEstimateId: result.id
	});
};

/**
 * @param {{azureAdUserId: string|undefined, appealId: number}} params
 * @returns {Promise<void[]>}
 */
export const removeHearingEstimateLinkedChildAppeals = async ({ azureAdUserId, appealId }) => {
	const linkedAppeals = await appealRepository.getLinkedAppealsById(
		appealId,
		CASE_RELATIONSHIP_LINKED
	);
	return Promise.all(
		linkedAppeals.map(async (linkedAppeal) => {
			if (linkedAppeal.childId === null) {
				return;
			}
			const existingEstimate = await hearingEstimatesRepository.getHearingEstimateByAppealId(
				linkedAppeal.childId
			);
			const result = await hearingEstimatesRepository.deleteHearingEstimate(linkedAppeal.childId);

			if (result) {
				await createAuditTrail({
					appealId: linkedAppeal.childId,
					azureAdUserId: azureAdUserId,
					details: AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED
				});

				await broadcasters.broadcastAppeal(linkedAppeal.childId);
				await broadcasters.broadcastEventEstimates(
					existingEstimate.id,
					EVENT_TYPE.HEARING,
					EventType.Delete,
					existingEstimate
				);
			}
		})
	);
};

/**
 * @param {{azureAdUserId: string|undefined, appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<void[]>}
 */
export const addHearingEstimateLinkedChildAppeals = async ({
	azureAdUserId,
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	const linkedAppeals = await appealRepository.getLinkedAppealsById(
		appealId,
		CASE_RELATIONSHIP_LINKED
	);
	return Promise.all(
		linkedAppeals.map(async (linkedAppeal) => {
			if (linkedAppeal.childId === null) {
				return;
			}
			const result = await hearingEstimatesRepository.addHearingEstimate({
				appealId: linkedAppeal.childId,
				preparationTime: preparationTime,
				sittingTime: sittingTime,
				reportingTime: reportingTime
			});
			if (result) {
				await createAuditTrail({
					appealId: linkedAppeal.childId,
					azureAdUserId,
					details: AUDIT_TRAIL_HEARING_ESTIMATES_ADDED
				});

				await broadcasters.broadcastAppeal(linkedAppeal.childId);
				await broadcasters.broadcastEventEstimates(
					result.id,
					EVENT_TYPE.HEARING,
					EventType.Create,
					null
				);
			}
		})
	);
};

/**
 * @param {{azureAdUserId: string|undefined, appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<void[]>}
 */
export const updateHearingEstimateLinkedChildAppeals = async ({
	azureAdUserId,
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	const linkedAppeals = await appealRepository.getLinkedAppealsById(
		appealId,
		CASE_RELATIONSHIP_LINKED
	);
	logger.info(linkedAppeals);
	logger.info(`Retrieved linked appeals for appeal ID ${appealId}`);

	return Promise.all(
		linkedAppeals.map(async (linkedAppeal) => {
			logger.info(`Updating hearing estimates for linked child appeal ID ${linkedAppeal.childId}`);
			if (linkedAppeal.childId === null) {
				return;
			}

			const result = await hearingEstimatesRepository.updateHearingEstimate({
				appealId: linkedAppeal.childId,
				preparationTime: preparationTime,
				sittingTime: sittingTime,
				reportingTime: reportingTime
			});

			await createAuditTrail({
				appealId: linkedAppeal.childId,
				azureAdUserId: azureAdUserId,
				details: AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED
			});

			await broadcasters.broadcastAppeal(linkedAppeal.childId);
			await broadcasters.broadcastEventEstimates(
				result.id,
				EVENT_TYPE.HEARING,
				EventType.Update,
				null
			);
		})
	);
};
