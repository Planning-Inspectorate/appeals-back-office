// ---------------------------------------------------------------------------------------
// This script contains utility functions for generating and clearing test data for stored procedures in the appeals API.
// ---------------------------------------------------------------------------------------

/**
 * @typedef {Object} appealParamData
 * @property {number} reference
 * @property {Date} caseCreatedDate
 * @property {string} status
 * @property {Date | null} [caseExtensionDate]
 * @property {number | null} [appealTypeId]
 * @property {number | null} [procedureTypeId]
 * @property {number | null} [lpaId]
 */

/**
 * @typedef {Object} appellantCaseParamData
 * @property {number | null} appellantCaseValidationOutcomeId
 * @property {Date | null} caseSubmittedDate
 */

/**
 * @typedef {Object} enforcementNoticeAppealOutcomeParamData
 * @property {Date | null} groundAFeeReceiptDueDate
 */

/**
 * @typedef {Object} appealTimetableParamData
 * @property {Date | null} lpaStatementDueDate
 * @property {Date | null} lpaQuestionnaireDueDate
 * @property {Date | null} ipCommentsDueDate
 * @property {Date | null} appellantStatementDueDate
 * @property {Date | null} finalCommentsDueDate
 * @property {Date | null} proofOfEvidenceAndWitnessesDueDate
 */

/**
 * @typedef {Object} siteVisitParamData
 * @property {Date | null} visitEndTime
 * @property {Date} siteVisitDate
 */

/**
 * @typedef {Object} hearingParamData
 * @property {Date | null} hearingStartTime
 */

/**
 * @typedef {Object} inquiryParamData
 * @property {Date} inquiryStartTime
 */

/**
 * @typedef {Object} appealAllParamData
 * @property {appealParamData} appeal
 * @property {appellantCaseParamData} appellantCase
 * @property {enforcementNoticeAppealOutcomeParamData | null} enforcementNoticeAppealOutcome
 * @property {appealTimetableParamData | null} appealTimetable
 * @property {siteVisitParamData | null} siteVisit
 * @property {hearingParamData | null} hearing
 * @property {inquiryParamData | null} inquiry
 */

export const stageDueDatesToAdd = {
	STATE_TARGET_READY_TO_START: 5,
	STATE_TARGET_5_BUSINESS_DAYS: 5,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE: 10,
	STATE_TARGET_ASSIGN_CASE_OFFICER: 15,
	STATE_TARGET_ISSUE_DETERMINATION: 30,
	STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT: 40,
	STATE_TARGET_STATEMENT_REVIEW: 55,
	STATE_TARGET_FINAL_COMMENT_REVIEW: 60
};

/**
 * returns a set of case type ids from the Test DB
 * @param {import('#db-client/client.js').PrismaClient} prisma
 */
export const caseTypes = async (prisma) => {
	const planningAppealType = await prisma.appealType.findUnique({
		where: { type: 'Planning appeal' }
	});
	const enforcementNoticeAppealType = await prisma.appealType.findUnique({
		where: { type: 'Enforcement notice appeal' }
	});
	if (!planningAppealType || !enforcementNoticeAppealType) {
		throw new Error('Missing required appeal types in test seed data');
	}

	return {
		S78_APPEAL: planningAppealType.id,
		S78_ENFORCEMENT_NOTICE: enforcementNoticeAppealType.id
	};
};

/**
 * Helper fn to return a set of procedure type ids from the Test DB
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @return {Promise<{WRITTEN_REPRESENTATION: number, HEARING: number, INQUIRY: number, PART_1: number}>}
 */
export const procedureTypes = async (prisma) => {
	const writtenRepresentationProcedureType = await prisma.procedureType.findUnique({
		where: { key: 'written' }
	});
	const hearingProcedureType = await prisma.procedureType.findUnique({
		where: { key: 'hearing' }
	});
	const inquiryProcedureType = await prisma.procedureType.findUnique({
		where: { key: 'inquiry' }
	});
	const part1ProcedureType = await prisma.procedureType.findUnique({
		where: { key: 'writtenPart1' }
	});
	if (
		!writtenRepresentationProcedureType ||
		!hearingProcedureType ||
		!inquiryProcedureType ||
		!part1ProcedureType
	) {
		throw new Error('Missing required procedure types in test seed data');
	}

	return {
		WRITTEN_REPRESENTATION: writtenRepresentationProcedureType.id,
		HEARING: hearingProcedureType.id,
		INQUIRY: inquiryProcedureType.id,
		PART_1: part1ProcedureType.id
	};
};

/**
 * Creates a Test LPA record in the Temp test Stored Procedure database.
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @param {string} testLpaCode
 */
export const addTestLPA = async (prisma, testLpaCode) => {
	return await prisma.lPA.upsert({
		where: { lpaCode: testLpaCode },
		update: {
			name: 'Stored procedure test LPA',
			email: 'stored-procedure-tests@example.com'
		},
		create: {
			lpaCode: testLpaCode,
			name: 'Stored procedure test LPA',
			email: 'stored-procedure-tests@example.com'
		}
	});
};

/**
 * Calculates the expected next business date due date based on the source date and number of business days.
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @param {Date} sourceDateTime
 * @param {number} noBusinessDays
 * @return {Promise<Date>}
 */
