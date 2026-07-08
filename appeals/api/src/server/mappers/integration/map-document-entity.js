import { mapDate } from '#utils/mapping/map-dates.js';

import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import { isValidAppealType, isValidVirusCheckStatus } from '#utils/mapping/map-enums.js';
import {
	APPEAL_REPRESENTATION_TYPE as INTERNAL_REPRESENTATION_TYPE,
	ODW_SYSTEM_ID
} from '@pins/appeals/constants/common.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_ORIGIN,
	APPEAL_REDACTED_STATUS
} from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Document & {appeal:Appeal}} DocumentWithAppeal */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */

/**
 *
 * @param {DocumentWithAppeal} data
 * @returns {AppealDocument | null}
 */
export const mapDocumentEntity = (data) => {
	const latestDocumentVersion = data.versions?.length === 1 ? data.versions[0] : null;
	const docFriendlyName =
		latestDocumentVersion?.representation !== null
			? data.name.replace(/[a-f\d-]{36}_/, '')
			: data.name;

	const documentInput = {
		...data,
		latestDocumentVersion
	};

	if (!documentInput || !documentInput.latestDocumentVersion) {
		return null;
	}

	const publishedFields = mapPublishedFields(documentInput.latestDocumentVersion);
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
		filename: docFriendlyName || '',
		originalFilename: documentInput.latestDocumentVersion.originalFilename || '',
		size: documentInput.latestDocumentVersion.size ?? 0,
		mime: documentInput.latestDocumentVersion.mime || '',
		documentURI: documentInput.latestDocumentVersion.documentURI || '',
		virusCheckStatus,
		fileMD5: documentInput.latestDocumentVersion.fileMD5,
		dateCreated: mapDate(documentInput.latestDocumentVersion.dateCreated) ?? '',
		dateReceived: mapDate(documentInput.latestDocumentVersion.dateReceived) ?? '',
		lastModified: mapDate(
			documentInput.latestDocumentVersion.lastModified ||
				documentInput.latestDocumentVersion.dateCreated
		),
		caseType: isValidAppealType(documentInput.case?.appealType?.key ?? '')
			? documentInput.case?.appealType?.key
			: null,
		redactedStatus,
		documentType: mapDocumentType(documentInput.latestDocumentVersion),
		sourceSystem: ODW_SYSTEM_ID,
		origin: mapOrigin(documentInput.latestDocumentVersion.stage),
		owner: null,
		author: null,
		description: null,
		caseStage: mapStage(documentInput.latestDocumentVersion),
		horizonFolderId: null,
		...publishedFields
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

/** @type {Set<string>} */
const documentTypesWithManagedPublishedStatuses = new Set([
	APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION,
	APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE,
	APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL,
	APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION,
	APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE,
	APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL
]);

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns {{publishedDocumentURI: string | null, datePublished: string | null}}
 */
const mapPublishedFields = (documentVersion) => {
	// internal only docs are never meant to be marked published
	if (documentVersion.stage === APPEAL_CASE_STAGE.INTERNAL) {
		return {
			publishedDocumentURI: null,
			datePublished: null
		};
	}

	// only costs docs currently use internally managed published statuses
	// the costs application from the appellant case works as a standard appellant case doc
	if (
		documentVersion.documentType &&
		documentTypesWithManagedPublishedStatuses.has(documentVersion.documentType) &&
		documentVersion.stage !== APPEAL_CASE_STAGE.APPELLANT_CASE
	) {
		const isPublished = documentVersion.published;
		return {
			publishedDocumentURI: isPublished ? documentVersion.documentURI : null,
			datePublished: isPublished ? mapDate(documentVersion.datePublished) : null
		};
	}

	// all other docs are marked as published by default
	return {
		publishedDocumentURI: documentVersion.documentURI,
		datePublished: mapDate(documentVersion.dateCreated)
	};
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

/**
 *
 * @param {DocumentVersion} doc
 * @returns {string}
 */
const mapDocumentType = (doc) => {
	if (doc.documentType === REP_ATTACHMENT_DOCTYPE) {
		const rep = doc.representation?.representation;
		switch (rep?.representationType) {
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT:
				return APPEAL_DOCUMENT_TYPE.APPELLANT_FINAL_COMMENT;
			case INTERNAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT:
				return APPEAL_DOCUMENT_TYPE.LPA_FINAL_COMMENT;
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT:
				return APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT;
			case INTERNAL_REPRESENTATION_TYPE.LPA_STATEMENT:
				return APPEAL_DOCUMENT_TYPE.LPA_STATEMENT;
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
				return APPEAL_DOCUMENT_TYPE.APPELLANT_PROOF_OF_EVIDENCE;
			case INTERNAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
				return APPEAL_DOCUMENT_TYPE.LPA_PROOF_OF_EVIDENCE;
			case INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT:
				return APPEAL_DOCUMENT_TYPE.RULE_6_STATEMENT;
			case INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE:
				return APPEAL_DOCUMENT_TYPE.RULE_6_PROOF_OF_EVIDENCE;
			case INTERNAL_REPRESENTATION_TYPE.COMMENT:
				return APPEAL_DOCUMENT_TYPE.INTERESTED_PARTY_COMMENT;
			default:
				return APPEAL_DOCUMENT_TYPE.UNCATEGORISED;
		}
	}

	return doc.documentType ?? APPEAL_DOCUMENT_TYPE.UNCATEGORISED;
};

/**
 *
 * @param {DocumentVersion} doc
 * @returns {string}
 */
const mapStage = (doc) => {
	if (doc.documentType === REP_ATTACHMENT_DOCTYPE) {
		const rep = doc.representation?.representation;
		switch (rep?.representationType) {
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT:
			case INTERNAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT:
				return APPEAL_CASE_STAGE.FINAL_COMMENTS;
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT:
			case INTERNAL_REPRESENTATION_TYPE.LPA_STATEMENT:
			case INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT:
				return APPEAL_CASE_STAGE.STATEMENTS;
			case INTERNAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
			case INTERNAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
			case INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE:
				return APPEAL_CASE_STAGE.EVIDENCE;
			default:
				return APPEAL_CASE_STAGE.THIRD_PARTY_COMMENTS;
		}
	}

	return doc.stage ?? APPEAL_CASE_STAGE.INTERNAL;
};
