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
	ODW_APPELLANT_SVCUSR,
	ODW_AGENT_SVCUSR
} from '#endpoints/constants.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('#config/../openapi-types.js').AppellantCaseData} AppellantCaseData */
/** @typedef {import('#config/../openapi-types.js').QuestionnaireData} QuestionnaireData */
/** @typedef {import('#config/../openapi-types.js').AddDocumentsRequest} AddDocumentsRequest */

/**
 * @param {{body: AppellantCaseData}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postAppealSubmission = async (req, res) => {
	const { appeal, documents } = messageMappers.mapAppealSubmission(req.body);
	const dbResult = await integrationService.importAppellantCase(appeal, documents);

	const { id, reference, appellantId, agentId } = dbResult.appeal;
	const { documentVersions } = dbResult;

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
			ODW_APPELLANT_SVCUSR,
			reference
		);
	}

	if (agentId) {
		await broadcasters.broadcastServiceUser(agentId, EventType.Create, ODW_AGENT_SVCUSR, reference);
	}

	await integrationService.importDocuments(documents, documentVersions);

	for (const document of documentVersions) {
		await broadcasters.broadcastDocument(document.guid, EventType.Create);

		const auditTrail = await createAuditTrail({
			appealId: id,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName])
		});

		if (auditTrail) {
			await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
		}
	}

	return res.send({ id, reference });
};

/**
 * @param {{body: QuestionnaireData}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postLpaqSubmission = async (req, res) => {
	const { caseReference, questionnaire, documents } = messageMappers.mapQuestionnaireSubmission(
		req.body
	);
	const dbResult = await integrationService.importLPAQuestionnaire(
		// @ts-ignore
		caseReference,
		questionnaire,
		documents
	);

	// @ts-ignore
	const { id, reference } = dbResult.appeal;
	const { documentVersions } = dbResult;

	await createAuditTrail({
		appealId: id,
		details: AUDIT_TRAIL_LPAQ_IMPORT_MSG,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
	});

	await broadcasters.broadcastAppeal(id, EventType.Update);

	await integrationService.importDocuments(documents, documentVersions);

	for (const document of documentVersions) {
		await broadcasters.broadcastDocument(document.guid, EventType.Create);

		const auditTrail = await createAuditTrail({
			appealId: id,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName])
		});

		if (auditTrail) {
			await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
		}
	}

	return res.send({ id, reference });
};
