// @ts-nocheck
import { request } from '#server/app-test.js';
import { caseNotes, householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal case notes routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET', () => {
		describe('Case notes by AppealId', () => {
			it('returns 404 when the appeal is not found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({});

				const response = await request
					.get(`/appeals/${householdAppeal.id}/case-notes`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
			});

			it('should return an empty array if no case notes are found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.caseNote.findMany.mockResolvedValue([]);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/case-notes`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual([]);
			});

			it('should return a formatted array of case notes if one or more case notes are found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.caseNote.findMany.mockResolvedValue(caseNotes);
				const formattedCaseNotes = [
					{
						id: 1,
						comment: 'Comment 1',
						createdAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
						azureAdUserId
					},
					{
						id: 2,
						comment: 'Document received by email',
						createdAt: new Date('2024-03-26T23:59:59.999Z').toISOString(),
						azureAdUserId
					}
				];
				const response = await request
					.get(`/appeals/${householdAppeal.id}/case-notes`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(formattedCaseNotes);
			});
		});
	});
	describe('POST', () => {
		describe('Case note by AppealId', () => {
			it('returns 404 when the appeal is not found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: 'My Comment' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
			});
			it('returns 400 when the azureAdUserId is null or undefined', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: 'My Comment' });

				expect(response.status).toEqual(400);
			});
			it('returns 400 when the comment is undefined', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
			it('returns 400 when the comment is null', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: null })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
			it('returns 400 when the comment is an empty string', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: '' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			it('returns 400 when the comment exceeds the character limit', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: 'a'.repeat(501) })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			it('returns 200 when the submission is valid', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: 'a'.repeat(500) })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});
			it('returns 500 if the it fails to create a user', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.user.upsert.mockRejectedValue({});
				const response = await request
					.post(`/appeals/${householdAppeal.id}/case-notes`)
					.send({ comment: 'Comment' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
			});
		});
	});
});
