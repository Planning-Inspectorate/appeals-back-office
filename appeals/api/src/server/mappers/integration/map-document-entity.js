import { mapDate } from '#utils/mapping/map-dates.js';

import {
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_ORIGIN,
	APPEAL_REDACTED_STATUS
} from 'pins-data-model';
import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { isValidAppealType, isValidVirusCheckStatus } from '#utils/mapping/map-enums.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Document & {appeal:Appeal}} DocumentWithAppeal */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/** @typedef {import('pins-data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */

/**
 *
 * @param {DocumentWithAppeal} data
 * @returns {AppealDocument | null}
 */
export const mapDocumentEntity = (data) => {
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
		caseReference: documentInput.case?.reference || '',
		version: documentInput.latestDocumentVersion.version,
		filename: documentInput.latestDocumentVersion.fileName || '',
		originalFilename: documentInput.latestDocumentVersion.originalFilename || '',
		size: documentInput.latestDocumentVersion.size ?? 0,
		mime: documentInput.latestDocumentVersion.mime || '',
		documentURI: documentInput.latestDocumentVersion.documentURI || '',
		publishedDocumentURI: isPublished ? documentInput.latestDocumentVersion.documentURI : null,
		virusCheckStatus,
		fileMD5: documentInput.latestDocumentVersion.fileMD5,
		dateCreated: mapDate(documentInput.latestDocumentVersion.dateCreated) ?? '',
		dateReceived: mapDate(documentInput.latestDocumentVersion.dateReceived) ?? '',
		datePublished: isPublished ? mapDate(documentInput.latestDocumentVersion.dateCreated) : null,
		lastModified: mapDate(
			documentInput.latestDocumentVersion.lastModified ||
				documentInput.latestDocumentVersion.dateCreated
		),
		caseType: isValidAppealType(documentInput.case?.appealType?.key ?? '')
			? documentInput.case?.appealType?.key
			: null,
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
 * @returns {'affected'|'not_scanned'|'scanned'}
 */
const mapVirusCheckStatus = (documentVersion) => {
	const status = getAvScanStatus(documentVersion);
	if (isValidVirusCheckStatus(status)) {
		return status;
	}

	return 'not_scanned';
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
