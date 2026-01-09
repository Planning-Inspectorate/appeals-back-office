import { Prisma } from '#db-client/client.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import representationRepository from '#repositories/representation.repository.js';
import { isStatePassed } from '#state/transition-state.js';
import BackOfficeAppError from '#utils/app-error.js';
import { currentStatus } from '#utils/current-status.js';
import { getPageCount } from '#utils/database-pagination.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import * as CONSTANTS from '@pins/appeals/constants/support.js';
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_NOT_FOUND,
	ERROR_REP_ONLY_STATEMENT_INCOMPLETE,
	ERROR_REP_PUBLISH_USING_ENDPOINT
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { notifyOnStatusChange } from './notify/index.js';
import { formatRepresentation } from './representations.formatter.js';
import * as representationService from './representations.service.js';
import { getRepStatusAuditLogDetails } from './representations.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

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
		body: { allowResubmit, redactedRepresentation }
	} = request;

	const existingRep = await representationService.getRepresentation(parseInt(repId));
	if (!existingRep) {
		return response.status(404).send({ errors: { repId: ERROR_NOT_FOUND } });
	}

	const status =
		existingRep.status === APPEAL_REPRESENTATION_STATUS.PUBLISHED
			? existingRep.status
			: request.body.status;

	if (
		status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE &&
		![
			APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
		].includes(existingRep.representationType)
	) {
		return response.status(400).send({ errors: { status: ERROR_REP_ONLY_STATEMENT_INCOMPLETE } });
	}

	if (
		status === APPEAL_REPRESENTATION_STATUS.PUBLISHED &&
		existingRep.status !== APPEAL_REPRESENTATION_STATUS.PUBLISHED
	) {
		return response.status(400).send({ errors: { status: ERROR_REP_PUBLISH_USING_ENDPOINT } });
	}

	const updatedRep = await representationService.updateRepresentation(
		parseInt(repId),
		status === APPEAL_REPRESENTATION_STATUS.PUBLISHED ? { ...request.body, status } : request.body
	);

	if (status !== existingRep.status) {
		const details = getRepStatusAuditLogDetails(
			status,
			updatedRep.representationType,
			!!redactedRepresentation
		);

		await createAuditTrail({
			appealId: parseInt(appealId),
			azureAdUserId: String(request.get('azureAdUserId')),
			details
		});
	}

	if (existingRep.status !== APPEAL_REPRESENTATION_STATUS.PUBLISHED) {
		await notifyOnStatusChange(request, {
			notifyClient: request.notifyClient,
			appeal: request.appeal,
			representation: { ...updatedRep, status: existingRep.status },
			allowResubmit,
			azureAdUserId: request.get('azureAdUserId')
		});
	}

	await broadcasters.broadcastRepresentation(updatedRep.id, EventType.Update);
	return response.send(formatRepresentation(updatedRep));
}

/**
 * @returns {(req: Request, res: Response) => Promise<Response>}
 * */
export const createRepresentation = () => async (req, res) => {
	const { appealId, representationType } = req.params;

	const shouldAutoPublish = shouldAutoPublishRep(req.appeal, representationType);

	const updatePayload = shouldAutoPublish
		? { ...req.body, status: APPEAL_REPRESENTATION_STATUS.PUBLISHED }
		: req.body;

	if (
		[
			APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
			APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
		].includes(representationType)
	) {
		updatePayload.lpaCode = req.appeal.lpa?.lpaCode;
	} else if ([APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT].includes(representationType)) {
		updatePayload.representedId = req.appeal.agentId || req.appeal.appellantId;
	}

	const rep = await representationService.createRepresentation(parseInt(appealId), {
		representationType,
		...updatePayload
	});

	await broadcasters.broadcastRepresentation(
		rep.id,
		shouldAutoPublish ? EventType.Create : EventType.Update
	);
	await broadcasters.broadcastAppeal(Number(appealId));
	return res.status(201).send(rep);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function createRepresentationProofOfEvidence(req, res) {
	const {
		appeal,
		params: { proofOfEvidenceType },
		body: { attachments }
	} = req;
	const rep = await representationService.createRepresentationProofOfEvidence(
		appeal,
		proofOfEvidenceType,
		attachments
	);
	return res.status(201).send(rep);
}

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

	return res.send(updatedRepresentation);
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
		[APPEAL_CASE_STATUS.FINAL_COMMENTS]: representationService.publishFinalComments,
		[APPEAL_CASE_STATUS.EVIDENCE]: representationService.publishProofOfEvidence
	};

	const azureAdUserId = req.get('azureAdUserId');
	if (!azureAdUserId) {
		throw new BackOfficeAppError('azureAdUserId not provided', 401);
	}

	const currentAppealStatus = currentStatus(appeal);
	if (!currentAppealStatus) {
		throw new BackOfficeAppError(`no status found for appeal ${appeal.id}`, 500);
	}

	const publish = handlers[currentAppealStatus];
	if (!publish) {
		throw new BackOfficeAppError(
			`cannot publish representations when appeal is in the ${currentAppealStatus} state`,
			409
		);
	}

	const updatedReps = await publish(appeal, azureAdUserId, req.notifyClient);

	if (updatedReps.length > 0) {
		/** @type {Record<string, string>} */
		const replacements = {
			[APPEAL_CASE_STATUS.STATEMENTS]: 'Statements and IP comments',
			[APPEAL_CASE_STATUS.FINAL_COMMENTS]: 'Final comments',
			[APPEAL_CASE_STATUS.EVIDENCE]: 'Proof of evidence and witnesses'
		};

		const replacement = replacements[currentAppealStatus];
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

	await broadcasters.broadcastAppeal(appeal.id);
	return res.send(updatedReps);
}
/**
 * @param {number} repId
 * @returns {Promise<any>}
 */
export async function publishAfterStatePassed(repId) {
	await broadcasters.broadcastRepresentation(repId, EventType.Update);
}

/**
 * @param {Appeal} appeal
 * @param {string} representationType
 * @returns {boolean}
 */
const shouldAutoPublishRep = (appeal, representationType) => {
	switch (representationType) {
		case APPEAL_REPRESENTATION_TYPE.COMMENT:
			return isStatePassed(appeal, APPEAL_CASE_STATUS.STATEMENTS);
		case APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT:
			return (
				isStatePassed(appeal, APPEAL_CASE_STATUS.STATEMENTS) ||
				appeal.appealStatus.some((status) => status.status === APPEAL_CASE_STATUS.STATEMENTS)
			);
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT:
		case APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT:
			return (
				isStatePassed(appeal, APPEAL_CASE_STATUS.FINAL_COMMENTS) ||
				appeal.appealStatus.some((status) => status.status === APPEAL_CASE_STATUS.FINAL_COMMENTS)
			);
		default:
			return false;
	}
};
