// @ts-nocheck
// TODO: schemas (PINS data model)

import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { UUID_REGEX } from '#endpoints/constants.js';
import { mapDate } from './date.mapper.js';
import { ODW_SYSTEM_ID } from '#endpoints/constants.js';
import {
	AVSCAN_STATUS,
	REDACTION_STATUS,
	ORIGIN,
	STAGE
} from '@pins/appeals/constants/documents.js';

export const mapDocumentIn = (doc) => {
	const { filename, ...metadata } = doc;
	const { originalFilename, originalGuid } = mapDocumentUrl(metadata.documentURI, filename);

	let documentGuid = originalGuid;
	const uuid = UUID_REGEX.exec(documentGuid);
	if (!uuid) {
		documentGuid = randomUUID();
	}

	metadata.blobStorageContainer = config.BO_BLOB_CONTAINER;
	metadata.blobStoragePath = `${documentGuid}/v1/${originalFilename}`;

	return {
		...metadata,
		documentGuid,
		fileName: originalFilename,
		dateCreated: (doc.dateCreated ? new Date(doc.dateCreated) : new Date()).toISOString(),
		lastModified: (doc.lastModified ? new Date(doc.lastModified) : new Date()).toISOString()
	};
};

export const mapDocumentOut = (data) => {
	const latestDocumentVersion = data.documentVersion.length === 1 ? data.documentVersion[0] : null;
	const documentInput = {
		...data,
		latestDocumentVersion
	};

	if (!documentInput || !documentInput.latestDocumentVersion) {
		return null;
	}

	const isPublished = mapPublishingStatus(documentInput.latestDocumentVersion);
	const virusCheckStatus = mapVirusCheckStatus(documentInput.latestDocumentVersion);
	const redactedStatus = mapRedactionStatus(documentInput.latestDocumentVersion.redactionStatus);

	const doc = {
		documentId: documentInput.guid,
		caseId: documentInput.caseId,
		caseReference: documentInput.case.reference,
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
		caseType: documentInput.case.appealType.shorthand,
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

const mapVirusCheckStatus = (documentVersion) => {
	if (documentVersion.virusCheckStatus === 'checked') {
		return AVSCAN_STATUS.SCANNED;
	}
	if (documentVersion.virusCheckStatus === 'not_checked') {
		return AVSCAN_STATUS.NOT_SCANNED;
	}

	return AVSCAN_STATUS.AFFECTED;
};

const mapPublishingStatus = (documentVersion) => {
	return documentVersion.stage !== STAGE.INTERNAL;
};

const mapRedactionStatus = (status) => {
	if (status.name === 'No redaction required') {
		return REDACTION_STATUS.NO_REDACTION_REQUIRED;
	}
	if (status.name === 'Redacted') {
		return REDACTION_STATUS.REDACTED;
	}
	return REDACTION_STATUS.UNREDACTED;
};

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
