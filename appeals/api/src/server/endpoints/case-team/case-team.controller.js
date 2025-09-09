import * as caseTeamRepository from '#repositories/team.repository.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { setAssignedTeamId, setAssignedTeamIdForLinkedAppeals } from './case-team.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getAllCaseTeams = async (request, response) => {
	return response.send(await caseTeamRepository.getCaseTeams());
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateAssignedTeamId = async (req, res) => {
	const {
		body: { teamId },
		params
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = req.get('azureAdUserId') || '';

	if (!azureAdUserId) {
		return res.status(400).send({});
	}

	const result = await setAssignedTeamId(appealId, teamId, azureAdUserId);
	if (
		Object.hasOwn(result, 'assignedTeamId') &&
		isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)
	) {
		await setAssignedTeamIdForLinkedAppeals(appealId, teamId, azureAdUserId);
	}

	return res.send(result);
};
