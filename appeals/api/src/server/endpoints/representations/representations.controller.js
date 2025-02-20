import { APPEAL_CASE_STATUS } from 'pins-data-model';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import representationRepository from '#repositories/representation.repository.js';
import * as CONSTANTS from '#endpoints/constants.js';
import * as representationService from './representations.service.js';
import { formatRepresentation } from './representations.formatter.js';
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_NOT_FOUND,
	ERROR_REP_ONLY_STATEMENT_INCOMPLETE,
	ERROR_REP_PUBLISH_USING_ENDPOINT
} from '#endpoints/constants.js';
import { getPageCount } from '#utils/database-pagination.js';
import { Prisma } from '#utils/db-client/index.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { camelToScreamingSnake } from '#utils/string-utils.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import BackOfficeAppError from '#utils/app-error.js';
import { notifyOnStatusChange } from './notify/index.js';

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
		// @ts-ignore
		items: comments.map(formatRepresentation),
		page: pageNumber,
		pageCount: getPageCount(itemCount, pageSize),
		pageSize
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const getRepresentationCounts = async (req, res) => {
	const { appeal, query } = req;
	const { status } = query;

	try {
		const counts = await representationService.getRepresentationCounts(appeal.id, {
			status: status ? String(status) : undefined
		});

		return res.send({
			...counts
		});
	} catch (/** @type {*} */ error) {
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

	const rep = await representationRepository.updateRepresentationById(Number(repId), {
		redactedRepresentation
	});

	if (!rep) {
		return res.status(404).send({
			errors: {
				repId: ERROR_NOT_FOUND
			}
		});
	}

	await broadcasters.broadcastRepresentation(rep.id, EventType.Update);
	return res.send(formatRepresentation(rep));
};

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export async function updateRepresentation(request, response) {
	const {
		params: { appealId, repId },
		body: { status, allowResubmit, redactedRepresentation }
	} = request;

	const rep = await representationService.getRepresentation(parseInt(repId));
	if (!rep) {
		return response.status(404).send({ errors: { repId: ERROR_NOT_FOUND } });
	}

	if (
		status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE &&
		rep.representationType !== APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	) {
		return response.status(400).send({ errors: { status: ERROR_REP_ONLY_STATEMENT_INCOMPLETE } });
	}

	if (status === APPEAL_REPRESENTATION_STATUS.PUBLISHED) {
		return response.status(400).send({ errors: { status: ERROR_REP_PUBLISH_USING_ENDPOINT } });
	}

	await representationService.updateRepresentation(parseInt(repId), request.body);

	const updatedRep = await representationService.getRepresentation(parseInt(repId));
	if (!updatedRep) {
		throw new Error(`failed to get representation with ID: ${repId}`);
	}

	if (!updatedRep) {
		return response.status(500).send({});
	}

	if (status !== rep.status) {
		const details = (() => {
			if (status === APPEAL_REPRESENTATION_STATUS.VALID && redactedRepresentation) {
				// @ts-ignore
				return CONSTANTS[
					`AUDIT_TRAIL_REP_${camelToScreamingSnake(
						updatedRep.representationType
					)}_REDACTED_AND_ACCEPTED`
				];
			} else if (
				status === APPEAL_REPRESENTATION_STATUS.invalid &&
				(updatedRep.representationType === 'appellantFinalComment' ||
					updatedRep.representationType === 'lpaFinalComment')
			) {
				// @ts-ignore
				return CONSTANTS[
					`AUDIT_TRAIL_REP_${camelToScreamingSnake(updatedRep.representationType)}_INVALID`
				];
			} else {
				stringTokenReplacement(
					// @ts-ignore
					CONSTANTS[
						`AUDIT_TRAIL_REP_${camelToScreamingSnake(updatedRep.representationType)}_STATUS_UPDATED`
					],
					[status]
				);
			}
		})();

		await createAuditTrail({
			appealId: parseInt(appealId),
			azureAdUserId: String(request.get('azureAdUserId')),
			details
		});
	}

	await notifyOnStatusChange(request, {
		notifyClient: request.notifyClient,
		appeal: request.appeal,
		representation: { ...updatedRep, status: rep.status },
		allowResubmit
	});

	await broadcasters.broadcastRepresentation(updatedRep.id, EventType.Update);
	return response.send(formatRepresentation(updatedRep));
}

/**
 * @param {'comment' | 'lpa_statement' | 'appellant_statement' | 'lpa_final_comment' | 'appellant_final_comment'} representationType
 * @returns {(req: Request, res: Response) => Promise<Response>}
 * */
export const createRepresentation = (representationType) => async (req, res) => {
	const { appealId } = req.params;

	const rep = await representationService.createRepresentation(parseInt(appealId), {
		representationType,
		...req.body
	});

	await broadcasters.broadcastRepresentation(rep.id, EventType.Create);
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

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateRepresentationAttachments = async (req, res) => {
	const { repId } = req.params;
	const { attachments } = req.body;

	if (!Array.isArray(attachments) || !attachments.every((id) => typeof id === 'string')) {
		return res.status(400).send({ errors: { attachments: 'must be an array of strings' } });
	}

	const rep = await representationService.getRepresentation(parseInt(repId));

	if (!rep) {
		return res.status(404).send({ errors: { repId: 'Representation not found' } });
	}

	const updatedRepresentation = await representationService.updateAttachments(
		Number(repId),
		attachments
	);

	return res.status(200).send(updatedRepresentation);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function publish(req, res) {
	const { appeal } = req;

	/** @type {Record<string, import('./representations.service.js').PublishFunction>} */
	const handlers = {
		[APPEAL_CASE_STATUS.STATEMENTS]: representationService.publishLpaStatements,
		[APPEAL_CASE_STATUS.FINAL_COMMENTS]: representationService.publishFinalComments
	};

	const azureAdUserId = req.get('azureAdUserId');
	if (!azureAdUserId) {
		throw new BackOfficeAppError('azureAdUserId not provided', 401);
	}

	const currentStatus = appeal.appealStatus[0]?.status;
	if (!currentStatus) {
		throw new BackOfficeAppError(`no status found for appeal ${appeal.id}`, 500);
	}

	const publish = handlers[currentStatus];
	if (!publish) {
		throw new BackOfficeAppError(
			`cannot publish representations when appeal is in the ${currentStatus} state`,
			409
		);
	}

	const updatedReps = await publish(appeal, azureAdUserId, req.notifyClient);

	if (updatedReps.length > 0) {
		/** @type {Record<string, string>} */
		const replacements = {
			[APPEAL_CASE_STATUS.STATEMENTS]: 'Statements and IP comments',
			[APPEAL_CASE_STATUS.FINAL_COMMENTS]: 'Final comments'
		};

		const replacement = replacements[currentStatus];
		if (replacement) {
			const details = stringTokenReplacement(CONSTANTS.AUDIT_TRAIL_REP_SHARED, [replacement]);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details
			});
		}
	}

	await Promise.all(
		updatedReps.map((rep) => broadcasters.broadcastRepresentation(rep.id, EventType.Update))
	);

	return res.status(200).send(updatedReps);
}
