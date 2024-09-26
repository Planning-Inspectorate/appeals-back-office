import * as casenoteRepository from '#repositories/casenotes.repository.js';
import { formatCasenotes } from './casenotes.formatter.js';
import * as services from './casenotes.service.js'
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getAllCasenotesByAppealId = async (request, response) => {
	const {
		params: { appealId }
	} = request;
	const casenotes = await casenoteRepository.getAllCasenotesByAppealId(
		Number(appealId)
	);
	const formattedComments = formatCasenotes(casenotes);

	return response.send(formattedComments);
};

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getCasenoteByCasenoteId = async (request, response) => {
	const {
		params: { id }
	} = request;
	const casenote = await casenoteRepository.getCasenoteByCasenoteId(Number(id));

	return response.send(casenote);
};

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const postAppealCasenote = async (request, response) => {
	const {
		params: { appealId }
	} = request;
	const { comment } = request.body;
	const azureAdUserId = request.get('azureAdUserId');

	const commentResponse = await services.postCasenote(
		appealId,
		azureAdUserId,
		comment
);
	return response.send(commentResponse);
};
