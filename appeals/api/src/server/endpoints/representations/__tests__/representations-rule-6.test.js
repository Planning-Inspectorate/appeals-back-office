// @ts-nocheck
import { fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';

let request;
let databaseConnector;

describe('Rule 6 Representations', () => {
	beforeAll(async () => {
		jest.unstable_mockModule('@pins/appeals/utils/business-days.js', () => ({
			addDays: jest.fn().mockReturnValue(new Date('2025-03-10T00:00:00Z')),
			calculateTimetable: jest.fn(),
			recalculateDateIfNotBusinessDay: jest.fn(),
			setTimeInTimeZone: jest.fn(),
			fetchBankHolidaysForDivision: jest.fn(),
			getNumberOfBankHolidaysBetweenDates: jest.fn()
		}));

		const appTest = await import('#server/app-test.js');
		request = appTest.request;
		const db = await import('#utils/database-connector.js');
		databaseConnector = db.databaseConnector;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /appeals/:id/reps/rule_6_party_statement', () => {
		test('201 when rule_6_party_statement representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);
			databaseConnector.representation.findUnique.mockResolvedValue({
				id: 1,
				representationType: 'rule_6_party_statement',
				status: 'valid',
				represented: {
					organisationName: 'Rule 6 party'
				}
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					source: 'citizen',
					representedId: 1
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						details: `Rule 6 party statement added`,
						appealId: 1
					})
				})
			);
		});

		test('201 when rule_6_party_proofs_evidence representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...fullPlanningAppeal,
				appealRule6Parties: [
					{
						serviceUser: {
							email: 'test@test.com'
						}
					}
				]
			});
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);
			databaseConnector.representation.findUnique.mockResolvedValue({
				id: 1,
				representationType: 'rule_6_party_statement',
				status: 'valid',
				represented: {
					organisationName: 'Rule 6 party'
				}
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_proofs_evidence')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					source: 'citizen',
					representedId: 1
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						details: `Rule 6 party proof of evidence and witnesses added`,
						appealId: 1
					})
				})
			);
		});
	});

	describe('PATCH /appeals/:id/reps/:repId (Rule 6)', () => {
		test('should create audit trail "statement accepted" when Rule 6 status updated to valid', async () => {
			const appealWithRule6 = {
				...householdAppeal,
				id: 1,
				appealRule6Parties: [
					{
						id: 1,
						serviceUserId: 50,
						serviceUser: {
							id: 50,
							organisationName: 'Rule 6 party',
							email: 'rule6party@example.com'
						}
					}
				]
			};

			const mockRule6Rep = {
				id: 1,
				appealId: 1,
				representationType: 'rule_6_party_statement',
				status: 'awaiting_review',
				dateCreated: new Date(),
				represented: {
					organisationName: 'Rule 6 party',
					id: 50
				}
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithRule6);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRule6Rep);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRule6Rep,
				status: 'valid'
			});
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			databaseConnector.auditTrail.findFirst.mockResolvedValue(null);
			databaseConnector.auditTrail.create.mockResolvedValue({});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({ status: 'valid' })
				.set('azureAdUserId', 'user-id');

			expect(response.status).toEqual(200);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						details: `Rule 6 party statement accepted`,
						appealId: 1
					})
				})
			);
		});

		test('should create audit trail "proof of evidence and witnesses accepted" when Rule 6 status updated to valid', async () => {
			const appealWithRule6 = {
				...householdAppeal,
				id: 1,
				appealRule6Parties: [
					{
						id: 1,
						serviceUserId: 50,
						serviceUser: {
							id: 50,
							organisationName: 'Rule 6 party',
							email: 'rule6party@example.com'
						}
					}
				]
			};

			const mockRule6Rep = {
				id: 1,
				appealId: 1,
				representationType: 'rule_6_party_proofs_evidence',
				status: 'awaiting_review',
				dateCreated: new Date(),
				represented: {
					organisationName: 'Rule 6 party',
					id: 50
				}
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithRule6);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRule6Rep);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRule6Rep,
				status: 'valid'
			});
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			databaseConnector.auditTrail.findFirst.mockResolvedValue(null);
			databaseConnector.auditTrail.create.mockResolvedValue({});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({ status: 'valid' })
				.set('azureAdUserId', 'user-id');

			expect(response.status).toEqual(200);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						details: `Rule 6 party proof of evidence and witnesses accepted`,
						appealId: 1
					})
				})
			);
		});

		test.each([
			[
				'yes',
				'Rule 6 party statement incomplete\n\nRule 6 party statement due date extended to 10 Mar 2025',
				'rule_6_party_statement'
			],
			[false, 'Rule 6 party statement incomplete', 'rule_6_party_statement'],
			[
				'yes',
				'Rule 6 party proof of evidence and witnesses incomplete\n\nRule 6 party proof of evidence and witnesses due date extended to 10 Mar 2025',
				'rule_6_party_proofs_evidence'
			],
			[
				false,
				'Rule 6 party proof of evidence and witnesses incomplete',
				'rule_6_party_proofs_evidence'
			]
		])(
			'should create audit trail "statement incomplete" when Rule 6 status updated to incomplete, allowResubmit: %s',
			async (allowResubmit, expectedAuditDetails, repType) => {
				jest.useFakeTimers().setSystemTime(new Date('2025-03-07'));

				const appealWithRule6 = {
					...householdAppeal,
					id: 1,
					appealTimetable: {
						lpaStatementDueDate: new Date('2025-03-05T00:00:00Z')
					},
					appealRule6Parties: [
						{
							id: 1,
							serviceUserId: 50,
							serviceUser: {
								id: 50,
								organisationName: 'Rule 6 party',
								email: 'rule6party@example.com'
							}
						}
					]
				};

				const mockRule6Rep = {
					id: 1,
					appealId: 1,
					representationType: repType,
					status: 'awaiting_review',
					dateCreated: new Date(),
					represented: {
						organisationName: 'Rule 6 party',
						id: 50,
						email: 'rule6party@example.com'
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithRule6);
				databaseConnector.representation.findUnique.mockResolvedValue(mockRule6Rep);
				databaseConnector.representation.update.mockResolvedValue({
					...mockRule6Rep,
					status: 'incomplete',
					representedId: 50
				});
				databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
				databaseConnector.auditTrail.findFirst.mockResolvedValue(null);
				databaseConnector.auditTrail.create.mockResolvedValue({});

				const response = await request
					.patch('/appeals/1/reps/1')
					.send({ status: 'incomplete', allowResubmit })
					.set('azureAdUserId', 'user-id');

				expect(response.status).toEqual(200);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
					expect.objectContaining({
						data: expect.objectContaining({
							details: expectedAuditDetails,
							appealId: 1
						})
					})
				);
			}
		);
	});

	describe('PATCH /appeals/:appealId/reps/:repId/attachments for rule 6 proof of evidence', () => {
		test('200 when attachments are successfully updated', async () => {
			const mockRepresentation = {
				id: 1,
				appealId: 1,
				attachments: [{ documentGuid: 'b6f15730-2d7f-4fa0-8752-2d26a62474de', version: 1 }],
				represented: {
					organisationName: 'Rule 6 party'
				}
			};
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			const mockUpdatedRepresentation = {
				id: 1,
				appealId: 1,
				representationType: 'rule_6_party_proofs_evidence',
				attachments: [
					{ documentGuid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6', version: 1 },
					{ documentGuid: 'b6f15730-2d7f-4fa0-8752-2d26a62474de', version: 1 }
				],
				represented: {
					organisationName: 'Rule 6 party'
				}
			};
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf',
				caseId: 1,
				latestDocumentVersion: { version: 1 },
				versions: [
					{
						version: 1,
						documentURI: 'http://example.com/test.pdf',
						fileMD5: 'abc123',
						dateCreated: new Date(),
						dateReceived: new Date()
					}
				]
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue(mockUpdatedRepresentation);

			const response = await request
				.patch('/appeals/1/reps/1/attachments')
				.send({ attachments: ['39ad6cd8-60ab-43f0-a995-4854db8f12c6'] })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(mockUpdatedRepresentation);

			expect(databaseConnector.representation.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					attachments: {
						connect: [
							{
								documentGuid_version: {
									documentGuid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
									version: 1
								}
							}
						]
					}
				}
			});

			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						details: `Rule 6 party proof of evidence and witnesses documents updated`,
						appealId: 1
					})
				})
			);
		});
	});
});
