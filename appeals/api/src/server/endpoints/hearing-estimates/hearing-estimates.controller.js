import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
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
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
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

	const appealIdsToAdd = getLinkedAppealsIds(appeal);

	try {
		const result = await hearingEstimatesRepository.addManyHearingEstimate({
			appealIds: appealIdsToAdd,
			preparationTime: parseFloat(preparationTime),
			sittingTime: parseFloat(sittingTime),
			reportingTime: parseFloat(reportingTime)
		});

		if (result) {
			const existingEstimates =
				await hearingEstimatesRepository.getManyHearingEstimateByAppealId(appealIdsToAdd);
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details: AUDIT_TRAIL_HEARING_ESTIMATES_ADDED
			});

			await Promise.all(
				existingEstimates.map(async (existingEstimate) => {
					await broadcasters.broadcastAppeal(existingEstimate.appealId);
					await broadcasters.broadcastEventEstimates(
						existingEstimate.id,
						EVENT_TYPE.HEARING,
						EventType.Create,
						null
					);
				})
			);

			return res.status(201).send({
				...buildHearingEstimateResponse(existingEstimates)
			});
		} else {
			logger.error(
				`Error adding hearing estimates for appeal ID ${appeal.id}: No result returned from repository`
			);
			return res.status(500).send({ errors: { message: 'Error adding hearing estimates' } });
		}
	} catch (error) {
		// @ts-ignore
		logger.error(`Error adding hearing estimates for appeal ID ${appeal.id}: ${error.message}`);
		return res.status(500).send({ errors: { message: 'Error adding hearing estimates' } });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateHearingEstimate = async (req, res) => {
	const { appeal } = req;
	const { preparationTime, sittingTime, reportingTime } = req.body;

	try {
		const appealIdsToUpdate = getLinkedAppealsIds(appeal);
		const existingEstimates =
			await hearingEstimatesRepository.getManyHearingEstimateByAppealId(appealIdsToUpdate);

		if (!existingEstimates.length) {
			return res.status(404).send({ errors: { hearingEstimateId: ERROR_NOT_FOUND } });
		}

		const result = await hearingEstimatesRepository.updateManyHearingEstimate({
			appealIds: appealIdsToUpdate,
			preparationTime: parseFloat(preparationTime),
			sittingTime: parseFloat(sittingTime),
			reportingTime: parseFloat(reportingTime)
		});

		if (result) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details: AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED
			});

			await Promise.all(
				existingEstimates.map(async (existingEstimate) => {
					await broadcasters.broadcastAppeal(existingEstimate.appealId);
					await broadcasters.broadcastEventEstimates(
						existingEstimate.id,
						EVENT_TYPE.HEARING,
						EventType.Update,
						null
					);
				})
			);

			return res.status(200).send({
				...buildHearingEstimateResponse(existingEstimates)
			});
		} else {
			logger.error(
				`Error updating hearing estimates for appeal ID ${appeal.id}: No result returned from repository`
			);
			return res.status(500).send({ errors: { message: 'Error updating hearing estimates' } });
		}
	} catch (error) {
		// @ts-ignore
		logger.error(`Error updating hearing estimates for appeal ID ${appeal.id}: ${error.message}`);
		return res.status(500).send({ errors: { message: 'Error updating hearing estimates' } });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const removeHearingEstimate = async (req, res) => {
	const { appeal } = req;

	try {
		const appealIdsToRemove = getLinkedAppealsIds(appeal);
		const existingEstimates =
			await hearingEstimatesRepository.getManyHearingEstimateByAppealId(appealIdsToRemove);

		if (!existingEstimates.length) {
			return res.status(404).send({ errors: { hearingEstimateId: ERROR_NOT_FOUND } });
		}

		const result = await hearingEstimatesRepository.deleteManyHearingEstimate(appealIdsToRemove);
		if (result) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details: AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED
			});
			await Promise.all(
				existingEstimates.map(async (existingEstimate) => {
					await broadcasters.broadcastAppeal(existingEstimate.appealId);
					await broadcasters.broadcastEventEstimates(
						existingEstimate.id,
						EVENT_TYPE.HEARING,
						EventType.Delete,
						existingEstimate
					);
				})
			);

			return res.send({
				...buildHearingEstimateResponse(existingEstimates)
			});
		} else {
			logger.error(
				`Error removing hearing estimates for appeal ID ${appeal.id}: No result returned from repository`
			);
			return res.status(500).send({ errors: { message: 'Error removing hearing estimates' } });
		}
	} catch (error) {
		// @ts-ignore
		logger.error(`Error removing hearing estimates for appeal ID ${appeal.id}: ${error.message}`);
		return res.status(500).send({ errors: { message: 'Internal Server Error' } });
	}
};

/**
 * @param {Appeal} appeal
 * @returns {number[]}
 */
const getLinkedAppealsIds = (appeal) => {
	const appealIds = [appeal.id];
	if (isLinkedAppealsActive(appeal)) {
		appeal.childAppeals?.forEach((childAppeal) => {
			if (childAppeal.type === CASE_RELATIONSHIP_LINKED && childAppeal.childId !== null) {
				appealIds.push(childAppeal.childId);
			}
		});
	}
	return [...new Set(appealIds)];
};

/**
 * Builds the response object for hearing estimates
 * @param {import('#repositories/hearing-estimates.repository.js').HearingEstimate[]} existingEstimates
 * @returns
 */
const buildHearingEstimateResponse = (existingEstimates) => {
	const ids = existingEstimates.map((estimate) => estimate.id);
	return {
		hearingEstimateId: ids[0],
		hearingEstimateIds: ids
	};
};
