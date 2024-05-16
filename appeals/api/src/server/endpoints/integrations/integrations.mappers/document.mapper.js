// @ts-nocheck
// TODO: schemas (PINS data model)

import config from '#config/config.js';
import { randomUUID } from 'node:crypto';
import { UUID_REGEX } from '#endpoints/constants.js';
import { mapDate } from './date.mapper.js';
import { ODW_SYSTEM_ID, CONFIG_APPEAL_STAGES } from '#endpoints/constants.js';
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
	if (!data || !data.latestDocumentVersion) {
		return null;
	}

	const isPublished = mapPublishingStatus(data.latestDocumentVersion);
	const virusCheckStatus = mapVirusCheckStatus(data.latestDocumentVersion);
	const redactedStatus = mapRedactionStatus(data.latestDocumentVersion.redactionStatus);

	const doc = {
		documentId: data.guid,
		caseId: data.caseId,
		caseReference: data.case.reference,
		version: data.latestDocumentVersion.version,
		filename: data.latestDocumentVersion.fileName,
		originalFilename: data.latestDocumentVersion.originalFilename,
		size: data.latestDocumentVersion.size,
		mime: data.latestDocumentVersion.mime,
		documentURI: data.latestDocumentVersion.documentURI,
		publishedDocumentURI: isPublished ? data.latestDocumentVersion.documentURI : null,
		virusCheckStatus,
		fileMD5: data.latestDocumentVersion.fileMD5,
		dateCreated: mapDate(data.latestDocumentVersion.dateCreated),
		dateReceived: mapDate(data.latestDocumentVersion.dateReceived),
		datePublished: isPublished ? mapDate(data.latestDocumentVersion.dateCreated) : null,
		lastModified: mapDate(
			data.latestDocumentVersion.lastModified || data.latestDocumentVersion.dateCreated
		),
		caseType: data.case.appealType.shorthand,
		redactedStatus,
		documentType: data.latestDocumentVersion.documentType,
		sourceSystem: ODW_SYSTEM_ID,
		origin: mapOrigin(data.latestDocumentVersion.stage),
		owner: null,
		author: null,
		description: null,
		caseStage: mapStage(data.latestDocumentVersion.stage),
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
	return documentVersion.stage !== 'internal';
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
	if (stage === CONFIG_APPEAL_STAGES.appellantCase) {
		return ORIGIN.CITIZEN;
	}
	if (stage === CONFIG_APPEAL_STAGES.lpaQuestionnaire) {
		return ORIGIN.LPA;
	}
	if (stage === CONFIG_APPEAL_STAGES.decision || stage === CONFIG_APPEAL_STAGES.costs) {
		return ORIGIN.PINS;
	}
	return null;
};

const mapStage = (stage) => {
	if (stage === CONFIG_APPEAL_STAGES.appellantCase) {
		return STAGE.APPELLANTCASE;
	}
	if (stage === CONFIG_APPEAL_STAGES.lpaQuestionnaire) {
		return STAGE.LPAQUESTIONNAIRE;
	}
	if (stage === CONFIG_APPEAL_STAGES.decision) {
		return STAGE.APPEALDECISION;
	}
	if (stage === CONFIG_APPEAL_STAGES.costs) {
		return STAGE.COSTS;
	}

	return null;
};
