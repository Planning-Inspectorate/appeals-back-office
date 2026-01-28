// @ts-nocheck
import { fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';

let request;
let databaseConnector;

describe('Appellant Statement Representations', () => {
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

	describe('POST /appeals/:id/reps/appellant_statement', () => {
		test('201 when appellant_statement representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.user.upsert.mockResolvedValue({ id: 123 });
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);
			databaseConnector.representation.findUnique.mockResolvedValue({
				id: 1,
				representationType: 'appellant_statement',
				status: 'valid'
			});

			const response = await request
				.post('/appeals/1/reps/appellant_statement')
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
						details: `The appellant statement was received`,
						appealId: 1
					})
				})
			);
		});
	});

	describe('PATCH /appeals/:id/reps/:repId (Appellant Statement)', () => {
		test('should create audit trail "statement accepted" when appellant statement updated to valid', async () => {
			const appeal = {
				...householdAppeal,
				id: 1
			};

			const mockRep = {
				id: 1,
				appealId: 1,
				representationType: 'appellant_statement',
				status: 'awaiting_review',
				dateCreated: new Date()
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRep);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRep,
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
						details: `Appellant statement accepted`,
						appealId: 1
					})
				})
			);
		});

		test.each([
			[
				'yes',
				'Appellant statement incomplete\n\nAppellant statement due date extended to 10 Mar 2025'
			],
			[false, 'Appellant statement incomplete']
		])(
			'should create audit trail "statement incomplete" when appellant statement updated to incomplete, allowResubmit: %s',
			async (allowResubmit, expectedAuditDetails) => {
				jest.useFakeTimers().setSystemTime(new Date('2025-03-07'));

				const appeal = {
					...householdAppeal,
					id: 1,
					appealTimetable: {
						lpaStatementDueDate: new Date('2025-03-05T00:00:00Z')
					}
				};

				const mockRep = {
					id: 1,
					appealId: 1,
					representationType: 'appellant_statement',
					status: 'awaiting_review',
					dateCreated: new Date()
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.representation.findUnique.mockResolvedValue(mockRep);
				databaseConnector.representation.update.mockResolvedValue({
					...mockRep,
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
});
