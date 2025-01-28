import { messageMappers } from './integrations.mappers.js';
import { broadcasters } from './integrations.broadcasters.js';
import { integrationService } from './integrations.service.js';
import { addDocumentAudit } from '#endpoints/documents/documents.service.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { EventType } from '@pins/event-client';
import {
	AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
	AUDIT_TRAIL_LPAQ_IMPORT_MSG,
	AUDIT_TRAIL_DOCUMENT_IMPORTED,
	AUDIT_TRAIL_SYSTEM_UUID,
	AUDIT_TRAIL_REP_IMPORT_MSG
} from '#endpoints/constants.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { APPEAL_REPRESENTATION_TYPE, SERVICE_USER_TYPE } from 'pins-data-model';
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('pins-data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */

/**
 * @param {{body: AppellantSubmissionCommand}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importAppeal = async (req, res) => {
	const { appeal, documents, relatedReferences } = messageMappers.mapAppealSubmission(req.body);

	const casedata = await integrationService.importAppellantCase(
		appeal,
		documents,
		relatedReferences
	);

	const { documentVersions } = casedata;
	const { id, reference, appellantId, agentId } = casedata.appeal;

	await createAuditTrail({
		appealId: id,
		details: AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
	});

	await broadcasters.broadcastAppeal(id, EventType.Create);

	if (appellantId) {
		await broadcasters.broadcastServiceUser(
			appellantId,
			EventType.Create,
			SERVICE_USER_TYPE.APPELLANT,
			reference
		);
	}

	if (agentId) {
		await broadcasters.broadcastServiceUser(
			agentId,
			EventType.Create,
			SERVICE_USER_TYPE.AGENT,
			reference
		);
	}

	await integrationService.importDocuments(documents, documentVersions);

	for (const document of documentVersions) {
		await broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create);

		const auditTrail = await createAuditTrail({
			appealId: id,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName || ''])
		});

		if (auditTrail) {
			await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
		}
	}

	return res.send({ id, reference });
};

/**
 * @param {{body: LPAQuestionnaireCommand}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importLpaqSubmission = async (req, res) => {
	const { caseReference, questionnaire, documents, relatedReferences } =
		messageMappers.mapQuestionnaireSubmission(req.body);
	const casedata = await integrationService.importLPAQuestionnaire(
		caseReference,
		questionnaire,
		documents,
		relatedReferences
	);

	if (!casedata.appeal) {
		return res.status(404);
	}

	const { documentVersions } = casedata;
	const { id, reference } = casedata.appeal;

	await createAuditTrail({
		appealId: id,
		details: AUDIT_TRAIL_LPAQ_IMPORT_MSG,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
	});

	await broadcasters.broadcastAppeal(id, EventType.Update);

	await integrationService.importDocuments(documents, documentVersions);

	for (const document of documentVersions) {
		await broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create);

		const auditTrail = await createAuditTrail({
			appealId: id,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName || ''])
		});

		if (auditTrail) {
			await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
		}
	}

	return res.send({ id, reference });
};

/**
 * @param {{body: AppealRepresentationSubmission, appeal: Appeal}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importRepresentation = async (req, res) => {
	const { representation, attachments } = messageMappers.mapRepresentation(req.body);

	const hasNewUser = representation.represented?.create != null;
	const isIpComment = representation.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT;

	const casedata = await integrationService.importRepresentation(
		req.appeal,
		representation,
		attachments
	);

	if (!casedata.rep) {
		return res.status(404);
	}

	const { documentVersions, rep } = casedata;
	const appealId = req.appeal.id;
	const repId = rep.id;

	await createAuditTrail({
		appealId,
		details: AUDIT_TRAIL_REP_IMPORT_MSG,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
	});

	if (hasNewUser && rep.representedId && isIpComment) {
		await broadcasters.broadcastServiceUser(
			rep.representedId,
			EventType.Create,
			SERVICE_USER_TYPE.INTERESTED_PARTY,
			req.appeal.reference
		);
	}

	await broadcasters.broadcastRepresentation(repId, EventType.Create);
	await integrationService.importDocuments(attachments, documentVersions);

	for (const document of documentVersions) {
		await broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create);

		const auditTrail = await createAuditTrail({
			appealId: appealId,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName || ''])
		});

		if (auditTrail) {
			await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
		}
	}

	return res.send(rep);
};
