import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import * as inquiryEstimatesRepository from '#repositories/inquiry-estimates.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	AUDIT_TRAIL_INQUIRY_ESTIMATES_ADDED,
	AUDIT_TRAIL_INQUIRY_ESTIMATES_UPDATED,
	AUDIT_TRAIL_INQUIRY_ESTIMATES_REMOVED
} from '@pins/appeals/constants/support.js';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const addInquiryEstimate = async (req, res) => {
	const { appeal } = req;
	const { preparationTime, sittingTime, reportingTime } = req.body;

	const result = await inquiryEstimatesRepository.addInquiryEstimate({
		appealId: appeal.id,
		preparationTime: parseFloat(preparationTime),
		sittingTime: parseFloat(sittingTime),
		reportingTime: parseFloat(reportingTime)
	});

	if (result) {
		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_INQUIRY_ESTIMATES_ADDED
		});

		await broadcasters.broadcastAppeal(appeal.id);
		await broadcasters.broadcastEventEstimates(
			result.id,
			EVENT_TYPE.INQUIRY,
			EventType.Create,
			null
		);
	}

	return res.status(201).send({
		inquiryEstimateId: result.id
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateInquiryEstimate = async (req, res) => {
	const { appeal } = req;
	const { preparationTime, sittingTime, reportingTime } = req.body;

	const existingEstimate = await inquiryEstimatesRepository.getInquiryEstimateByAppealId(appeal.id);

	if (!existingEstimate) {
		return res.status(404).send({ errors: { inquiryEstimateId: ERROR_NOT_FOUND } });
	}

	const result = await inquiryEstimatesRepository.updateInquiryEstimate({
		appealId: appeal.id,
		preparationTime: parseFloat(preparationTime),
		sittingTime: parseFloat(sittingTime),
		reportingTime: parseFloat(reportingTime)
	});

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_INQUIRY_ESTIMATES_UPDATED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	await broadcasters.broadcastEventEstimates(result.id, EVENT_TYPE.INQUIRY, EventType.Update, null);
	return res.send({
		inquiryEstimateId: result.id
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const removeInquiryEstimate = async (req, res) => {
	const { appeal } = req;

	const existingEstimate = await inquiryEstimatesRepository.getInquiryEstimateByAppealId(appeal.id);

	if (!existingEstimate) {
		return res.status(404).send({ errors: { inquiryEstimateId: ERROR_NOT_FOUND } });
	}

	const result = await inquiryEstimatesRepository.deleteInquiryEstimate(appeal.id);

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_INQUIRY_ESTIMATES_REMOVED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	await broadcasters.broadcastEventEstimates(
		existingEstimate.id,
		EVENT_TYPE.INQUIRY,
		EventType.Delete,
		existingEstimate
	);
	return res.send({
		inquiryEstimateId: result.id
	});
};
