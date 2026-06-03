import {
	createStoredProcedureTestPrismaClient,
	executeSpSetPersonalList
} from '#tests/stored-procedures/test-database.js';

describe.skip('spSetPersonalList stored procedure', () => {
	const testLpaCode = 'SPT1';
	const invalidOutcomeName = 'Invalid';

	/** @type {import('#db-client/client.js').PrismaClient} */
	let prisma;
	/** @type {number[]} */
	let createdAppealIds = [];
	/** @type {number} */
	let lpaId;
	/** @type {number} */
	let invalidOutcomeId;

	beforeAll(async () => {
		prisma = createStoredProcedureTestPrismaClient();

		const lpa = await prisma.lPA.upsert({
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

		const invalidOutcome = await prisma.appellantCaseValidationOutcome.upsert({
			where: { name: invalidOutcomeName },
			update: {},
			create: { name: invalidOutcomeName }
		});

		lpaId = lpa.id;
		invalidOutcomeId = invalidOutcome.id;
	});

	afterEach(async () => {
		if (!createdAppealIds.length) {
			return;
		}

		const appealIds = [...createdAppealIds];
		createdAppealIds = [];

		await prisma.personalList.deleteMany({
			where: { appealId: { in: appealIds } }
		});
		await prisma.appealRelationship.deleteMany({
			where: {
				OR: [{ parentId: { in: appealIds } }, { childId: { in: appealIds } }]
			}
		});
		await prisma.appealStatus.deleteMany({
			where: { appealId: { in: appealIds } }
		});
		await prisma.appellantCase.deleteMany({
			where: { appealId: { in: appealIds } }
		});
		await prisma.appeal.deleteMany({
			where: { id: { in: appealIds } }
		});
	});

	afterAll(async () => {
		await prisma?.$disconnect();
	});

	/**
	 * @param {{
	 * 	reference: number,
	 * 	caseCreatedDate: Date,
	 * 	status: string,
	 * 	caseExtensionDate?: Date
	 * }} appealData
	 */
	const createAppeal = async ({ reference, caseCreatedDate, status, caseExtensionDate }) => {
		const appeal = await prisma.appeal.create({
			data: {
				reference: String(reference),
				lpaId,
				caseCreatedDate,
				caseUpdatedDate: caseCreatedDate,
				...(caseExtensionDate ? { caseExtensionDate } : {})
			}
		});

		createdAppealIds.push(appeal.id);

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

	test('uses the extension date for invalid ready-to-start appeals', async () => {
		const caseCreatedDate = new Date('2026-04-01T09:00:00.000Z');
		const caseExtensionDate = new Date('2026-04-14T09:00:00.000Z');
		const appeal = await createAppeal({
			reference: 920001,
			caseCreatedDate,
			caseExtensionDate,
			status: 'ready_to_start'
		});

		await prisma.appellantCase.create({
			data: {
				appealId: appeal.id,
				appellantCaseValidationOutcomeId: invalidOutcomeId,
				caseSubmittedDate: caseCreatedDate
			}
		});

		await executeSpSetPersonalList(prisma);

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
		expect(dueDate).toBe(caseExtensionDate.toISOString());
	});

	test('recreates personal list entries for all appeals when called with a null reference', async () => {
		const firstAppeal = await createAppeal({
			reference: 920201,
			caseCreatedDate: new Date('2026-05-01T00:00:00.000Z'),
			status: 'assign_case_officer'
		});
		const secondAppeal = await createAppeal({
			reference: 920202,
			caseCreatedDate: new Date('2026-05-10T00:00:00.000Z'),
			status: 'ready_to_start'
		});

		await executeSpSetPersonalList(prisma);

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

		await executeSpSetPersonalList(prisma);

		entries = await prisma.personalList.findMany({
			where: { appealId: { in: [firstAppeal.id, secondAppeal.id] } },
			orderBy: { appealId: 'asc' }
		});

		expect(entries).toHaveLength(2);
		expect(entries.map((entry) => entry.appealId)).toEqual([firstAppeal.id, secondAppeal.id]);
		expect(entries.map((entry) => entry.dueDate?.toISOString())).toEqual([
			'2026-05-16T00:00:00.000Z',
			'2026-05-15T00:00:00.000Z'
		]);
	});

	test('creates an entry for a standalone appeal when called with that appeal id', async () => {
		const standaloneAppeal = await createAppeal({
			reference: 920250,
			caseCreatedDate: new Date('2026-05-20T00:00:00.000Z'),
			status: 'assign_case_officer'
		});

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
		expect(personalListEntry?.dueDate?.toISOString()).toBe('2026-06-04T00:00:00.000Z');
	});

	test('creates entries for the supplied linked appeal set and not for unrelated appeals', async () => {
		const parentAppeal = await createAppeal({
			reference: 920301,
			caseCreatedDate: new Date('2026-06-01T00:00:00.000Z'),
			status: 'assign_case_officer'
		});
		const childAppeal = await createAppeal({
			reference: 920302,
			caseCreatedDate: new Date('2026-06-03T00:00:00.000Z'),
			status: 'ready_to_start'
		});
		const unaffectedAppeal = await createAppeal({
			reference: 920303,
			caseCreatedDate: new Date('2026-06-05T00:00:00.000Z'),
			status: 'ready_to_start'
		});

		await prisma.appealRelationship.create({
			data: {
				type: 'linked',
				parentRef: parentAppeal.reference,
				childRef: childAppeal.reference,
				parentId: parentAppeal.id,
				childId: childAppeal.id
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
		expect(unaffectedEntry).toBeNull();
	});

	test('updates linked parent and child entries when called with a linked appeal id', async () => {
		const parentCreatedDate = new Date('2026-03-01T00:00:00.000Z');
		const childCreatedDate = new Date('2026-04-01T00:00:00.000Z');
		const parentAppeal = await createAppeal({
			reference: 920101,
			caseCreatedDate: parentCreatedDate,
			status: 'assign_case_officer'
		});
		const childAppeal = await createAppeal({
			reference: 920102,
			caseCreatedDate: childCreatedDate,
			status: 'ready_to_start'
		});

		await prisma.appealRelationship.create({
			data: {
				type: 'linked',
				parentRef: parentAppeal.reference,
				childRef: childAppeal.reference,
				parentId: parentAppeal.id,
				childId: childAppeal.id
			}
		});

		await executeSpSetPersonalList(prisma, { appealId: childAppeal.id });

		const [parentEntry, childEntry] = await Promise.all([
			prisma.personalList.findUnique({ where: { appealId: parentAppeal.id } }),
			prisma.personalList.findUnique({ where: { appealId: childAppeal.id } })
		]);
		const parentDueDate = parentEntry?.dueDate?.toISOString();
		const childDueDate = childEntry?.dueDate?.toISOString();

		expect(parentEntry).not.toBeNull();
		expect(childEntry).not.toBeNull();
		expect(parentEntry).toMatchObject({
			appealId: parentAppeal.id,
			linkType: 'parent',
			leadAppealId: parentAppeal.id
		});
		expect(childEntry).toMatchObject({
			appealId: childAppeal.id,
			linkType: 'child',
			leadAppealId: parentAppeal.id
		});
		expect(parentDueDate).toBe('2026-03-16T00:00:00.000Z');
		expect(childDueDate).toBe(parentDueDate);
		expect(childDueDate).not.toBe('2026-04-06T00:00:00.000Z');
	});
});
