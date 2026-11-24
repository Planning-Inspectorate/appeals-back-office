import appealStatusRepository from '#repositories/appeal-status.repository.js';
import transitionState from '#state/transition-state.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const rollBackAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;

	try {
		const appealStatus = await appealStatusRepository.rollBackAppealStatusTo(
			Number(appealId),
			status
		);
		return res.status(200).json(appealStatus);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal status' });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAppealStatusCreatedDate = async (req, res) => {
	const { appealId, status } = req.params;
	const statusCreatedDate = await appealStatusRepository.getAppealStatusCreatedDate(
		Number(appealId),
		status
	);
	return res.send(statusCreatedDate);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;
	const azureAdUserId = req.get('azureAdUserId') || '';

	// @ts-ignore
	const appeal = req.appeal;
	if (!appeal || !isGenericAppealType(appeal.appealType?.key || appeal.appealType?.type)) {
		return res
			.status(400)
			.json({ error: 'Manual status change only permitted for generic appeals' });
	}

	const result = await transitionState(Number(appealId), azureAdUserId, status);
	return res.status(200).json({ success: result, status });
};
