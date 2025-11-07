import { request } from '#tests/../app-test.js';
import { householdAppeal, serviceUser } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');
const validServiceUser = {
	serviceUserId: 1,
	firstName: 'Jessica',
	lastName: 'Jones',
	userType: 'agent'
};

const serviceUserWithInvalidEmail = {
	...validServiceUser,
	email: 'jess'
};

const serviceUserWithMissingRequiredFields = {
	...validServiceUser,
	firstName: null
};

const serviceUserWithInvalidUserType = {
	...validServiceUser,
	userType: null
};
const appellantServiceUser = {
	...validServiceUser,
	userType: 'appellant',
	email: 'email@example.com',
	phoneNumber: '01234567890'
};

describe('appeal service user routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('PATCH /service-user', () => {
		test('returns 404 when the service user is not found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/0/service-user`)
				.send({ serviceUser: validServiceUser })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test('returns 400 when updating a service user and the field is missing required fields', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: serviceUserWithMissingRequiredFields })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 400 when updating a service user and the email is invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: serviceUserWithInvalidEmail })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 400 when updating a service user and the userType is invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: serviceUserWithInvalidUserType })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 200 when updating a service user with correct data', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(serviceUser);
			// @ts-ignore
			databaseConnector.serviceUser.update.mockResolvedValue({
				...serviceUser,
				firstName: 'Jessica',
				lastName: 'Jones'
			});

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: validServiceUser })
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.serviceUser.update).toHaveBeenCalledWith({
				data: {
					firstName: 'Jessica',
					lastName: 'Jones'
				},
				where: {
					id: 1
				}
			});
			expect(response.status).toEqual(200);
		});
		test('returns 200 when updating an appellant service user and agent assigned to appeal missed phone number and email data', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValueOnce(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(appellantServiceUser);
			// @ts-ignore
			databaseConnector.serviceUser.update.mockResolvedValue({
				...appellantServiceUser,
				firstName: 'Jessica',
				lastName: 'Jones',
				userType: 'appellant'
			});

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: appellantServiceUser })
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.serviceUser.update).toHaveBeenCalledWith({
				data: {
					firstName: 'Jessica',
					lastName: 'Jones'
				},
				where: {
					id: 1
				}
			});
			expect(databaseConnector.serviceUser.update).not.toHaveBeenCalledWith({
				data: {
					email: 'email@example.com',
					phoneNumber: '01234567890'
				},
				where: {
					id: 1
				}
			});
			expect(response.status).toEqual(200);
		});
		test('returns 200 when updating an appellant service user with no agent present - including phone number and email', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValueOnce({
				...householdAppeal,
				agent: null
			});
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(appellantServiceUser);
			// @ts-ignore
			databaseConnector.serviceUser.update.mockResolvedValue({
				...serviceUser,
				firstName: 'Jessica',
				lastName: 'Jones',
				userType: 'appellant',
				email: 'email@example.com',
				phoneNumber: '01234567890'
			});

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user`)
				.send({ serviceUser: appellantServiceUser })
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.serviceUser.update).toHaveBeenCalledWith({
				data: {
					firstName: 'Jessica',
					lastName: 'Jones',
					email: 'email@example.com',
					phoneNumber: '01234567890'
				},
				where: {
					id: 1
				}
			});
			expect(response.status).toEqual(200);
		});
	});

	describe('PATCH /service-user/:serviceUserId/address', () => {
		test('returns 404 when the service user is not found', async () => {
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/service-user/1000000/address`)
				.send({})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test("returns 200 when updating a service user's address", async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue(serviceUser);
			// @ts-ignore
			databaseConnector.serviceUser.update.mockResolvedValue(serviceUser);

			const response = await request
				.patch(
					`/appeals/${householdAppeal.id}/service-user/${validServiceUser.serviceUserId}/address`
				)
				.send({ town: 'London' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
		});
	});

	describe('DELETE /service-user', () => {
		test('returns 404 when the appeal is not found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(undefined);

			const response = await request
				.delete(`/appeals/0/service-user`)
				.send({ userType: 'agent' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test('returns 404 when the service user is not found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.serviceUser.delete.mockResolvedValue(undefined);

			const response = await request
				.delete(`/appeals/0/service-user`)
				.send({ userType: 'agent' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test('returns 200 when the service user is deleted', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.serviceUser.delete.mockResolvedValue(serviceUser);

			const appealId = householdAppeal.id;
			const agentId = householdAppeal.agent.id;

			const response = await request
				.delete(`/appeals/${appealId}/service-user`)
				.send({ userType: 'agent' })
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					agent: {
						disconnect: true
					}
				},
				where: {
					id: appealId
				}
			});

			expect(databaseConnector.serviceUser.delete).toHaveBeenCalledWith({
				where: {
					id: agentId
				}
			});

			expect(response.status).toEqual(200);

			expect(response.body).toEqual({ serviceUserId: agentId });
		});
	});
});
