/* This file contains base test data for stored procedures in the appeals API. */

// Appeal Data Test Dates - fixed date values set in both test cases, to use for the tests
export const appealDataDates = {
	createdDate: new Date('2026-04-01T09:00:00.000Z'),
	extensionDate: new Date('2026-05-14T09:00:00.000Z'),
	enforcementGroundFeeDate: new Date('2026-05-01T09:00:00.000Z'),
	lpaQuestionnaireDueDate: new Date('2026-06-01T09:00:00.000Z'),
	lpaStatementsDueDate: new Date('2026-06-07T09:00:00.000Z'),
	ipCommentsDueDate: new Date('2026-06-08T09:00:00.000Z'),
	appellantStatementDueDate: new Date('2026-06-10T09:00:00.000Z'),
	finalCommentsDueDate: new Date('2026-06-11T09:00:00.000Z'),
	hearingStartTime: new Date('2026-06-15T09:00:00.000Z'),
	inquiryStartTime: new Date('2026-06-16T09:00:00.000Z'),
	siteVisitDate: new Date('2026-06-17T09:00:00.000Z'),
	siteVisitEndTime: new Date('2026-06T18:00:00.000Z'),
	proofOfEvidenceAndWitnessesDueDate: new Date('2026-06-19T09:00:00.000Z')
};

export let enforcementAppealData = {
	appeal: {
		reference: 1000000,
		caseCreatedDate: appealDataDates.createdDate,
		caseExtensionDate: appealDataDates.extensionDate,
		status: 'validation',
		appealTypeId: /** @type {number | null} */ (null), // too early to assign here
		procedureTypeId: /** @type {number | null} */ (null), // too early to assign here
		lpaId: /** @type {number | null} */ (null) // too early to assign here
	},
	appellantCase: {
		appellantCaseValidationOutcomeId: /** @type {number | null} */ (null), // too early to assign here
		caseSubmittedDate: appealDataDates.createdDate
	},
	enforcementNoticeAppealOutcome: {
		groundAFeeReceiptDueDate: appealDataDates.enforcementGroundFeeDate
	},
	appealTimetable: {
		lpaStatementDueDate: appealDataDates.lpaStatementsDueDate,
		lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate,
		ipCommentsDueDate: appealDataDates.ipCommentsDueDate,
		appellantStatementDueDate: appealDataDates.appellantStatementDueDate,
		finalCommentsDueDate: appealDataDates.finalCommentsDueDate,
		proofOfEvidenceAndWitnessesDueDate: appealDataDates.proofOfEvidenceAndWitnessesDueDate
	},
	siteVisit: null,
	hearing: null,
	inquiry: null
};
export const planningAppealData = {
	appeal: {
		reference: 1100001,
		caseCreatedDate: appealDataDates.createdDate,
		caseExtensionDate: appealDataDates.extensionDate,
		status: 'validation',
		appealTypeId: /** @type {number | null} */ (null), // too early to assign here
		procedureTypeId: /** @type {number | null} */ (null), // too early to assign here
		lpaId: /** @type {number | null} */ (null) // too early to assign here
	},
	appellantCase: {
		appellantCaseValidationOutcomeId: /** @type {number | null} */ (null), // too early to assign here
		caseSubmittedDate: appealDataDates.createdDate
	},
	enforcementNoticeAppealOutcome: null,
	appealTimetable: {
		lpaStatementDueDate: appealDataDates.lpaStatementsDueDate,
		lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate,
		ipCommentsDueDate: appealDataDates.ipCommentsDueDate,
		appellantStatementDueDate: appealDataDates.appellantStatementDueDate,
		finalCommentsDueDate: appealDataDates.finalCommentsDueDate,
		proofOfEvidenceAndWitnessesDueDate: appealDataDates.proofOfEvidenceAndWitnessesDueDate
	},
	siteVisit: {
		siteVisitDate: appealDataDates.siteVisitDate,
		visitEndTime: appealDataDates.siteVisitEndTime
	},
	hearing: {
		hearingStartTime: appealDataDates.hearingStartTime
	},
	inquiry: {
		inquiryStartTime: appealDataDates.inquiryStartTime
	}
};
