import * as caseTeamRepository from '#repositories/team.repository.js';

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
