import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import {
	createAppeal,
	createOrUpdateLpaQuestionnaire
} from '#repositories/integrations.repository.js';
import { EventType } from '@pins/event-client';
import BackOfficeAppError from '#utils/app-error.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */

/**
 * @param {import('#db-client').Prisma.AppealCreateInput} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @param {string[] | null} relatedReferences
 * @returns {Promise<{appeal: Appeal, documentVersions: DocumentVersion[]}>}
 */
const importAppellantCase = async (data, documents, relatedReferences) => {
	const result = await createAppeal(data, documents, relatedReferences || []);

	if (!result?.appeal) {
		throw new BackOfficeAppError(`Failure importing appellant case. Appeal could not be created.`);
	} else {
		return result;
	}
};

/**
 *
 * @param {string} caseReference
 * @param {import('#db-client').Prisma.LPAQuestionnaireCreateInput} data
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
			`Failure importing LPA questionnaire. Appeal with case reference '${caseReference}' does not exist.`
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
	importDocuments
};
