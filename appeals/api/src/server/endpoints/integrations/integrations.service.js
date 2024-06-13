import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { randomUUID } from 'node:crypto';
import {
	createAppeal,
	createOrUpdateLpaQuestionnaire
} from '#repositories/integrations.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import { EventType } from '@pins/event-client';
import BackOfficeAppError from '#utils/app-error.js';

/**
 *
 * @param {*} data
 * @param {*} documents
 * @param {string[] | null} relatedReferences
 * @returns
 */
const importAppellantCase = async (data, documents, relatedReferences) => {
	await checkExistingDocumentIDs(documents);
	const result = await createAppeal(data, documents, relatedReferences || []);

	if (!result?.appeal) {
		throw new BackOfficeAppError(`Failure importing appellant case. Appeal could not be created.`);
	} else {
		return result;
	}
};

const importLPAQuestionnaire = async (
	/** @type {string} */ caseReference,
	/** @type {*} */ data,
	/** @type {*} */ documents
) => {
	await checkExistingDocumentIDs(documents);
	const result = await createOrUpdateLpaQuestionnaire(caseReference, data, documents);

	if (!result?.appeal) {
		throw new BackOfficeAppError(
			`Failure importing LPA questionnaire. Appeal with case reference '${caseReference}' does not exist.`
		);
	} else {
		return result;
	}
};

const importDocuments = async (
	/** @type {any[]} */ documents,
	/** @type {any[]} */ documentVersions
) => {
	if (documents.length > 0) {
		// @ts-ignore
		const messages = documents.map((d) => {
			return {
				originalURI: d.documentURI,
				// @ts-ignore
				importedURI: documentVersions.find((dv) => dv.documentGuid === d.documentGuid).documentURI
			};
		});
		const topic = producers.boBlobMove;
		const res = await eventClient.sendEvents(topic, messages, EventType.Create);
		if (res) {
			return true;
		}

		return false;
	}
};

const checkExistingDocumentIDs = async (/** @type {any[]} */ documents) => {
	const existingDocs = await databaseConnector.document.findMany({
		where: {
			guid: { in: documents.map((/** @type {{ documentGuid: string; }} */ d) => d.documentGuid) }
		}
	});

	if (existingDocs?.length > 0) {
		const documentGuids = existingDocs.map((d) => d.guid);
		for (const document of documents) {
			if (documentGuids.indexOf(document.documentGuid) >= 0) {
				document.documentGuid = randomUUID();
			}
		}
	}
};

export const integrationService = {
	importAppellantCase,
	importLPAQuestionnaire,
	importDocuments
};