export const getExpectedNextBusinessDateDueDate = async (
	prisma,
	sourceDateTime,
	noBusinessDays
) => {
	const currentDate = new Date(
		Date.UTC(
			sourceDateTime.getUTCFullYear(),
			sourceDateTime.getUTCMonth(),
			sourceDateTime.getUTCDate()
		)
	);

	const row = await prisma.nextBusinessDate.findFirst({
		where: {
			currentDate,
			noBusinessDays
		}
	});

	if (!row) {
		throw new Error(
			`No next business date found for currentDate: ${currentDate.toISOString()} and noBusinessDays: ${noBusinessDays}`
		);
	}

	return new Date(
		Date.UTC(
			row.businessDate.getUTCFullYear(),
			row.businessDate.getUTCMonth(),
			row.businessDate.getUTCDate(),
			sourceDateTime.getUTCHours(),
			sourceDateTime.getUTCMinutes(),
			sourceDateTime.getUTCSeconds(),
			sourceDateTime.getUTCMilliseconds()
		)
	);
};

/**
 * Creates a Test appeal and an AppealStatus record
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @param {appealParamData} appealData
 * @returns {Promise<import('#db-client/client.js').Appeal>}
 */
export const createTestAppeal = async (prisma, appealData) => {
	const {
		reference,
		caseCreatedDate,
		status,
		caseExtensionDate,
		appealTypeId,
		procedureTypeId,
		lpaId
	} = appealData;

	const appeal = await prisma.appeal.create({
		data: {
			reference: String(reference),
			lpaId: lpaId ?? 1,
			caseCreatedDate,
			caseUpdatedDate: caseCreatedDate,
			...(caseExtensionDate ? { caseExtensionDate } : {}),
			appealTypeId,
			procedureTypeId
		}
	});

	await prisma.appealStatus.create({
		data: {
			appealId: appeal.id,
			status,
			valid: true,
			createdAt: caseCreatedDate
		}
	});

	return appeal;
};

/**
 * Creates a Test appeal, Appeal Status record, and related data (AppellantCase, EnforcementNoticeAppealOutcome, AppealTimetable, SiteVisit, Hearing, Inquiry) as required
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @param {appealAllParamData} appealData
 * @returns {Promise<import('#db-client/client.js').Appeal>}
 */
export const createTestAppealAndRelatedData = async (prisma, appealData) => {
	const appeal = await createTestAppeal(prisma, appealData.appeal);

	await prisma.appellantCase.create({
		data: {
			appealId: appeal.id,
			appellantCaseValidationOutcomeId: appealData.appellantCase.appellantCaseValidationOutcomeId,
			caseSubmittedDate: appealData.appellantCase.caseSubmittedDate ?? undefined
		}
	});

	if (appealData.enforcementNoticeAppealOutcome) {
		await prisma.enforcementNoticeAppealOutcome.create({
			data: {
				appealId: appeal.id,
				groundAFeeReceiptDueDate:
					appealData.enforcementNoticeAppealOutcome.groundAFeeReceiptDueDate ?? null
			}
		});
	}

	if (appealData.appealTimetable) {
		await prisma.appealTimetable.create({
			data: {
				appealId: appeal.id,
				lpaStatementDueDate: appealData.appealTimetable.lpaStatementDueDate ?? null,
				lpaQuestionnaireDueDate: appealData.appealTimetable.lpaQuestionnaireDueDate ?? null,
				ipCommentsDueDate: appealData.appealTimetable.ipCommentsDueDate ?? null,
				appellantStatementDueDate: appealData.appealTimetable.appellantStatementDueDate ?? null,
				finalCommentsDueDate: appealData.appealTimetable.finalCommentsDueDate ?? null,
				proofOfEvidenceAndWitnessesDueDate:
					appealData.appealTimetable.proofOfEvidenceAndWitnessesDueDate ?? null
			}
		});
	}

	if (appealData.siteVisit) {
		await prisma.siteVisit.create({
			data: {
				appealId: appeal.id,
				visitDate: appealData.siteVisit.siteVisitDate ?? null,
				visitEndTime: appealData.siteVisit.visitEndTime ?? undefined
			}
		});
	}

	if (appealData.hearing) {
		await prisma.hearing.create({
			data: {
				appealId: appeal.id,
				hearingStartTime: appealData.hearing.hearingStartTime ?? null
			}
		});
	}

	if (appealData.inquiry) {
		await prisma.inquiry.create({
			data: {
				appealId: appeal.id,
				inquiryStartTime: appealData.inquiry.inquiryStartTime
			}
		});
	}

	return appeal;
};

/**
 * Deletes test appeals and their related data from the Temp test Stored Procedure database.
 * @param {import('#db-client/client.js').PrismaClient} prisma
 * @param {number[]} appealIds
 * @returns {Promise<void>}
 */
export async function deleteTestAppeals(prisma, appealIds) {
	await prisma.document.deleteMany({
		where: { caseId: { in: appealIds } }
	});

	await prisma.folder.deleteMany({
		where: { caseId: { in: appealIds } }
	});

	await prisma.personalList.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.appealRelationship.deleteMany({
		where: {
			OR: [{ parentId: { in: appealIds } }, { childId: { in: appealIds } }]
		}
	});
	await prisma.enforcementNoticeAppealOutcome.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.appealTimetable.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.appealStatus.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.appellantCase.deleteMany({
		where: { appealId: { in: appealIds } }
	});

	await prisma.hearing.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.inquiry.deleteMany({
		where: { appealId: { in: appealIds } }
	});
	await prisma.siteVisit.deleteMany({
		where: { appealId: { in: appealIds } }
	});

	await prisma.appeal.deleteMany({
		where: { id: { in: appealIds } }
	});
}
