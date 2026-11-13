import { appealTypes, azureAdUserId } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('appeal types routes', () => {
	describe('/appeals/appeal-types', () => {
		describe('GET', () => {
			test('gets appeal types', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appealTypes);
			});

			test('gets appeal types that are active in Manage appeals if query parameter filterEnabled is true', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

				const response = await request
					.get('/appeals/appeal-types')
					.query('filterEnabled=true')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appealTypes);
			});

			test('returns an error if appeal types are not found', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get appeal types', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});

		describe('PATCH /appeals/appeal-types/:id/notify-suppression', () => {
			test('updates suppressNotifications on an appeal type by id', async () => {
				const updatedAppealType = {
					id: 1,
					key: 'D',
					type: 'householder',
					suppressNotifications: true
				};

				// @ts-ignore
				databaseConnector.appealType.update.mockResolvedValue(updatedAppealType);

				const response = await request
					.patch('/appeals/appeal-types/1/notify-suppression')
					.send({ suppressNotifications: true })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(updatedAppealType);
				expect(databaseConnector.appealType.update).toHaveBeenCalledWith({
					where: { id: 1 },
					data: { suppressNotifications: true }
				});
			});

			test('updates suppressNotifications on an appeal type by key', async () => {
				const updatedAppealType = {
					id: 4,
					key: 'G',
					type: 'discontinuance_notice',
					suppressNotifications: false
				};

				// @ts-ignore
				databaseConnector.appealType.update.mockResolvedValue(updatedAppealType);

				const response = await request
					.patch('/appeals/appeal-types/G/notify-suppression')
					.send({ suppressNotifications: false })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(updatedAppealType);
				expect(databaseConnector.appealType.update).toHaveBeenCalledWith({
					where: { key: 'G' },
					data: { suppressNotifications: false }
				});
			});

			test('returns 400 when suppressNotifications is missing or not a boolean', async () => {
				const response = await request
					.patch('/appeals/appeal-types/1/notify-suppression')
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
		});
	});
});
