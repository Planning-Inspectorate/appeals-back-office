import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { addDocumentAudit } from '#endpoints/documents/documents.service.js';
import { commandMappers } from '#mappers/integration/commands/index.js';
import { getAssignedTeam } from '#repositories/team.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
	AUDIT_TRAIL_DOCUMENT_IMPORTED,
	AUDIT_TRAIL_LPAQ_IMPORT_MSG,
	AUDIT_TRAIL_REP_IMPORT_MSG,
	AUDIT_TRAIL_SYSTEM_UUID,
	AUDIT_TRAIL_TEAM_ASSIGNED
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { APPEAL_REPRESENTATION_TYPE, SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';
import { broadcasters } from './integrations.broadcasters.js';
import { integrationService } from './integrations.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */

/**
 * @param {{body: AppellantSubmissionCommand}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importAppeal = async (req, res) => {
	const { appeal, documents, relatedReferences } = commandMappers.mapAppealSubmission(req.body);

	let appellantProcedurePreference = 'written';

	if (req.body.casedata.caseType === 'W' || req.body.casedata.caseType === 'Y') {
		appellantProcedurePreference = req.body.casedata.appellantProcedurePreference || 'written';
	}
	const casedata = await integrationService.importAppellantCase(
		appeal,
		documents,
		relatedReferences,
		appellantProcedurePreference
	);

	const { documentVersions } = casedata;
	const { id, reference, appellantId, agentId, assignedTeamId } = casedata.appeal;

	await createAuditTrail({
		appealId: id,
		details: AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
	});

	if (casedata.appeal.assignedTeamId) {
		const team = await getAssignedTeam(casedata.appeal.assignedTeamId);
		const teamAssignmentMessage = stringTokenReplacement(AUDIT_TRAIL_TEAM_ASSIGNED, [
			team?.name ?? ''
		]);
		await createAuditTrail({
			appealId: id,
			details: teamAssignmentMessage,
			azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID
		});
	}

	await Promise.all([
		broadcasters.broadcastAppeal(id, EventType.Create),
		integrationService.importDocuments(documents, documentVersions)
	]);

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

	await Promise.all(
		documentVersions.map(async (document) => {
			await Promise.all([
				broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create),
				writeDocumentAuditTrail(id, document)
			]);
		})
	);

	return res.status(201).send({ id, reference, assignedTeamId });
};

/**
 * @param {{body: LPAQuestionnaireCommand, appeal: Appeal, designatedSites: DesignatedSite[]}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importLpaqSubmission = async (req, res) => {
	const { caseReference, questionnaire, documents, relatedReferences } =
		commandMappers.mapQuestionnaireSubmission(req.body, req.appeal, req.designatedSites);

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

	await Promise.all([
		broadcasters.broadcastAppeal(id, EventType.Update),
		integrationService.importDocuments(documents, documentVersions)
	]);

	await Promise.all(
		documentVersions.map(async (document) => {
			await Promise.all([
				broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create),
				writeDocumentAuditTrail(id, document)
			]);
		})
	);

	return res.status(201).send({ id, reference });
};

/**
 * @param {{body: AppealRepresentationSubmission, appeal: Appeal}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importRepresentation = async (req, res) => {
	const { representation, attachments } = commandMappers.mapRepresentation(req.body);

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
	const repType =
		representation.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
			? 'ip_comment'
			: representation.representationType;

	await createAuditTrail({
		appealId,
		details: stringTokenReplacement(AUDIT_TRAIL_REP_IMPORT_MSG, [repType]),
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

	await Promise.all([
		broadcasters.broadcastRepresentation(repId, EventType.Create),
		integrationService.importDocuments(attachments, documentVersions)
	]);

	await Promise.all(
		documentVersions.map(async (document) => {
			await broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create);
		})
	);

	return res.status(201).send(rep);
};

/**
 *
 * @param {number} appealId
 * @param {{ fileName: string|null, documentGuid: string}} document
 */
const writeDocumentAuditTrail = async (appealId, document) => {
	const auditTrail = await createAuditTrail({
		appealId: appealId,
		azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID,
		details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName || ''])
	});

	if (auditTrail) {
		await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
	}
};
