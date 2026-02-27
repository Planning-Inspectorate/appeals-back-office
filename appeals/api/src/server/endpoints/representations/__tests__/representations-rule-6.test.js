// @ts-nocheck
import { fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';

const { notifySend } = await import('#notify/notify-send.js');

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
						details: `Rule 6 party statement was received`,
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
						details: `Rule 6 party proof of evidence and witnesses was received`,
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
describe('publishProofOfEvidence', () => {
	const appealId = 1;
	const azureAdUserId = '732652365';

	const mockAppeal = {
		id: appealId,
		reference: '123456',
		applicationReference: 'APP/123/456',
		lpa: { email: 'lpa@example.com' },
		agent: { email: 'agent@example.com' },
		appellant: { email: 'appellant@example.com' },
		appealStatus: [{ status: 'evidence', valid: true }],
		appealRule6Parties: [
			{
				id: 1,
				serviceUser: {
					id: 101,
					email: 'r6_1@example.com',
					organisationName: 'Rule 6 Org 1'
				}
			},
			{
				id: 2,
				serviceUser: {
					id: 102,
					email: 'r6_2@example.com',
					organisationName: 'Rule 6 Org 2'
				}
			}
		],
		representations: [],
		inquiry: {
			inquiryStartTime: new Date().toISOString(),
			estimatedDays: 1,
			address: { addressLine1: '123 High St' }
		},
		appealType: { key: 'D' }
	};
	beforeAll(async () => {
		const appTest = await import('#server/app-test.js');
		request = appTest.request;
		const db = await import('#utils/database-connector.js');
		databaseConnector = db.databaseConnector;
	});
	beforeEach(() => {
		jest.clearAllMocks();
		databaseConnector.documentVersion.findMany.mockResolvedValue([]);
		databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
			{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
		]);
		databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
		databaseConnector.representation.updateMany.mockResolvedValue([]);
		databaseConnector.representation.findMany.mockResolvedValue([]);
		databaseConnector.appealStatus.create.mockResolvedValue({});

		databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);
	});

	it('should send a mixed aggregated email to each recipient when multiple parties are invalid', async () => {
		const testAppeal = {
			...mockAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 102,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};
		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);
		const response = await request
			.post(`/appeals/${appealId}/reps/publish`)
			.query({ type: 'evidence' })
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);
		expect(notifySend).toHaveBeenCalledTimes(4);

		const findCall = (email) =>
			notifySend.mock.calls.find((call) => call[0].recipientEmail === email);

		const callLpa = findCall('lpa@example.com');
		expect(callLpa).toBeDefined();
		expect(callLpa[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');
		expect(callLpa[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 2');

		const callApp = findCall('agent@example.com');
		expect(callApp).toBeDefined();
		expect(callApp[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');
		expect(callApp[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 2');

		const callR6_1 = findCall('r6_1@example.com');
		expect(callR6_1).toBeDefined();
		expect(callR6_1[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');
		expect(callR6_1[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 2');

		const callR6_2 = findCall('r6_2@example.com');
		expect(callR6_2).toBeDefined();
		expect(callR6_2[0].templateName).toBe('not-received-proof-of-evidence-and-witnesses');
		expect(callR6_2[0].personalisation.inquiry_subject_line).toContain('local planning authority');
		expect(callR6_2[0].personalisation.inquiry_subject_line).toContain('appellant');
		expect(callR6_2[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 1');
	});

	it('should send "Exchange of proof" email to all parties when ALL parties have submitted valid PoE', async () => {
		const testAppeal = {
			...mockAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 101,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 102,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};

		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		const response = await request
			.post(`/appeals/${appealId}/reps/publish`)
			.query({ type: 'evidence' })
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);

		expect(notifySend).toHaveBeenCalledTimes(4);

		const findCall = (email) =>
			notifySend.mock.calls.find((call) => call[0].recipientEmail === email);

		const callLpa = findCall('lpa@example.com');
		expect(callLpa).toBeDefined();
		expect(callLpa[0].personalisation.inquiry_subject_line).toEqual(
			expect.arrayContaining(['appellant', 'Rule 6 Org 1', 'Rule 6 Org 2'])
		);

		const callApp = findCall('agent@example.com');
		expect(callApp).toBeDefined();
		expect(callApp[0].personalisation.inquiry_subject_line).toEqual(
			expect.arrayContaining(['local planning authority', 'Rule 6 Org 1', 'Rule 6 Org 2'])
		);

		const callR6_1 = findCall('r6_1@example.com');
		expect(callR6_1).toBeDefined();
		expect(callR6_1[0].personalisation.inquiry_subject_line).toEqual(
			expect.arrayContaining(['local planning authority', 'appellant', 'Rule 6 Org 2'])
		);

		const callR6_2 = findCall('r6_2@example.com');
		expect(callR6_2).toBeDefined();
		expect(callR6_2[0].personalisation.inquiry_subject_line).toEqual(
			expect.arrayContaining(['local planning authority', 'appellant', 'Rule 6 Org 1'])
		);

		notifySend.mock.calls.forEach((call) => {
			expect(call[0].templateName).toEqual('proof-of-evidence-and-witnesses-shared');
		});
	});

	it('should notify others when LPA is missing PoE (LPA gets Shared email)', async () => {
		const testAppeal = {
			...mockAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 101,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 102,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};

		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		await request
			.post(`/appeals/${appealId}/reps/publish`)
			.query({ type: 'evidence' })
			.set('azureAdUserId', azureAdUserId);

		expect(notifySend).toHaveBeenCalledTimes(4);

		const callLpa = notifySend.mock.calls.find(
			(call) => call[0].recipientEmail === 'lpa@example.com'
		);
		expect(callLpa).toBeDefined();
		expect(callLpa[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');

		const callApp = notifySend.mock.calls.find(
			(call) => call[0].recipientEmail === 'agent@example.com'
		);
		expect(callApp).toBeDefined();
		expect(callApp[0].templateName).toBe('not-received-proof-of-evidence-and-witnesses');
		expect(callApp[0].personalisation.inquiry_subject_line).toContain('local planning authority');
	});

	it('should notify others when Appellant is missing PoE (Appellant gets Shared email)', async () => {
		const testAppeal = {
			...mockAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 101,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 102,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};

		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		await request
			.post(`/appeals/${appealId}/reps/publish`)
			.query({ type: 'evidence' })
			.set('azureAdUserId', azureAdUserId);

		expect(notifySend).toHaveBeenCalledTimes(4);

		const callApp = notifySend.mock.calls.find(
			(call) => call[0].recipientEmail === 'agent@example.com'
		);
		expect(callApp).toBeDefined();
		expect(callApp[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');

		const callLpa = notifySend.mock.calls.find(
			(call) => call[0].recipientEmail === 'lpa@example.com'
		);
		expect(callLpa).toBeDefined();
		expect(callLpa[0].templateName).toBe('not-received-proof-of-evidence-and-witnesses');
		expect(callLpa[0].personalisation.inquiry_subject_line).toContain('appellant');
	});

	it('should handle multiple Rule 6 parties missing PoE (Cross-notification logic)', async () => {
		const testAppeal = {
			...mockAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};

		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		await request
			.post(`/appeals/${appealId}/reps/publish`)
			.query({ type: 'evidence' })
			.set('azureAdUserId', azureAdUserId);

		expect(notifySend).toHaveBeenCalledTimes(4);

		const findCall = (email) =>
			notifySend.mock.calls.find((call) => call[0].recipientEmail === email);

		const callLpa = findCall('lpa@example.com');
		expect(callLpa[0].templateName).toBe('not-received-proof-of-evidence-and-witnesses');
		expect(callLpa[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 1');
		expect(callLpa[0].personalisation.inquiry_subject_line).toContain('Rule 6 Org 2');

		const callR6_1 = findCall('r6_1@example.com');
		expect(callR6_1[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');
		expect(callR6_1[0].personalisation.inquiry_subject_line).toContain('local planning authority');
		expect(callR6_1[0].personalisation.inquiry_subject_line).toContain('appellant');

		const callR6_2 = findCall('r6_2@example.com');
		expect(callR6_2[0].templateName).toBe('proof-of-evidence-and-witnesses-shared');
		expect(callR6_2[0].personalisation.inquiry_subject_line).toContain('local planning authority');
		expect(callR6_2[0].personalisation.inquiry_subject_line).toContain('appellant');
	});
});

describe('publishStatements', () => {
	const appealId = 1;
	const azureAdUserId = '732652365';

	const mockAppeal = {
		id: appealId,
		reference: '123456',
		applicationReference: 'APP/123/456',
		lpa: { email: 'lpa@example.com' },
		appellant: { email: 'appellant@example.com' },
		appealStatus: [{ status: 'statements', valid: true }],
		appealRule6Parties: [
			{
				id: 1,
				serviceUser: {
					id: 101,
					email: 'r6_1@example.com',
					organisationName: 'Rule 6 Org 1'
				}
			}
		],
		representations: [],
		appealType: { key: 'D' },
		procedureType: { key: 'inquiry' },
		inquiry: {
			inquiryStartTime: new Date().toISOString(),
			estimatedDays: 1,
			address: { addressLine1: '123 High St' }
		},
		appealTimetable: {
			finalCommentsDueDate: new Date('2024-01-01T00:00:00.000Z'),
			proofOfEvidenceAndWitnessesDueDate: new Date('2024-02-01T00:00:00.000Z'),
			ipCommentsDueDate: new Date('2023-01-01T00:00:00.000Z'),
			lpaStatementDueDate: new Date('2023-01-01T00:00:00.000Z')
		}
	};

	const emailPayload = {
		inquiry_address: '',
		inquiry_date: '',
		inquiry_detail_warning_text: '',
		inquiry_expected_days: '',
		inquiry_time: '',
		inquiry_witnesses_text: '',
		inquiry_subject_line: ''
	};

	beforeAll(async () => {
		const appTest = await import('#server/app-test.js');
		request = appTest.request;
		const db = await import('#utils/database-connector.js');
		databaseConnector = db.databaseConnector;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		databaseConnector.documentVersion.findMany.mockResolvedValue([]);
		databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
			{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
		]);
		databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
		databaseConnector.representation.updateMany.mockResolvedValue([]);
		databaseConnector.appealStatus.create.mockResolvedValue({});

		databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);
	});

	it('should send "Submit your proof of evidence and witnesses" email to all parties when ALL parties have submitted valid statements', async () => {
		const representations = [
			{
				representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID
			},
			{
				representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
				representedId: 101,
				status: APPEAL_REPRESENTATION_STATUS.VALID
			}
		];
		const testAppeal = {
			...mockAppeal,
			representations
		};

		databaseConnector.representation.findMany.mockResolvedValue(representations);
		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		const expectedEmailPayload = {
			...emailPayload,
			lpa_reference: testAppeal.applicationReference,
			has_ip_comments: false,
			has_statement: true,
			is_hearing_procedure: false,
			is_inquiry_procedure: true,
			has_rule_6_parties: true,
			has_rule_6_statement: true,
			appeal_reference_number: testAppeal.reference,
			final_comments_deadline: '1 January 2024',
			site_address: 'Address not available',
			user_type: ''
		};

		const response = await request
			.post(`/appeals/${appealId}/reps/publish`)
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);

		expect(notifySend).toHaveBeenCalledTimes(3);

		expect(notifySend).toHaveBeenNthCalledWith(1, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/manage-appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.lpa.email,
			templateName: 'received-statement-and-ip-comments-lpa'
		});

		expect(notifySend).toHaveBeenNthCalledWith(2, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.appellant.email,
			templateName: 'received-statement-and-ip-comments-appellant'
		});

		expect(notifySend).toHaveBeenNthCalledWith(3, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: ''
			},
			recipientEmail: testAppeal.appealRule6Parties[0].serviceUser.email,
			templateName: 'received-statement-and-ip-comments-appellant'
		});
	});

	it('should send "We did not receive any statements" email to all parties when no statements were submitted', async () => {
		const testAppeal = {
			...mockAppeal
		};

		databaseConnector.representation.findMany.mockResolvedValue([]);
		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		const expectedEmailPayload = {
			...emailPayload,
			lpa_reference: testAppeal.applicationReference,
			has_ip_comments: false,
			has_statement: false,
			is_hearing_procedure: false,
			is_inquiry_procedure: true,
			has_rule_6_parties: true,
			has_rule_6_statement: false,
			appeal_reference_number: testAppeal.reference,
			final_comments_deadline: '1 January 2024',
			site_address: 'Address not available',
			user_type: ''
		};

		const response = await request
			.post(`/appeals/${appealId}/reps/publish`)
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);

		expect(notifySend).toHaveBeenCalledTimes(3);

		expect(notifySend).toHaveBeenNthCalledWith(1, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/manage-appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.lpa.email,
			templateName: 'not-received-statement-and-ip-comments'
		});

		expect(notifySend).toHaveBeenNthCalledWith(2, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.appellant.email,
			templateName: 'not-received-statement-and-ip-comments'
		});

		expect(notifySend).toHaveBeenNthCalledWith(3, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: ''
			},
			recipientEmail: testAppeal.appealRule6Parties[0].serviceUser.email,
			templateName: 'not-received-statement-and-ip-comments'
		});
	});

	it('should send "Recieved Rule 6 Party Statement" email to all parties when only Rule 6 has submitted a statement', async () => {
		const representations = [
			{
				representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
				representedId: 101,
				status: APPEAL_REPRESENTATION_STATUS.VALID
			}
		];
		const testAppeal = {
			...mockAppeal,
			representations
		};

		databaseConnector.representation.findMany.mockResolvedValue(representations);
		databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

		const expectedEmailPayload = {
			...emailPayload,
			lpa_reference: testAppeal.applicationReference,
			has_ip_comments: false,
			has_statement: false,
			is_hearing_procedure: false,
			is_inquiry_procedure: true,
			has_rule_6_parties: true,
			has_rule_6_statement: true,
			appeal_reference_number: testAppeal.reference,
			final_comments_deadline: '1 January 2024',
			site_address: 'Address not available',
			user_type: ''
		};

		const response = await request
			.post(`/appeals/${appealId}/reps/publish`)
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);

		expect(notifySend).toHaveBeenCalledTimes(3);

		expect(notifySend).toHaveBeenNthCalledWith(1, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/manage-appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.lpa.email,
			templateName: 'rule-6-statement-received'
		});

		expect(notifySend).toHaveBeenNthCalledWith(2, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: `/mock-front-office-url/appeals/${testAppeal.reference}`
			},
			recipientEmail: testAppeal.appellant.email,
			templateName: 'rule-6-statement-received'
		});

		expect(notifySend).toHaveBeenNthCalledWith(3, {
			azureAdUserId: expect.anything(),
			notifyClient: expect.anything(),
			personalisation: {
				...expectedEmailPayload,
				what_happens_next: `You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/${testAppeal.reference}) by 1 February 2024.`,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				statement_url: ''
			},
			recipientEmail: testAppeal.appealRule6Parties[0].serviceUser.email,
			templateName: 'received-only-rule-6-statement-rule-6-party'
		});
	});
});
