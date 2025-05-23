import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_CASE_TYPE,
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_REDACTED_STATUS,
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE,
	APPEAL_INVALID_OR_INCOMPLETE_DETAILS,
	APPEAL_SOURCE,
	APPEAL_VIRUS_CHECK_STATUS,
	APPEAL_DEVELOPMENT_TYPE
} from 'pins-data-model';

/** @typedef {import('pins-data-model/src/schemas.js').AppealS78Case} AppealS78Case */
/** @typedef {import('pins-data-model/src/schemas.js').AppealDocument} AppealDocument */
/** @typedef {import('pins-data-model/src/schemas.js').AppealRepresentation} AppealRepresentation */

/**
 *
 * @param {string} outcome
 * @returns {outcome is AppealS78Case['caseDecisionOutcome']}
 */
export const isValidOutcome = (outcome) =>
	Object.values(APPEAL_CASE_DECISION_OUTCOME).includes(outcome);

/**
 *
 * @param {string} stage
 * @returns {stage is AppealDocument['caseStage']}
 */
export const isValidStage = (stage) => Object.values(APPEAL_CASE_STAGE).includes(stage);

/**
 *
 * @param {string} documentType
 * @returns {documentType is AppealDocument['documentType']}
 */
export const isValidDocumentType = (documentType) =>
	Object.values(APPEAL_DOCUMENT_TYPE).includes(documentType);

/**
 *
 * @param {string} virusCheckStatus
 * @returns {virusCheckStatus is AppealDocument['virusCheckStatus']}
 */
export const isValidVirusCheckStatus = (virusCheckStatus) =>
	Object.values(APPEAL_VIRUS_CHECK_STATUS).includes(virusCheckStatus);

/**
 *
 * @param {string} redactionStatus
 * @returns {redactionStatus is AppealDocument['redactedStatus']}
 */
export const isValidRedactionStatus = (redactionStatus) =>
	Object.values(APPEAL_REDACTED_STATUS).includes(redactionStatus);

/**
 *
 * @param {string} repStatus
 * @returns {repStatus is AppealRepresentation['representationStatus']}
 */
export const isValidRepStatus = (repStatus) =>
	Object.values(APPEAL_REPRESENTATION_STATUS).includes(repStatus);

/**
 *
 * @param {string} repType
 * @returns {repType is AppealRepresentation['representationType']}
 */
export const isValidRepType = (repType) =>
	Object.values(APPEAL_REPRESENTATION_TYPE).includes(repType);

/**
 *
 * @param {string} source
 * @returns {source is AppealRepresentation['source']}
 */
export const isValidSource = (source) => Object.values(APPEAL_SOURCE).includes(source);

/**
 *
 * @param {string} reason
 * @returns {reason is AppealRepresentation['invalidOrIncompleteDetails']}
 */
export const isValidRejectionReason = (reason) =>
	Object.values(APPEAL_INVALID_OR_INCOMPLETE_DETAILS).includes(reason);

/**
 *
 * @param {string} appealType
 * @returns {appealType is AppealDocument['caseType']}
 */
export const isValidAppealType = (appealType) =>
	Object.values(APPEAL_CASE_TYPE).includes(appealType);

/**
 * @param {string | null | undefined} developmentType
 * @returns {developmentType is AppealS78Case['developmentType']}
 */
export const isValidDevelopmentType = (developmentType) => {
	if (!developmentType) return false;
	return Object.values(APPEAL_DEVELOPMENT_TYPE).includes(developmentType);
};
