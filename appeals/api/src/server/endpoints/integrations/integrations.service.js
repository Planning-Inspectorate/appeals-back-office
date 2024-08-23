import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import {
	createAppeal,
	createOrUpdateLpaQuestionnaire
} from '#repositories/integrations.repository.js';
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
 * @param {*} data
 * @param {*} documents
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

export const integrationService = {
	importAppellantCase,
	importLPAQuestionnaire,
	importDocuments
};
