import { add } from 'date-fns';
import { seedStaticData } from '../../seed/data-static.js';
import {
	addTestLPA,
	appealTypes,
	createTestAppeal,
	createTestAppealAndRelatedData,
	deleteTestAppeals,
	getExpectedNextBusinessDateDueDate,
	procedureTypes,
	stageDueDatesToAdd
} from './test-data-utils.js';
import { appealDataDates, enforcementAppealData, planningAppealData } from './test-data.js';
import {
	createStoredProcedureTestPrismaClient,
	executeSpSetPersonalList
} from './test-database.js';

describe('spSetPersonalList stored procedure', () => {
	const testLpaCode = 'SPT1';
	const unixZeroDate = new Date(0);

	/** @type {import('#db-client/client.js').PrismaClient} */
	let prisma;

	/** @type {number} */
	let incompleteOutcomeId;
	/** @type {Awaited<ReturnType<typeof appealTypes>>} */
	let testDBCaseTypes;
	/** @type {Awaited<ReturnType<typeof procedureTypes>>} */
	let testDBProcedureTypes;

	// Array to hold the Ids of the appeals created during the tests, so they can be cleaned up after each test
	/** @type {number[]} */
	let createdAppealIds = [];

	beforeAll(async () => {
		prisma = createStoredProcedureTestPrismaClient();
		// and populate the std reference data
		console.log('Seeding static data in temp DB for stored procedure tests...');
		await seedStaticData(prisma, true);
		console.log('Seeding static data completed.');

		// Patch the base appeal test cases with fields that have to be read from the DB

		// Set up the appeal types for the example appeal data, reading appeal type id from DB
		testDBCaseTypes = await appealTypes(prisma);
		enforcementAppealData.appeal.appealTypeId = testDBCaseTypes.S78_ENFORCEMENT_NOTICE;
		planningAppealData.appeal.appealTypeId = testDBCaseTypes.S78_APPEAL;

		// and set the procedure types
		testDBProcedureTypes = await procedureTypes(prisma);
		enforcementAppealData.appeal.procedureTypeId = testDBProcedureTypes.WRITTEN_REPRESENTATION;
		planningAppealData.appeal.procedureTypeId = testDBProcedureTypes.WRITTEN_REPRESENTATION;

		// and the validationOutComeId for the test appeals
		const incompleteOutcome = await prisma.appellantCaseValidationOutcome.findUnique({
			where: { name: 'Incomplete' }
		});
		if (!incompleteOutcome) {
			throw new Error('Missing Incomplete appellant case validation outcome in test seed data');
		}
		incompleteOutcomeId = incompleteOutcome.id;
		enforcementAppealData.appellantCase.appellantCaseValidationOutcomeId = incompleteOutcomeId;
		planningAppealData.appellantCase.appellantCaseValidationOutcomeId = incompleteOutcomeId;

		const lpa = await addTestLPA(prisma, testLpaCode);
		planningAppealData.appeal.lpaId = lpa.id;
		enforcementAppealData.appeal.lpaId = lpa.id;
	});

	afterEach(async () => {
		if (!createdAppealIds.length) {
			return;
		}

		const appealIds = [...createdAppealIds];

		// delete the test appeals and related data
		await deleteTestAppeals(prisma, appealIds);
		createdAppealIds = [];
	});

	afterAll(async () => {
		await prisma?.$disconnect();
	});

	// -------------------------------------------------------------------------------------------
	// The Tests

	describe('Linked appeals tests', () => {
		test('recreates personal list entries for all appeals when called with a null reference', async () => {
			const createdDate1 = new Date('2026-05-01T10:00:00.000Z');
			const createdDate2 = new Date('2026-05-10T10:00:00.000Z');
			const firstAppeal = await createTestAppeal(prisma, {
				reference: 920201,
				caseCreatedDate: createdDate1,
				status: 'assign_case_officer'
			});
			createdAppealIds.push(firstAppeal.id);

			const secondAppeal = await createTestAppeal(prisma, {
				reference: 920202,
				caseCreatedDate: createdDate2,
				status: 'ready_to_start'
			});
			createdAppealIds.push(secondAppeal.id);

			await executeSpSetPersonalList(prisma); // update all
			let entries = await prisma.personalList.findMany({
				where: { appealId: { in: [firstAppeal.id, secondAppeal.id] } },
				orderBy: { appealId: 'asc' }
			});

			expect(entries).toHaveLength(2);
			expect(entries.map((entry) => entry.appealId)).toEqual([firstAppeal.id, secondAppeal.id]);

			await prisma.personalList.deleteMany({
				where: { appealId: { in: [firstAppeal.id, secondAppeal.id] } }
			});

			expect(
				await prisma.personalList.count({
					where: { appealId: { in: [firstAppeal.id, secondAppeal.id] } }
				})
			).toBe(0);

			await executeSpSetPersonalList(prisma); // update all

			entries = await prisma.personalList.findMany({
				where: { appealId: { in: [firstAppeal.id, secondAppeal.id] } },
				orderBy: { appealId: 'asc' }
			});

			// appeal 2 uses x business to calc ready to start due date
			const expectedDueDate2 = await getExpectedNextBusinessDateDueDate(
				prisma,
				secondAppeal.caseCreatedDate,
				stageDueDatesToAdd.STATE_TARGET_READY_TO_START_NOT_YET_VALID
			);

			expect(entries).toHaveLength(2);
			expect(entries.map((entry) => entry.appealId)).toEqual([firstAppeal.id, secondAppeal.id]);
			expect(entries.map((entry) => entry.dueDate?.toISOString())).toEqual([
				add(createdDate1, {
					days: stageDueDatesToAdd.STATE_TARGET_ASSIGN_CASE_OFFICER
				}).toISOString(),
				expectedDueDate2.toISOString()
			]);
		});

		test('creates an entry for a standalone appeal only, when called with that appeal id', async () => {
			const createdDate1 = new Date('2026-05-20T00:00:00.000Z');
			const standaloneAppeal = await createTestAppeal(prisma, {
				reference: 920203,
				caseCreatedDate: createdDate1,
				status: 'assign_case_officer'
			});
			createdAppealIds.push(standaloneAppeal.id);

			const appeal2 = await createTestAppeal(prisma, {
				reference: 920204,
				caseCreatedDate: createdDate1,
				status: 'assign_case_officer'
			});
			createdAppealIds.push(appeal2.id);

			await executeSpSetPersonalList(prisma, { appealId: standaloneAppeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: standaloneAppeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry).toMatchObject({
				appealId: standaloneAppeal.id,
				linkType: null,
				leadAppealId: null
			});
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				add(createdDate1, {
					days: stageDueDatesToAdd.STATE_TARGET_ASSIGN_CASE_OFFICER
				}).toISOString()
			);

			// would not expect it to add a record for appeal2
			const totRecPS = await prisma.personalList.count();
			expect(totRecPS).toBe(1);

			const personalListEntry2 = await prisma.personalList.findUnique({
				where: { appealId: appeal2.id }
			});
			expect(personalListEntry2).toBeNull();
		});

		test('creates entries for the supplied linked appeal set and not for unlinked or unrelated appeals', async () => {
			const parentCreatedDate = new Date('2026-06-01T00:00:00.000Z');
			const childCreatedDate = new Date('2026-06-03T00:00:00.000Z');
			const parentAppeal = await createTestAppeal(prisma, {
				reference: 920301,
				caseCreatedDate: parentCreatedDate,
				status: 'assign_case_officer'
			});
			createdAppealIds.push(parentAppeal.id);

			const childAppeal = await createTestAppeal(prisma, {
				reference: 920302,
				caseCreatedDate: childCreatedDate,
				status: 'ready_to_start'
			});
			createdAppealIds.push(childAppeal.id);

			const unaffectedAppeal = await createTestAppeal(prisma, {
				reference: 920303,
				caseCreatedDate: new Date('2026-06-05T00:00:00.000Z'),
				status: 'ready_to_start'
			});
			createdAppealIds.push(unaffectedAppeal.id);

			const relatedAppeal = await createTestAppeal(prisma, {
				reference: 920304,
				caseCreatedDate: new Date('2026-07-01T10:00:00.000Z'),
				status: 'ready_to_start'
			});
			createdAppealIds.push(relatedAppeal.id);

			// make the linked relationship between parent and child appeals
			await prisma.appealRelationship.create({
				data: {
					type: 'linked',
					parentRef: parentAppeal.reference,
					childRef: childAppeal.reference,
					parentId: parentAppeal.id,
					childId: childAppeal.id
				}
			});

			// make a "related" (not linked) relationship
			await prisma.appealRelationship.create({
				data: {
					type: 'related',
					parentRef: unaffectedAppeal.reference,
					childRef: relatedAppeal.reference,
					parentId: unaffectedAppeal.id,
					childId: relatedAppeal.id
				}
			});

			await executeSpSetPersonalList(prisma, { appealId: childAppeal.id });

			const [parentEntry, childEntry, unaffectedEntry] = await Promise.all([
				prisma.personalList.findUnique({ where: { appealId: parentAppeal.id } }),
				prisma.personalList.findUnique({ where: { appealId: childAppeal.id } }),
				prisma.personalList.findUnique({ where: { appealId: unaffectedAppeal.id } })
			]);

			expect(parentEntry).not.toBeNull();
			expect(parentEntry).toMatchObject({
				appealId: parentAppeal.id,
				linkType: 'parent',
				leadAppealId: parentAppeal.id
			});
			expect(childEntry).not.toBeNull();
			expect(childEntry).toMatchObject({
				appealId: childAppeal.id,
				linkType: 'child',
				leadAppealId: parentAppeal.id
			});

			// now check that the child has the same Due date as the parent
			const parentDueDate = parentEntry?.dueDate?.toISOString();
			expect(parentDueDate).toBe(
				add(parentCreatedDate, {
					days: stageDueDatesToAdd.STATE_TARGET_ASSIGN_CASE_OFFICER
				}).toISOString()
			);
			expect(childEntry?.dueDate?.toISOString()).toBe(parentDueDate);

			// check that the unaffected appeal does not have a personal list entry created
			expect(unaffectedEntry).toBeNull();

			// Now test that "Related" appeals dont cascade
			// we will call the sp for unaffectedAppeal and check that the related appeal does not get a personal list entry created
			await executeSpSetPersonalList(prisma, { appealId: unaffectedAppeal.id });
			// check that the related appeal does not have a personal list entry created
			const [unaffectedEntryAfterCall, relatedEntryAfterCall] = await Promise.all([
				prisma.personalList.findUnique({ where: { appealId: unaffectedAppeal.id } }),
				prisma.personalList.findUnique({ where: { appealId: relatedAppeal.id } })
			]);
			expect(unaffectedEntryAfterCall).not.toBeNull();
			expect(relatedEntryAfterCall).toBeNull();
		});
	});

	describe('Ready to start', () => {
		test('if case has a valid date for ready-to-start appeals', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1000001,
					caseExtensionDate: null,
					caseValidDate: appealDataDates.validDate,
					status: 'ready_to_start'
				},
				appellantCase: {
					...planningAppealData.appellantCase,
					appellantCaseValidationOutcomeId: incompleteOutcomeId
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const dueDate = personalListEntry?.dueDate?.toISOString();

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry).toMatchObject({
				appealId: appeal.id,
				linkType: null,
				leadAppealId: null
			});

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseValidDate,
				stageDueDatesToAdd.STATE_TARGET_READY_TO_START
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});

		test(`with no case valid date it uses the case created date +${stageDueDatesToAdd.STATE_TARGET_READY_TO_START_NOT_YET_VALID} business days`, async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1000002,
					caseExtensionDate: null,
					caseValidDate: null,
					status: 'ready_to_start'
				},
				appellantCase: {
					...planningAppealData.appellantCase,
					appellantCaseValidationOutcomeId: incompleteOutcomeId
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();

			const dueDate = personalListEntry?.dueDate?.toISOString();
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseCreatedDate,
				stageDueDatesToAdd.STATE_TARGET_READY_TO_START_NOT_YET_VALID
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Validation', () => {
		const enfAppealExtensionDate = new Date('2026-05-14T09:00:00.000Z');
		const enfAppealGroundFeeDate = new Date('2026-05-01T09:00:00.000Z');

		test('enforcement appeal with a ground a fee receipt due date earlier', async () => {
			const appealData = {
				...enforcementAppealData,
				appeal: {
					...enforcementAppealData.appeal,
					reference: 1100001,
					caseExtensionDate: enfAppealExtensionDate
				},
				enforcementNoticeAppealOutcome: {
					...enforcementAppealData.enforcementNoticeAppealOutcome,
					groundAFeeReceiptDueDate: enfAppealGroundFeeDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			const dueDate = personalListEntry?.dueDate?.toISOString();

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry).toMatchObject({
				appealId: appeal.id,
				linkType: null,
				leadAppealId: null
			});
			expect(dueDate).toBe(enfAppealGroundFeeDate.toISOString());
		});

		test('enforcement appeal with a ground a fee receipt due date later', async () => {
			const appealData = {
				...enforcementAppealData,
				appeal: {
					...enforcementAppealData.appeal,
					reference: 1100002,
					caseExtensionDate: enfAppealExtensionDate
				},
				enforcementNoticeAppealOutcome: {
					...enforcementAppealData.enforcementNoticeAppealOutcome,
					groundAFeeReceiptDueDate: new Date('2026-06-01T09:00:00.000Z')
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			const dueDate = personalListEntry?.dueDate?.toISOString();

			expect(personalListEntry).not.toBeNull();
			expect(dueDate).toBe(enfAppealExtensionDate.toISOString());
		});

		test('non-enforcement appeal with extension date sets that', async () => {
			let appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1100003,
					caseExtensionDate: appealDataDates.extensionDate
				},
				enforcementNoticeAppealOutcome: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const dueDate = personalListEntry?.dueDate?.toISOString();

			expect(personalListEntry).not.toBeNull();
			expect(dueDate).toBe(enfAppealExtensionDate.toISOString());
		});

		test('non-enforcement appeal with no extension date sets start date', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1100004,
					caseExtensionDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const dueDate = personalListEntry?.dueDate?.toISOString();

			expect(personalListEntry).not.toBeNull();
			expect(dueDate).toBe(appealDataDates.createdDate.toISOString());
		});
	});

	describe('Lpa questionnaire', () => {
		test('uses lpaQuestionnaireDueDate when it is present', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1200001,
					status: 'lpa_questionnaire'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.lpaQuestionnaireDueDate.toISOString()
			);
		});

		test('uses caseStartedDate + state target when lpaQuestionnaireDueDate is missing - New Regs', async () => {
			// Full 78 Planning is under New Regs
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1200002,
					status: 'lpa_questionnaire',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_LPA_QUESTIONNAIRE_DUE_NEW_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});

		test('uses caseCreatedDate + state target when lpaQuestionnaireDueDate is missing - Old Regs', async () => {
			// Enforcement is under Old Regs
			const appealData = {
				...enforcementAppealData,
				appeal: {
					...enforcementAppealData.appeal,
					reference: 1200003,
					status: 'lpa_questionnaire',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...enforcementAppealData.appealTimetable,
					lpaQuestionnaireDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_LPA_QUESTIONNAIRE_DUE_OLD_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Statements', () => {
		test('uses lpaStatementDueDate when both lpa and ip are set and lpa is earlier', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1300001,
					status: 'statements'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaStatementDueDate: appealDataDates.lpaStatementDueDate,
					ipCommentsDueDate: add(appealDataDates.lpaStatementDueDate, { days: 1 }), // lpa statement due date now less than ip comments due date
					appellantStatementDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.lpaStatementDueDate.toISOString()
			);
		});

		test('uses ipCommentsDueDate when both lpa and ip are set and lpa is later', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1300002,
					status: 'statements'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaStatementDueDate: add(appealDataDates.ipCommentsDueDate, { days: 1 }), // lpa statement due date now greater than ip comments due date
					ipCommentsDueDate: appealDataDates.ipCommentsDueDate,
					appellantStatementDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.ipCommentsDueDate.toISOString()
			);
		});

		test('uses lpaStatementDueDate when only lpa statement due date is set', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1300003,
					status: 'statements'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaStatementDueDate: appealDataDates.lpaStatementDueDate,
					ipCommentsDueDate: null,
					appellantStatementDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.lpaStatementDueDate.toISOString()
			);
		});

		test('uses ipCommentsDueDate when only ip comments due date is set', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1300004,
					status: 'statements'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaStatementDueDate: null,
					ipCommentsDueDate: appealDataDates.ipCommentsDueDate,
					appellantStatementDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.ipCommentsDueDate.toISOString()
			);
		});

		test('uses case start date + 30 business days when no due dates are set - Old Regs', async () => {
			const appealData = {
				...enforcementAppealData,
				appeal: {
					...enforcementAppealData.appeal,
					reference: 1300005,
					status: 'statements',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...enforcementAppealData.appealTimetable,
					lpaStatementDueDate: null,
					ipCommentsDueDate: null,
					appellantStatementDueDate: appealDataDates.appellantStatementDueDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_STATEMENT_OLD_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});

		test('uses case start date + 25 business days when no due dates are set - New Regs', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1300006,
					status: 'statements',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaStatementDueDate: null,
					ipCommentsDueDate: null,
					appellantStatementDueDate: appealDataDates.appellantStatementDueDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_STATEMENT_NEW_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Final comments', () => {
		test('uses finalCommentsDueDate when it is present', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1400001,
					status: 'final_comments'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					finalCommentsDueDate: appealDataDates.finalCommentsDueDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.finalCommentsDueDate.toISOString()
			);
		});

		test('uses caseStartedDate + 45 business days when finalCommentsDueDate is missing - Old Regs', async () => {
			const appealData = {
				...enforcementAppealData,
				appeal: {
					...enforcementAppealData.appeal,
					reference: 1400002,
					status: 'final_comments',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...enforcementAppealData.appealTimetable,
					finalCommentsDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_FINAL_COMMENT_OLD_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});

		test('uses caseStartedDate + 35 business days when finalCommentsDueDate is missing - New Regs', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1400003,
					status: 'final_comments',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					finalCommentsDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_FINAL_COMMENT_NEW_REGS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Event', () => {
		test('uses proofOfEvidenceAndWitnessesDueDate if it is present', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1500001,
					status: 'event'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate,
					finalCommentsDueDate: appealDataDates.finalCommentsDueDate,
					proofOfEvidenceAndWitnessesDueDate: appealDataDates.proofOfEvidenceAndWitnessesDueDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.proofOfEvidenceAndWitnessesDueDate.toISOString()
			);
		});

		test('uses finalCommentsDueDate if it is present and proofOfEvidenceAndWitnessesDueDate is missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1500002,
					status: 'event'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate,
					finalCommentsDueDate: appealDataDates.finalCommentsDueDate,
					proofOfEvidenceAndWitnessesDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.finalCommentsDueDate.toISOString()
			);
		});

		test('uses lpaStatementDueDate if it is present and proofOfEvidenceAndWitnessesDueDate and finalCommentsDueDate are missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1500003,
					status: 'event'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: null,
					lpaStatementDueDate: appealDataDates.lpaStatementDueDate,
					finalCommentsDueDate: null,
					proofOfEvidenceAndWitnessesDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.lpaStatementDueDate.toISOString()
			);
		});

		test('uses lpaQuestionnaireDueDate if it is present and proofOfEvidenceAndWitnessesDueDate, finalCommentsDueDate and lpaStatementDueDate are missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1500004,
					status: 'event'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: appealDataDates.lpaQuestionnaireDueDate,
					lpaStatementDueDate: null,
					finalCommentsDueDate: null,
					proofOfEvidenceAndWitnessesDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.lpaQuestionnaireDueDate.toISOString()
			);
		});

		test('uses uses caseStartedDate + 45 business days when due date fields are missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1500005,
					status: 'event',
					caseStartedDate: appealDataDates.startedDate
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					lpaQuestionnaireDueDate: null,
					lpaStatementDueDate: null,
					finalCommentsDueDate: null,
					proofOfEvidenceAndWitnessesDueDate: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			expect(personalListEntry).not.toBeNull();
			const dueDate = personalListEntry?.dueDate?.toISOString();

			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseStartedDate,
				stageDueDatesToAdd.STATE_TARGET_45_BUSINESS_DAYS
			);
			expect(dueDate).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Awaiting event', () => {
		test('uses hearingStartTime when procedure type is hearing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1600001,
					status: 'awaiting_event',
					procedureTypeId: testDBProcedureTypes.HEARING
				},
				hearing: {
					hearingStartTime: appealDataDates.hearingStartTime
				},
				inquiry: null,
				siteVisit: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.hearingStartTime.toISOString()
			);
		});

		test('uses unix epoch when procedure type is hearing but hearingStartTime is missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1600002,
					status: 'awaiting_event',
					procedureTypeId: testDBProcedureTypes.HEARING
				},
				hearing: {
					hearingStartTime: null
				},
				inquiry: null,
				siteVisit: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(unixZeroDate.toISOString());
		});

		test('uses inquiryStartTime + estimatedDays when procedure type is inquiry', async () => {
			const estimatedDays = 2;
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1600003,
					status: 'awaiting_event',
					procedureTypeId: testDBProcedureTypes.INQUIRY
				},
				hearing: null,
				inquiry: {
					inquiryStartTime: appealDataDates.inquiryStartTime
				},
				siteVisit: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await prisma.inquiry.update({
				where: { appealId: appeal.id },
				data: { estimatedDays }
			});

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				add(appealDataDates.inquiryStartTime, { days: estimatedDays }).toISOString()
			);
		});

		test('uses visitDate when procedure type is neither hearing nor inquiry', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1600004,
					status: 'awaiting_event',
					procedureTypeId: testDBProcedureTypes.WRITTEN_REPRESENTATION
				},
				hearing: null,
				inquiry: null,
				siteVisit: {
					visitDate: appealDataDates.visitDate,
					visitEndTime: appealDataDates.visitDate
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(
				appealDataDates.visitDate.toISOString()
			);
		});
	});

	describe('Issue determination', () => {
		test('uses site visitEndTime + 40 business days when both site visit date and end time are present', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700001,
					status: 'issue_determination'
				},
				siteVisit: {
					visitDate: appealDataDates.visitDate,
					visitEndTime: appealDataDates.visitEndTime
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealDataDates.visitEndTime,
				stageDueDatesToAdd.STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});

		test('uses visitDate + 40 business days when site visit end time is missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700002,
					status: 'issue_determination'
				},
				siteVisit: {
					visitDate: appealDataDates.visitDate,
					visitEndTime: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealDataDates.visitDate,
				stageDueDatesToAdd.STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});

		test('uses unix epoch when there is a site visit record but dates are missing', async () => {
			/** @type {Parameters<typeof createTestAppealAndRelatedData>[1]} */
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700003,
					status: 'issue_determination'
				},
				siteVisit: {
					visitDate: null,
					visitEndTime: null
				}
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(unixZeroDate.toISOString());
		});

		test('uses caseCreatedDate + 30 business days when no site visit date exists', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700004,
					status: 'issue_determination',
					caseCreatedDate: appealDataDates.createdDate
				},
				siteVisit: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealDataDates.createdDate,
				stageDueDatesToAdd.STATE_TARGET_ISSUE_DETERMINATION
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Complete', () => {
		/** @param {number} appealId
		 * @param {string} path
		 * @param {string} name */
		const createCostsDocument = async (appealId, path, name) => {
			const folder = await prisma.folder.create({
				data: {
					caseId: appealId,
					path
				}
			});

			await prisma.document.create({
				data: {
					caseId: appealId,
					folderId: folder.id,
					name,
					isDeleted: false
				}
			});

			return folder;
		};

		test('uses the 5 business day NextBusinessDate when costs documents require a decision', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700004,
					status: 'complete',
					caseCreatedDate: appealDataDates.createdDate
				},
				appellantCase: {
					...planningAppealData.appellantCase
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			// Keep this case out of the GETDATE branch so we only assert the costs decision path.
			await prisma.appellantCase.update({
				where: { appealId: appeal.id },
				data: { numberOfResidencesNetChange: 1 }
			});

			await createCostsDocument(
				appeal.id,
				'costs/appellantCostsApplication',
				'appellant-costs-application.pdf'
			);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealDataDates.createdDate,
				stageDueDatesToAdd.STATE_TARGET_5_BUSINESS_DAYS
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});

		test('does not set a 5 business day due date when application and withdrawal are balanced and a decision letter exists', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700005,
					status: 'complete'
				},
				appellantCase: {
					...planningAppealData.appellantCase
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			// Force non-null so this test cannot fall through to the GETDATE branch.
			await prisma.appellantCase.update({
				where: { appealId: appeal.id },
				data: { numberOfResidencesNetChange: 1 }
			});

			await createCostsDocument(
				appeal.id,
				'costs/appellantCostsApplication',
				'appellant-costs-application-balanced.pdf'
			);
			await createCostsDocument(
				appeal.id,
				'costs/appellantCostsWithdrawal',
				'appellant-costs-withdrawal-balanced.pdf'
			);
			await createCostsDocument(
				appeal.id,
				'costs/appellantCostsDecisionLetter',
				'appellant-costs-decision-letter.pdf'
			);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate).toBeNull();
		});

		test('uses current date when complete, planning appeal, not child, and numberOfResidencesNetChange is null', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700006,
					status: 'complete'
				},
				appellantCase: {
					...planningAppealData.appellantCase
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			// No costs docs and default null numberOfResidencesNetChange should hit GETDATE() branch.
			const beforeRun = new Date();
			await executeSpSetPersonalList(prisma, { appealId: appeal.id });
			const afterRun = new Date();

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate).not.toBeNull();
			if (!personalListEntry?.dueDate) {
				throw new Error('Expected personal list dueDate to be set');
			}
			expect(personalListEntry.dueDate.getTime()).toBeGreaterThanOrEqual(
				beforeRun.getTime() - 2000
			);
			expect(personalListEntry.dueDate.getTime()).toBeLessThanOrEqual(afterRun.getTime() + 2000);
		});
	});

	describe('Evidence', () => {
		test('uses proofOfEvidenceAndWitnessesDueDate when it is present', async () => {
			const proofDueDate = new Date('2026-07-02T09:30:00.000Z');
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700007,
					status: 'evidence'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					proofOfEvidenceAndWitnessesDueDate: proofDueDate
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(proofDueDate.toISOString());
		});

		test('sets dueDate to null when proofOfEvidenceAndWitnessesDueDate is missing', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700008,
					status: 'evidence'
				},
				appealTimetable: {
					...planningAppealData.appealTimetable,
					proofOfEvidenceAndWitnessesDueDate: null
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate).toBeNull();
		});
	});

	describe('Awaiting transfer', () => {
		test('uses statusCreatedAt + 5 business days from NextBusinessDate', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700009,
					status: 'awaiting_transfer',
					caseCreatedDate: appealDataDates.createdDate
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealDataDates.createdDate,
				stageDueDatesToAdd.STATE_TARGET_5_BUSINESS_DAYS
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});
	});

	describe('Withdrawn', () => {
		/** @param {number} appealId
		 * @param {string} path
		 * @param {string} name */
		const createCostsDocument = async (appealId, path, name) => {
			const folder = await prisma.folder.create({
				data: {
					caseId: appealId,
					path
				}
			});

			await prisma.document.create({
				data: {
					caseId: appealId,
					folderId: folder.id,
					name,
					isDeleted: false
				}
			});

			return folder;
		};

		test('uses statusCreatedAt + 5 business days when withdrawn and awaiting costs decision', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700010,
					status: 'withdrawn',
					caseCreatedDate: appealDataDates.createdDate
				},
				appellantCase: {
					...planningAppealData.appellantCase,
					numberOfResidencesNetChange: 1
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await createCostsDocument(
				appeal.id,
				'costs/appellantCostsApplication',
				'withdrawn-appellant-costs-application.pdf'
			);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});
			const expectedDueDate = await getExpectedNextBusinessDateDueDate(
				prisma,
				appealData.appeal.caseCreatedDate,
				stageDueDatesToAdd.STATE_TARGET_5_BUSINESS_DAYS
			);

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate?.toISOString()).toBe(expectedDueDate.toISOString());
		});

		test('sets dueDate to null when withdrawn and no costs decisions are awaited', async () => {
			const appealData = {
				...planningAppealData,
				appeal: {
					...planningAppealData.appeal,
					reference: 1700011,
					status: 'withdrawn'
				},
				siteVisit: null,
				hearing: null,
				inquiry: null
			};

			const appeal = await createTestAppealAndRelatedData(prisma, appealData);
			createdAppealIds.push(appeal.id);

			await executeSpSetPersonalList(prisma, { appealId: appeal.id });

			const personalListEntry = await prisma.personalList.findUnique({
				where: { appealId: appeal.id }
			});

			expect(personalListEntry).not.toBeNull();
			expect(personalListEntry?.dueDate).toBeNull();
		});
	});
});
