// @ts-nocheck
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('notifications routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('PATCH /appeals/:appealId/notify-suppression', () => {
		test('updates suppressNotifications to true on an individual appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appeal.update.mockResolvedValue({ id: 1, suppressNotifications: true });

			const response = await request
				.patch('/appeals/1/notify-suppression')
				.send({ suppressNotifications: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ id: 1, suppressNotifications: true });
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					suppressNotifications: true,
					caseUpdatedDate: expect.any(Date)
				}
			});
		});

		test('updates suppressNotifications to false (manual re-enable)', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appeal.update.mockResolvedValue({ id: 1, suppressNotifications: false });

			const response = await request
				.patch('/appeals/1/notify-suppression')
				.send({ suppressNotifications: false })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ id: 1, suppressNotifications: false });
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					suppressNotifications: false,
					caseUpdatedDate: expect.any(Date)
				}
			});
		});

		test('updates suppressNotifications to null (reset to inherit from AppealType)', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appeal.update.mockResolvedValue({ id: 1, suppressNotifications: null });

			const response = await request
				.patch('/appeals/1/notify-suppression')
				.send({ suppressNotifications: null })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ id: 1, suppressNotifications: null });
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					suppressNotifications: null,
					caseUpdatedDate: expect.any(Date)
				}
			});
		});

		test('returns 400 when suppressNotifications is not boolean or null', async () => {
			const response = await request
				.patch('/appeals/1/notify-suppression')
				.send({ suppressNotifications: 'not-a-boolean' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 404 when appeal does not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.patch('/appeals/999/notify-suppression')
				.send({ suppressNotifications: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});
	});
});
