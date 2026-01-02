import config from '#config/config.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import { APPEAL_CASE_STAGE } from '@planning-inspectorate/data-model';
import { randomUUID } from 'node:crypto';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission['documents'][number]} RepAttachment */

/**
 *
 * @param {AppellantSubmissionDocument|LPAQuestionnaireCommandDocument|RepAttachment} doc
 * @param {string | null} stage
 * @returns {import('#db-client/models.ts').DocumentVersionCreateInput}
 */
export const mapDocumentIn = (doc, stage = null) => {
	const { filename, documentId, ...metadata } = doc;
	metadata.fileName = metadata.originalFilename;
	if (stage === 'representation' && !metadata.documentType) {
		metadata.fileName = `${randomUUID()}_${metadata.originalFilename}`;
		// @ts-ignore
		metadata.documentType = REP_ATTACHMENT_DOCTYPE;
	}

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
