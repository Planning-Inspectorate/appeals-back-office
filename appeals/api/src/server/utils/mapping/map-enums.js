import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_CASE_STAGE,
	APPEAL_CASE_TYPE,
	APPEAL_DEVELOPMENT_TYPE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_INVALID_OR_INCOMPLETE_DETAILS,
	APPEAL_REDACTED_STATUS,
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE,
	APPEAL_SOURCE,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';

/** @typedef {import('@planning-inspectorate/data-model/src/schemas.js').AppealS78Case} AppealS78Case */
/** @typedef {import('@planning-inspectorate/data-model/src/schemas.js').AppealDocument} AppealDocument */
/** @typedef {import('@planning-inspectorate/data-model/src/schemas.js').AppealRepresentation} AppealRepresentation */

/**
 *
 * @param {string} outcome
 * @returns {outcome is AppealS78Case['caseDecisionOutcome']}
 */
export const isValidOutcome = (outcome) =>
	//@ts-ignore
	Object.values(APPEAL_CASE_DECISION_OUTCOME).includes(outcome);

/**
 *
 * @param {string} stage
 * @returns {stage is AppealDocument['caseStage']}
 */
//@ts-ignore
export const isValidStage = (stage) => Object.values(APPEAL_CASE_STAGE).includes(stage);

/**
 *
 * @param {string} documentType
 * @returns {documentType is AppealDocument['documentType']}
 */
export const isValidDocumentType = (documentType) =>
	//@ts-ignore
	Object.values(APPEAL_DOCUMENT_TYPE).includes(documentType);

/**
 *
 * @param {string} virusCheckStatus
 * @returns {virusCheckStatus is AppealDocument['virusCheckStatus']}
 */
export const isValidVirusCheckStatus = (virusCheckStatus) =>
	//@ts-ignore
	Object.values(APPEAL_VIRUS_CHECK_STATUS).includes(virusCheckStatus);

/**
 *
 * @param {string} redactionStatus
 * @returns {redactionStatus is AppealDocument['redactedStatus']}
 */
export const isValidRedactionStatus = (redactionStatus) =>
	//@ts-ignore
	Object.values(APPEAL_REDACTED_STATUS).includes(redactionStatus);

/**
 *
 * @param {string} repStatus
 * @returns {repStatus is AppealRepresentation['representationStatus']}
 */
export const isValidRepStatus = (repStatus) =>
	//@ts-ignore
	Object.values(APPEAL_REPRESENTATION_STATUS).includes(repStatus);

/**
 *
 * @param {string|undefined} repType
 * @returns {repType is AppealRepresentation['representationType']}
 */
export const isValidRepType = (repType) =>
	//@ts-ignore
	Object.values(APPEAL_REPRESENTATION_TYPE).includes(repType);

/**
 *
 * @param {string} source
 * @returns {source is AppealRepresentation['source']}
 */
//@ts-ignore
export const isValidSource = (source) => Object.values(APPEAL_SOURCE).includes(source);

/**
 *
 * @param {string} reason
 * @returns {reason is AppealRepresentation['invalidOrIncompleteDetails']}
 */
export const isValidRejectionReason = (reason) =>
	//@ts-ignore
	Object.values(APPEAL_INVALID_OR_INCOMPLETE_DETAILS).includes(reason);

/**
 *
 * @param {string} appealType
 * @returns {appealType is AppealDocument['caseType']}
 */
export const isValidAppealType = (appealType) =>
	//@ts-ignore
	Object.values(APPEAL_CASE_TYPE).includes(appealType);

/**
 * @param {string | null | undefined} developmentType
 * @returns {developmentType is AppealS78Case['developmentType']}
 */
export const isValidDevelopmentType = (developmentType) => {
	if (!developmentType) return false;
	//@ts-ignore
	return Object.values(APPEAL_DEVELOPMENT_TYPE).includes(developmentType);
};
