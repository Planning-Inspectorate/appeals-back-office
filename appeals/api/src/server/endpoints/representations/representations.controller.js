import * as representationService from './representations.service.js';
import { formatRepresentation } from './representations.formatter.js';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, ERROR_NOT_FOUND } from '#endpoints/constants.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getStatements = async (req, res) => {
	const { appeal, query } = req;
	const status = query.status ? String(query.status) : undefined;
	const data = await representationService.getStatements(appeal.id, status);
	return res.send(data.map((rep) => formatRepresentation(rep)));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getFinalComments = async (req, res) => {
	const { appeal, query } = req;
	const status = query.status ? String(query.status) : undefined;
	const data = await representationService.getFinalComments(appeal.id, status);
	return res.send(data.map((rep) => formatRepresentation(rep)));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getComments = async (req, res) => {
	const { appeal, query } = req;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const status = query.status ? String(query.status) : undefined;
	const data = await representationService.getThirdPartComments(
		appeal.id,
		pageNumber,
		pageSize,
		status
	);

	return res.send(data.map((rep) => formatRepresentation(rep)));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getRepresentation = async (req, res) => {
	const { repId } = req.params;
	const rep = await representationService.getRepresentation(Number(repId));

	if (!rep) {
		return res.status(404).send({
			errors: {
				repId: ERROR_NOT_FOUND
			}
		});
	}

	return res.send(formatRepresentation(rep));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const addRedactedRepresentation = async (req, res) => {
	const { repId } = req.params;
	const { redactedRepresentation } = req.body;

	const rep = await representationService.redactRepresentation(
		Number(repId),
		redactedRepresentation,
		String(req.get('azureAdUserId'))
	);

	if (!rep) {
		return res.status(404).send({
			errors: {
				repId: ERROR_NOT_FOUND
			}
		});
	}

	return res.send(formatRepresentation(rep));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const changeRepresentationStatus = async (req, res) => {
	const { repId } = req.params;
	const { status, notes } = req.body;

	const rep = await representationService.updateRepresentationStatus(
		Number(repId),
		status,
		notes,
		String(req.get('azureAdUserId'))
	);

	if (!rep) {
		return res.status(404).send({
			errors: {
				repId: ERROR_NOT_FOUND
			}
		});
	}

	return res.send(formatRepresentation(rep));
};
