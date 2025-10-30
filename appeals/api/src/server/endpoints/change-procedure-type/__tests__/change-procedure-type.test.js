// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('Change appeal procedure type route', () => {
	/** @type {typeof fullPlanningAppealData} */
	let fullPlanningAppeal;
	let mockTx;
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		fullPlanningAppeal = JSON.parse(JSON.stringify(fullPlanningAppealData));

		mockTx = {
			hearing: { deleteMany: jest.fn() },
			hearingEstimate: { deleteMany: jest.fn() },
			inquiry: { deleteMany: jest.fn() },
			inquiryEstimate: { deleteMany: jest.fn() },
			procedureType: { findFirst: jest.fn() },
			appeal: { update: jest.fn() },
			appealTimetable: { update: jest.fn() }
		};
		mockTx.hearing.deleteMany.mockResolvedValue({});
		mockTx.hearingEstimate.deleteMany.mockResolvedValue({});
		mockTx.inquiry.deleteMany.mockResolvedValue({});
		mockTx.inquiryEstimate.deleteMany.mockResolvedValue({});
		mockTx.procedureType.findFirst.mockResolvedValue({ id: 1 });
		mockTx.appeal.update.mockResolvedValue({});
		mockTx.appealTimetable.update.mockResolvedValue({});
		databaseConnector.$transaction = jest.fn().mockImplementation(async (fn) => {
			return fn(mockTx);
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		describe('Change to Written', () => {
			test('returns 400 if any timetable date is missing', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/procedure-type-change-request`)
					.send({
						existingAppealProcedure: 'hearing',
						appealProcedure: 'written'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.text).toContain('lpaQuestionnaireDueDate');
				expect(response.text).toContain('ipCommentsDueDate');
				expect(response.text).toContain('lpaStatementDueDate');
				expect(response.text).toContain('finalCommentsDueDate');
				expect(response.text).toContain('must be a valid date');
			});

			test('returns 201 and calls delete hearing if changing from hearing to written', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/procedure-type-change-request`)
					.send({
						existingAppealProcedure: 'hearing',
						appealProcedure: 'written',
						lpaQuestionnaireDueDate: '2025-11-03T00:00:00.000Z',
						ipCommentsDueDate: '2025-12-01T00:00:00.000Z',
						lpaStatementDueDate: '2025-12-01T00:00:00.000Z',
						finalCommentsDueDate: '2025-12-15T00:00:00.000Z'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
				expect(mockTx.hearing.deleteMany).toHaveBeenCalledTimes(1);
				expect(mockTx.hearing.deleteMany).toHaveBeenCalledWith({
					where: { appealId: fullPlanningAppeal.id }
				});

				expect(mockTx.appeal.update).toHaveBeenCalledTimes(1);
				expect(mockTx.appeal.update).toHaveBeenCalledWith({
					where: { id: fullPlanningAppeal.id },
					data: { procedureTypeId: 1 }
				});

				expect(mockTx.inquiry.deleteMany).not.toHaveBeenCalled();

				// verify transaction itself was called
				expect(databaseConnector.$transaction).toHaveBeenCalled();
			});

			test('returns 201 and calls delete hearing if changing from inquiry to written', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/procedure-type-change-request`)
					.send({
						existingAppealProcedure: 'inquiry',
						appealProcedure: 'written',
						lpaQuestionnaireDueDate: '2025-11-03T00:00:00.000Z',
						ipCommentsDueDate: '2025-12-01T00:00:00.000Z',
						lpaStatementDueDate: '2025-12-01T00:00:00.000Z',
						finalCommentsDueDate: '2025-12-15T00:00:00.000Z'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
				expect(mockTx.inquiry.deleteMany).toHaveBeenCalledTimes(1);
				expect(mockTx.inquiry.deleteMany).toHaveBeenCalledWith({
					where: { appealId: fullPlanningAppeal.id }
				});

				expect(mockTx.appeal.update).toHaveBeenCalledTimes(1);
				expect(mockTx.appeal.update).toHaveBeenCalledWith({
					where: { id: fullPlanningAppeal.id },
					data: { procedureTypeId: 1 }
				});

				expect(mockTx.hearing.deleteMany).not.toHaveBeenCalled();

				// verify transaction itself was called
				expect(databaseConnector.$transaction).toHaveBeenCalled();
			});

			test('returns 201 and calls delete hearing if changing from written to written', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/procedure-type-change-request`)
					.send({
						existingAppealProcedure: 'written',
						appealProcedure: 'written',
						lpaQuestionnaireDueDate: '2025-11-03T00:00:00.000Z',
						ipCommentsDueDate: '2025-12-01T00:00:00.000Z',
						lpaStatementDueDate: '2025-12-01T00:00:00.000Z',
						finalCommentsDueDate: '2025-12-15T00:00:00.000Z'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
				expect(mockTx.hearing.deleteMany).not.toHaveBeenCalled();
				expect(mockTx.inquiry.deleteMany).not.toHaveBeenCalled();

				expect(mockTx.appeal.update).toHaveBeenCalledTimes(1);
				expect(mockTx.appeal.update).toHaveBeenCalledWith({
					where: { id: fullPlanningAppeal.id },
					data: { procedureTypeId: 1 }
				});

				// verify transaction itself was called
				expect(databaseConnector.$transaction).toHaveBeenCalled();
			});
		});
	});
});
