import * as caseNoteRepository from '#repositories/case-notes.repository.js';
import { formatCaseNotes } from './case-notes.formatter.js';
import * as services from './case-notes.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getAllCaseNotesByAppealId = async (request, response) => {
	const {
		params: { appealId }
	} = request;

	const caseNotes = await caseNoteRepository.getAllCaseNotesByAppealId(Number(appealId));
	const formattedCaseNotes = formatCaseNotes(caseNotes);

	return response.send(formattedCaseNotes);
};

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const postAppealCaseNote = async (request, response) => {
	const {
		params: { appealId }
	} = request;
	const { comment } = request.body;
	const azureAdUserId = request.get('azureAdUserId');

	if (!comment || !azureAdUserId) {
		return response.status(400).send({});
	}

	const caseNoteResponse = await services.postCaseNote(appealId, azureAdUserId, comment);

	return response.status(201).send(caseNoteResponse);
};
