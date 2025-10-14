import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import {
	createAppeal,
	createOrUpdateLpaQuestionnaire,
	createRepresentation
} from '#repositories/integrations.repository.js';
import BackOfficeAppError from '#utils/app-error.js';
import { EventType } from '@pins/event-client';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */

/**
 * @param {import('#db-client').Prisma.AppealCreateInput} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @param {string[] | null} relatedReferences
 * @param {string} appellantProcedurePreference
 * @returns
 */
const importAppellantCase = async (
	data,
	documents,
	relatedReferences,
	appellantProcedurePreference
) => {
	const result = await createAppeal(
		data,
		documents,
		relatedReferences || [],
		appellantProcedurePreference
	);

	if (!result?.appeal) {
		throw new BackOfficeAppError(
			`Failure importing appellant case. Appeal could not be created.`,
			400
		);
	} else {
		return result;
	}
};

/**
 *
 * @param {string} caseReference
 * @param {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @param {string[] | null} relatedReferences
 * @returns
 */
const importLPAQuestionnaire = async (caseReference, data, documents, relatedReferences) => {
	const result = await createOrUpdateLpaQuestionnaire(
		caseReference,
		data,
		documents,
		relatedReferences || []
	);

	if (!result?.appeal) {
		throw new BackOfficeAppError(
			`Failure importing LPA questionnaire. Appeal with case reference '${caseReference}' does not exist.`,
			400
		);
	} else {
		return result;
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {Omit<import('#db-client').Prisma.RepresentationCreateInput, 'appeal'>} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} attachments
 * @returns {Promise<{rep: Representation, documentVersions: DocumentVersion[]}>}
 */
const importRepresentation = async (appeal, data, attachments) => {
	const result = await createRepresentation(appeal, data, attachments);

	if (!result?.rep) {
		throw new BackOfficeAppError(
			`Failure importing Representation associated with case reference '${appeal.reference}'.`,
			400
		);
	} else {
		return result;
	}
};

/**
 *
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @param {import('@pins/appeals.api').Schema.DocumentVersion[]} documentVersions
 * @returns {Promise<boolean>}
 */
const importDocuments = async (documents, documentVersions) => {
	if (documents.length > 0) {
		const messages = documents
			.map((d) => {
				// @ts-ignore
				const matchingGuid = documentVersions.find((dv) => dv.documentGuid === d.documentGuid);
				if (matchingGuid) {
					return {
						originalURI: d.documentURI,
						importedURI: matchingGuid.documentURI
					};
				}
			})
			.filter((m) => m !== undefined);

		if (messages.length > 0) {
			const topic = producers.boBlobMove;
			const res = await eventClient.sendEvents(topic, messages, EventType.Create);
			if (res) {
				return true;
			}
		}
	}
	return false;
};

export const integrationService = {
	importAppellantCase,
	importLPAQuestionnaire,
	importRepresentation,
	importDocuments
};
