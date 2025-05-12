import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import * as hearingEstimatesRepository from '#repositories/hearing-estimates.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	AUDIT_TRAIL_HEARING_ESTIMATES_ADDED,
	AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED,
	AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED
} from '@pins/appeals/constants/support.js';

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

	if (result) {
		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_HEARING_ESTIMATES_ADDED
		});

		await broadcasters.broadcastAppeal(appeal.id);
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

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED
	});

	await broadcasters.broadcastAppeal(appeal.id);
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

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	return res.send({
		hearingEstimateId: result.id
	});
};
