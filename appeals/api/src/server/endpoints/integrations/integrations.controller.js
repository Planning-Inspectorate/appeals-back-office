import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { addDocumentAudit } from '#endpoints/documents/documents.service.js';
import { commandMappers } from '#mappers/integration/commands/index.js';
import { serviceUserIdStartRange } from '#mappers/integration/map-service-user-entity.js';
import { getAssignedTeam } from '#repositories/team.repository.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { markAwaitingTransfer } from '#utils/mark-for-transfer.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
	AUDIT_TRAIL_DOCUMENT_IMPORTED,
	AUDIT_TRAIL_IP_UUID,
	AUDIT_TRAIL_LPA_UUID,
	AUDIT_TRAIL_LPAQ_IMPORT_MSG,
	AUDIT_TRAIL_REP_IMPORT_MSG,
	AUDIT_TRAIL_SYSTEM_UUID,
	AUDIT_TRAIL_TEAM_ASSIGNED,
	AUDIT_TRIAL_APPELLANT_UUID,
	AUDIT_TRIAL_RULE_6_PARTY_ID
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import {
	APPEAL_APPELLANT_PROCEDURE_PREFERENCE,
	APPEAL_CASE_TYPE,
	APPEAL_REPRESENTATION_TYPE,
	SERVICE_USER_TYPE
} from '@planning-inspectorate/data-model';
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
 *
 * @param {AppellantSubmissionCommand} data
 * @returns {Promise<{id: *, reference: *, assignedTeamId: *, appealTypeId: *}>}
 */
const importIndividualAppeal = async (data) => {
	const { appeal, documents, relatedReferences, appealGrounds } =
		commandMappers.mapAppealSubmission(data);

	let appellantProcedurePreference = APPEAL_APPELLANT_PROCEDURE_PREFERENCE.WRITTEN;

	if (
		data.casedata.caseType === APPEAL_CASE_TYPE.W ||
		data.casedata.caseType === APPEAL_CASE_TYPE.Y ||
		data.casedata.caseType === APPEAL_CASE_TYPE.H
	) {
		// @ts-ignore
		appellantProcedurePreference =
			data.casedata.appellantProcedurePreference || APPEAL_APPELLANT_PROCEDURE_PREFERENCE.WRITTEN;
	}
	const casedata = await integrationService.importAppellantCase(
		appeal,
		documents,
		relatedReferences,
		appealGrounds,
		appellantProcedurePreference
	);

	const { documentVersions } = casedata;
	const { id, reference, appellantId, agentId, assignedTeamId, appealTypeId } = casedata.appeal;

	await createAuditTrail({
		appealId: id,
		details: AUDIT_TRAIL_APPELLANT_IMPORT_MSG,
		azureAdUserId: AUDIT_TRIAL_APPELLANT_UUID
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
				writeDocumentAuditTrail(id, document, AUDIT_TRIAL_APPELLANT_UUID)
			]);
		})
	);

	return { id, reference, assignedTeamId, appealTypeId };
};

/**
 * Clones an individual appeal from the main appeal for the submission individual
 * @param {{mainAppealReference: string, casedata: any, documents: Array<any>, users: Array<any>}} data
 */
const importNamedIndividuals = async ({ mainAppealReference, casedata, documents, users }) => {
	const namedIndividuals =
		// @ts-ignore
		casedata?.namedIndividuals?.map((individual) => {
			const { firstName, lastName, interestInLand, writtenOrVerbalPermission } = individual;
			// Main appeals appellant is this appeals agent.
			const agent = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.APPELLANT);

			const data = {
				users: [{ firstName, lastName, serviceUserType: SERVICE_USER_TYPE.APPELLANT }, ...[agent]],
				casedata: { ...structuredClone(casedata), interestInLand, writtenOrVerbalPermission },
				documents: structuredClone(documents)
			};

			if (agent) {
				data.users.push(agent);
			}

			// For now, relate this individual appeal to the main appeal (later we will link them properly)
			data.casedata.nearbyCaseReferences = [mainAppealReference];

			return data;
		}) || [];

	const childResults = await Promise.all(namedIndividuals.map(importIndividualAppeal));

	// For now, we will mark all related enforcement appeals as marked for transfer to horizon
	await Promise.all(
		// @ts-ignore
		childResults.map(({ id, appealTypeId }) =>
			markAwaitingTransfer(id, appealTypeId, AUDIT_TRIAL_APPELLANT_UUID)
		)
	);
};

/**
 * @param {{body: AppellantSubmissionCommand}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const importAppeal = async (req, res) => {
	const { casedata, documents, users } = req.body || {};
	const data = { casedata, documents, users };

	const { id, reference, assignedTeamId, appealTypeId } = await importIndividualAppeal(data);

	if (
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE) &&
		casedata.caseType === APPEAL_CASE_TYPE.C &&
		// @ts-ignore
		req.body?.casedata?.namedIndividuals?.length
	) {
		await markAwaitingTransfer(id, appealTypeId, AUDIT_TRIAL_APPELLANT_UUID);
		await importNamedIndividuals({
			mainAppealReference: reference,
			casedata,
			documents,
			users
		});
	}

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
		azureAdUserId: AUDIT_TRAIL_LPA_UUID
	});

	await Promise.all([
		broadcasters.broadcastAppeal(id, EventType.Update),
		integrationService.importDocuments(documents, documentVersions)
	]);

	await Promise.all(
		documentVersions.map(async (document) => {
			await Promise.all([
				broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create),
				writeDocumentAuditTrail(id, document, AUDIT_TRAIL_LPA_UUID)
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
	const serviceUserId = Number(req.body.serviceUserId) - serviceUserIdStartRange;
	const isRule6Party = !!req.appeal.appealRule6Parties?.some(
		(party) => party.serviceUserId === serviceUserId
	);

	const { representation, attachments } = commandMappers.mapRepresentation(req.body, isRule6Party);

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

	let azureAdUserId;
	switch (repType) {
		case 'ip_comment':
			azureAdUserId = AUDIT_TRAIL_IP_UUID;
			break;
		case 'appellant_final_comment':
		case 'appellant_statement':
			azureAdUserId = AUDIT_TRIAL_APPELLANT_UUID;
			break;
		case 'lpa_final_comment':
		case 'lpa_statement':
			azureAdUserId = AUDIT_TRAIL_LPA_UUID;
			break;
		case 'rule_6_party_statement':
		case 'rule_6_party_proofs_evidence':
			azureAdUserId = AUDIT_TRIAL_RULE_6_PARTY_ID;
			break;
		default:
			azureAdUserId = AUDIT_TRAIL_SYSTEM_UUID;
	}
	await createAuditTrail({
		appealId,
		details: stringTokenReplacement(AUDIT_TRAIL_REP_IMPORT_MSG, [repType]),
		azureAdUserId: azureAdUserId
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
 * @param {string} azureAdUserId
 */
const writeDocumentAuditTrail = async (appealId, document, azureAdUserId) => {
	const auditTrail = await createAuditTrail({
		appealId: appealId,
		azureAdUserId: azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_IMPORTED, [document.fileName || ''])
	});

	if (auditTrail) {
		await addDocumentAudit(document.documentGuid, 1, auditTrail, EventType.Create);
	}
};
