import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { UUID_REGEX } from '#endpoints/constants.js';
import { mapDate } from './date.mapper.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { APPEAL_ORIGIN, APPEAL_CASE_STAGE } from 'pins-data-model';
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
 * @returns
 */
export const mapDocumentIn = (doc, stage = null) => {
	const { filename, originalFilename, documentId, ...metadata } = doc;

	const { originalGuid } = mapDocumentUrl(metadata.documentURI);
	const description = metadata.description || 'Document imported';

	let documentGuid = originalGuid;
	const uuid = UUID_REGEX.exec(documentId) || UUID_REGEX.exec(documentGuid);
	if (!uuid) {
		documentGuid = randomUUID();
	}

	metadata.fileName = originalFilename;
	metadata.blobStorageContainer = config.BO_BLOB_CONTAINER;
	metadata.blobStoragePath = `${documentGuid}/v1/${filename}`;
	metadata.stage = metadata.stage ?? stage ?? 'internal';

	return {
		...metadata,
		documentGuid,
		description,
		dateCreated: (doc.dateCreated ? new Date(doc.dateCreated) : new Date()).toISOString(),
		lastModified: new Date().toISOString()
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
 * @returns {{originalGuid: string}}
 */
const mapDocumentUrl = (documentURI) => {
	const url = new URL(documentURI);
	if (!url) {
		throw new Error('Invalid document URI');
	}

	const path = url.pathname.split('/').slice(1);
	if (path.length !== 4) {
		throw new Error(
			'Unsupported document pathname, expected four parts: /<container>/<ref>/<doc-id>/<filename>'
		);
	}
	const originalGuid = path[2];
	return {
		originalGuid
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
	return documentVersion.stage !== 'internal';
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
