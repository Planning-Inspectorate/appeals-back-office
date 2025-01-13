import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_REDACTED_STATUS,
	APPEAL_VIRUS_CHECK_STATUS
} from 'pins-data-model';

/**
 *
 * @param {string} outcome
 * @returns {outcome is
 * 	'allowed'|'dismissed'|'invalid'|'split_decision'
 * }
 */
export const isValidOutcome = (outcome) =>
	Object.values(APPEAL_CASE_DECISION_OUTCOME).includes(outcome);

/**
 *
 * @param {string} stage
 * @returns {stage is
 * 	'appeal-decision'|'appellant-case'|'costs'|'evidence'|'final-comments'|'internal'|'lpa-questionnaire'|
 * 	'statements'|'third-party-comments'|'witnesses'
 * }
 */
export const isValidStage = (stage) => Object.values(APPEAL_CASE_STAGE).includes(stage);

/**
 *
 * @param {string} documentType
 * @returns {documentType is
 * 	'appellantCaseCorrespondence'|'appellantCaseWithdrawalLetter'|'appellantCostsApplication'|
 *		'appellantStatement'|'applicationDecisionLetter'|'caseDecisionLetter'|
 *		'changedDescription'|'communityInfrastructureLevy'|'conservationMap'|'consultationResponses'|'costsDecisionLetter'|
 *		'crossTeamCorrespondence'|'definitiveMapStatement'|'designAccessStatement'|'developmentPlanPolicies'|'eiaEnvironmentalStatement'|
 *		'eiaScreeningDirection'|'eiaScreeningOpinion'|'emergingPlan'|'inspectorCorrespondence'|'lpaCaseCorrespondence'|
 *		'lpaCostsApplication'|'lpaCostsCorrespondence'|'lpaCostsWithdrawal'|'newPlansDrawings'|'originalApplicationForm'|
 *		'otherNewDocuments'|'otherPartyRepresentations'|'otherRelevantPolicies'|'ownershipCertificate'|'planningObligation'|
 *		'planningOfficerReport'|'plansDrawings'|'statementCommonGround'|'supplementaryPlanning'|'treePreservationPlan'| 'uncategorised'|
 *		'whoNotified'|'whoNotifiedLetterToNeighbours'|'whoNotifiedPressAdvert'|'whoNotifiedSiteNotice'}
 */
// TODO: APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT needs to be added to "pins-data-model"
export const isValidDocumentType = (documentType) =>
	Object.values({
		...APPEAL_DOCUMENT_TYPE,
		ENVIRONMENTAL_ASSESSMENT: 'environmentalAssessment'
	}).includes(documentType);
// export const isValidDocumentType = (documentType) =>
// 	Object.values(APPEAL_DOCUMENT_TYPE).includes(documentType);

/**
 *
 * @param {string} virusCheckStatus
 * @returns {virusCheckStatus is 'affected'|'not_scanned'|'scanned'}
 */
export const isValidVirusCheckStatus = (virusCheckStatus) =>
	Object.values(APPEAL_VIRUS_CHECK_STATUS).includes(virusCheckStatus);

/**
 *
 * @param {string} redactionStatus
 * @returns {redactionStatus is 'no_redaction_required'|'not_redacted'|'redacted'}
 */
export const isValidRedactionStatus = (redactionStatus) =>
	Object.values(APPEAL_REDACTED_STATUS).includes(redactionStatus);
