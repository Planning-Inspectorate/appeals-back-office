import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { mapDate } from './date.mapper.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import {
	APPEAL_ORIGIN,
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_REDACTED_STATUS
} from 'pins-data-model';
import { getAvScanStatus } from '#endpoints/documents/documents.service.js';

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

/**
 *
 * @param {Document} data
 * @returns {AppealDocument | null}
 */
export const mapDocumentOut = (data) => {
	const latestDocumentVersion = data.versions?.length === 1 ? data.versions[0] : null;
	const documentInput = {
		...data,
		latestDocumentVersion
	};

	if (!documentInput || !documentInput.latestDocumentVersion) {
		return null;
	}

	const isPublished = mapPublishingStatus(documentInput.latestDocumentVersion);
	const virusCheckStatus = mapVirusCheckStatus(documentInput.latestDocumentVersion);
	const redactedStatus = mapRedactionStatus(
		documentInput.latestDocumentVersion.redactionStatus || null,
		documentInput.latestDocumentVersion.documentType || null
	);

	const doc = {
		documentId: documentInput.guid,
		caseId: documentInput.caseId,
		caseReference: documentInput.case?.reference,
		version: documentInput.latestDocumentVersion.version,
		filename: documentInput.latestDocumentVersion.fileName,
		originalFilename: documentInput.latestDocumentVersion.originalFilename,
		size: documentInput.latestDocumentVersion.size,
		mime: documentInput.latestDocumentVersion.mime,
		documentURI: documentInput.latestDocumentVersion.documentURI,
		publishedDocumentURI: isPublished ? documentInput.latestDocumentVersion.documentURI : null,
		virusCheckStatus,
		fileMD5: documentInput.latestDocumentVersion.fileMD5,
		dateCreated: mapDate(documentInput.latestDocumentVersion.dateCreated),
		dateReceived: mapDate(documentInput.latestDocumentVersion.dateReceived),
		datePublished: isPublished ? mapDate(documentInput.latestDocumentVersion.dateCreated) : null,
		lastModified: mapDate(
			documentInput.latestDocumentVersion.lastModified ||
				documentInput.latestDocumentVersion.dateCreated
		),
		caseType: documentInput.case?.appealType?.key || null,
		redactedStatus,
		documentType: documentInput.latestDocumentVersion.documentType,
		sourceSystem: ODW_SYSTEM_ID,
		origin: mapOrigin(documentInput.latestDocumentVersion.stage),
		owner: null,
		author: null,
		description: null,
		caseStage: documentInput.latestDocumentVersion.stage,
		horizonFolderId: null
	};

	// @ts-ignore
	return doc;
};

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns {string}
 */
const mapVirusCheckStatus = (documentVersion) => {
	return getAvScanStatus(documentVersion);
};

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns {boolean}
 */
const mapPublishingStatus = (documentVersion) => {
	return documentVersion.stage !== APPEAL_CASE_STAGE.INTERNAL;
};

/**
 *
 * @param {DocumentRedactionStatus | null} status
 * @param {string | null} documentType
 * @returns {string}
 */
const mapRedactionStatus = (status, documentType) => {
	if (documentType === APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER) {
		return APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED;
	}

	return status?.key || APPEAL_REDACTED_STATUS.NOT_REDACTED;
};

/**
 *
 * @param {string | null} stage
 * @returns {string | null}
 */
const mapOrigin = (stage) => {
	if (stage === APPEAL_CASE_STAGE.APPELLANT_CASE) {
		return APPEAL_ORIGIN.CITIZEN;
	}
	if (stage === APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE) {
		return APPEAL_ORIGIN.LPA;
	}
	if (stage === APPEAL_CASE_STAGE.APPEAL_DECISION || stage === APPEAL_CASE_STAGE.INTERNAL) {
		return APPEAL_ORIGIN.PINS;
	}
	return null;
};
