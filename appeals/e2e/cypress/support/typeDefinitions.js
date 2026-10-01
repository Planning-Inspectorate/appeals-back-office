/**
 * This file contains type definitions for the Back Office Appeals Cypress tests.
 * These type definitions provide a way to define custom types and interfaces that can be used throughout the test suite.
 * They help improve code readability, maintainability, and provide better autocompletion and type checking in the IDE.
 *
 * Note: This file is not meant to be executed directly. It is used for type checking and documentation purposes only.
 */

/**
 * Config object for uploading a representation document.
 * @typedef {Object} RepresentationUploadOptions
 * @property {string} fileName - The name of the file to upload. e.g. "sample.pdf"
 * @property {Date} fileDate - The date to use for the "Date received" field. e.g. new Date()
 * @property {string} redactionStatus - The redaction status to select. e.g. "redacted" or "notRedacted"
 * @property {string} cyaHeading - The heading to check for on the Check Your Answers page. e.g. "Check your answers"
 * @property {string} cyaCTAText - The text of the CTA button to click on the Check Your Answers page. e.g. "Confirm"
 * @property {string} cyaFileNameField - The field name to check for the file name on the Check Your Answers page. e.g. "file"
 */

/**
 * @typedef {(
 *  'ASSIGN_CASE_OFFICER' |
 *  'VALIDATION' |
 *  'READY_TO_START' |
 *  'LPA_QUESTIONNAIRE' |
 *  'STATEMENTS' |
 *  'FINAL_COMMENTS' |
 *  'EVIDENCE' |
 *  'EVENT_READY_TO_SETUP' |
 *  'AWAITING_EVENT' |
 *  'ISSUE_DECISION' |
 *  'COMPLETE'
 * )} Status
 */

/**
 * @typedef {(
 *  'HAS' |
 *  'S78' |
 *  'S20' |
 *  'EN' |
 *  'CAS_PLANNING' |
 *  'CAS_ADVERT' |
 *  'ADVERT'
 * )} AppealType
 */

/**
 * @typedef {(
 *  'WRITTEN' |
 *  'HEARING' |
 *  'INQUIRY'
 * )} ProcedureType
 */

export {};
