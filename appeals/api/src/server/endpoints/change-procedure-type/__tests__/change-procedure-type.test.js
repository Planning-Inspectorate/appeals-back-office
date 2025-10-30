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

				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					appeal_procedure: 'written',
					change_message:
						'We have changed your appeal procedure to written representations and cancelled your hearing.',
					lpa_statement_exists: true
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						...personalisation,
						is_lpa: false,
						subject: 'We have changed your appeal procedure: 1345264'
					},
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'change-procedure-type'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation: {
						...personalisation,
						is_lpa: true,
						subject: 'We have changed the appeal procedure: 1345264'
					},
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'change-procedure-type'
				});
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

				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					appeal_procedure: 'written',
					change_message:
						'We have changed your appeal procedure to written representations and cancelled your inquiry.',
					lpa_statement_exists: true
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						...personalisation,
						is_lpa: false,
						subject: 'We have changed your appeal procedure: 1345264'
					},
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'change-procedure-type'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation: {
						...personalisation,
						is_lpa: true,
						subject: 'We have changed the appeal procedure: 1345264'
					},
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'change-procedure-type'
				});
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

				expect(mockNotifySend).not.toHaveBeenCalled();
			});
		});
	});
});
