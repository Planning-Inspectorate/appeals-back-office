// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal rule 6 parties routes', () => {
	/** @type {typeof fullPlanningAppealData} */
	let fullPlanningAppeal;

	const rule6Party = {
		id: '123',
		appealId: fullPlanningAppealData.id,
		serviceUserId: '123',
		serviceUser: {
			id: '123',
			organisationName: 'Test Organisation',
			email: 'test@example.com'
		}
	};

	const appealId = fullPlanningAppealData.id;

	beforeEach(() => {
		fullPlanningAppeal = JSON.parse(JSON.stringify(fullPlanningAppealData));
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue({
			...fullPlanningAppeal,
			appealRule6Parties: [rule6Party]
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/rule-6-parties', () => {
		describe('GET', () => {
			test('gets rule 6 parties for an appeal', async () => {
				const response = await request
					.get(`/appeals/${appealId}/rule-6-parties`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual([rule6Party]);
			});

			test('returns an error if appealId is not a number', async () => {
				const response = await request
					.get('/appeals/appealId/rule-6-parties')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});
		});

		describe('POST', () => {
			test('creates a single rule 6 party', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${appealId}/rule-6-parties`)
					.send({
						serviceUser: {
							organisationName: 'Test Organisation',
							email: 'test@example.com'
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealRule6Party.create).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: appealId
							}
						},
						serviceUser: {
							create: {
								organisationName: 'Test Organisation',
								email: 'test@example.com'
							}
						}
					}
				});

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/appealId/rule-6-parties`)
					.send({
						serviceUser: {
							organisationName: 'Test Organisation',
							email: 'test@example.com'
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if organisationName is not provided', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${appealId}/rule-6-parties`)
					.send({ serviceUser: { email: 'test@example.com' } })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { 'serviceUser.organisationName': 'must be a string' }
				});
			});

			test('returns an error if organisationName is greater than 300 characters', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${appealId}/rule-6-parties`)
					.send({
						serviceUser: {
							organisationName: 'a'.repeat(301),
							email: 'test@example.com'
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'serviceUser.organisationName': 'must be 300 characters or less'
					}
				});
			});

			test('returns an error if email is not provided', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${appealId}/rule-6-parties`)
					.send({ serviceUser: { organisationName: 'Test Organisation' } })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { 'serviceUser.email': 'must be a valid email' }
				});
			});

			test('returns an error if email is invalid', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${appealId}/rule-6-parties`)
					.send({ serviceUser: { organisationName: 'Test Organisation', email: 'test@blah@com' } })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { 'serviceUser.email': 'must be a valid email' }
				});
			});
		});
	});
});
