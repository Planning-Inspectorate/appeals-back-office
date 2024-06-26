import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { UUID_REGEX } from '#endpoints/constants.js';
import { mapDate } from './date.mapper.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { ORIGIN, STAGE } from '@pins/appeals/constants/documents.js';
import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import { DOCTYPE } from '@pins/appeals/constants/documents.js';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/** @typedef {import('pins-data-model').Schemas.AppealDocument} AppealDocument */

/**
 *
 * @param {*} doc
 * @param {string | null} stage
 * @returns
 */
export const mapDocumentIn = (doc, stage = null) => {
	const { filename, documentId, ...metadata } = doc;

	// @ts-ignore
	const { originalFilename, originalGuid } = mapDocumentUrl(metadata.documentURI, filename);
	const description = metadata.description || 'Document imported';

	let documentGuid = originalGuid;
	const uuid = UUID_REGEX.exec(documentId) || UUID_REGEX.exec(documentGuid);
	if (!uuid) {
		documentGuid = randomUUID();
	}

	metadata.blobStorageContainer = config.BO_BLOB_CONTAINER;
	metadata.blobStoragePath = `${documentGuid}/v1/${originalFilename}`;
	metadata.documentType = metadata.documentType ?? DOCTYPE.DROPBOX;
	metadata.stage = metadata.stage ?? stage ?? STAGE.INTERNAL;

	return {
		...metadata,
		documentGuid,
		fileName: originalFilename,
		description,
		dateCreated: (doc.dateCreated ? new Date(doc.dateCreated) : new Date()).toISOString(),
		lastModified: (doc.lastModified ? new Date(doc.lastModified) : new Date()).toISOString()
	};
};

/**
 *
 * @param {Document} data
 * @returns
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
		documentInput.latestDocumentVersion.redactionStatus || null
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

	return doc;
};

/**
 *
 * @param {string} documentURI
 * @param {string} fileName
 * @returns
 */
const mapDocumentUrl = (documentURI, fileName) => {
	const url = new URL(documentURI);
	if (!url) {
		throw new Error('Invalid document URI');
	}

	const path = url.pathname.split('/').slice(1);
	if (path.length !== 4) {
		return null;
	}
	const originalGuid = path[2];
	let originalFilename = path[3];
	if (fileName !== originalFilename) {
		originalFilename = fileName;
	}

	return {
		originalGuid,
		originalFilename
	};
};

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns
 */
const mapVirusCheckStatus = (documentVersion) => {
	return getAvScanStatus(documentVersion);
};

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns
 */
const mapPublishingStatus = (documentVersion) => {
	return documentVersion.stage !== STAGE.INTERNAL;
};

/**
 *
 * @param {DocumentRedactionStatus | null} status
 * @returns
 */
const mapRedactionStatus = (status) => {
	return status?.key || null;
};

/**
 *
 * @param {string | null} stage
 * @returns
 */
const mapOrigin = (stage) => {
	if (stage === STAGE.APPELLANT_CASE) {
		return ORIGIN.CITIZEN;
	}
	if (stage === STAGE.LPA_QUESTIONNAIRE) {
		return ORIGIN.LPA;
	}
	if (stage === STAGE.APPEAL_DECISION || stage === STAGE.INTERNAL) {
		return ORIGIN.PINS;
	}
	return null;
};
