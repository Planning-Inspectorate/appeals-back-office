import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { APPEAL_CASE_STAGE } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/** @typedef {import('pins-data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */

/**
 *
 * @param {AppellantSubmissionDocument|LPAQuestionnaireCommandDocument} doc
 * @param {string | null} stage
 * @returns {import('#db-client').Prisma.DocumentVersionCreateInput}
 */
export const mapDocumentIn = (doc, stage = null) => {
	const { filename, documentId, ...metadata } = doc;

	metadata.fileName = metadata.originalFilename;
	metadata.blobStorageContainer = config.BO_BLOB_CONTAINER;
	metadata.stage = metadata.stage ?? stage ?? APPEAL_CASE_STAGE.INTERNAL;
	metadata.description = metadata.description || `Document ${filename} (${documentId}) imported`;

	const documentVersionInput = {
		...metadata,
		documentGuid: randomUUID(),
		dateCreated: (doc.dateCreated ? new Date(doc.dateCreated) : new Date()).toISOString(),
		lastModified: new Date().toISOString(),
		version: 1
	};

	return documentVersionInput;
};
