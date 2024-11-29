import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import * as representationService from './representations.service.js';
import { formatRepresentation } from './representations.formatter.js';
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_NOT_FOUND,
	ERROR_REP_ONLY_STATEMENT_INCOMPLETE
} from '#endpoints/constants.js';
import { getPageCount } from '#utils/database-pagination.js';
import { Prisma } from '#utils/db-client/index.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const getRepresentations = async (req, res) => {
	const { appeal, query } = req;
	const { type, status } = query;

	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;

	const representationType = type
		? String(type)
				.split(',')
				.map(/** @type {string} */ (t) => t.trim())
		: undefined;

	try {
		const { itemCount, comments } = await representationService.getRepresentations(
			appeal.id,
			pageNumber,
			pageSize,
			{
				representationType,
				status: status ? String(status) : undefined
			}
		);

		return res.send({
			itemCount: itemCount,
			items: comments.map(formatRepresentation),
			page: pageNumber,
			pageCount: getPageCount(itemCount, pageSize),
			pageSize
		});
	} catch (/** @type {*} */ error) {
		if (error instanceof representationService.RepresentationTypeError) {
			return res.status(400).send({ errors: error.message });
		}

		return res.status(500).send({ errors: error.message });
	}
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
	const { status, notes, allowResubmit } = req.body;

	const rep = await representationService.getRepresentation(parseInt(repId));
	if (!rep) {
		return res.status(404).send({
			errors: {
				repId: ERROR_NOT_FOUND
			}
		});
	}

	if (
		status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE &&
		rep.representationType !== APPEAL_REPRESENTATION_TYPE.STATEMENT
	) {
		return res.status(400).send({
			errors: {
				status: ERROR_REP_ONLY_STATEMENT_INCOMPLETE
			}
		});
	}

	const updatedRep = await representationService.updateRepresentationStatus(
		Number(repId),
		status,
		notes,
		String(req.get('azureAdUserId'))
	);

	await representationService.notifyRejection(req.notifyClient, req.appeal, rep, allowResubmit);

	return res.send(formatRepresentation(updatedRep));
};

/**
 * @param {'comment' | 'statement' | 'final_comment'} representationType
 * @returns {(req: Request, res: Response) => Promise<Response>}
 * */
export const createRepresentation = (representationType) => async (req, res) => {
	const { appealId } = req.params;

	const rep = await representationService.createRepresentation(parseInt(appealId), {
		representationType,
		...req.body
	});

	return res.send(rep);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateRejectionReasons = async (req, res) => {
	const { repId } = req.params;
	const { rejectionReasons } = req.body;

	try {
		const rep = await representationService.updateRejectionReasons(Number(repId), rejectionReasons);

		return res.send(rep);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			return res.status(404).send({
				errors: {
					repId: ERROR_NOT_FOUND
				}
			});
		}

		return res.status(500).send({
			errors: { message: 'Failed to update rejection reasons' }
		});
	}
};
