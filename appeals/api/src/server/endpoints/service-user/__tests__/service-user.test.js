import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, serviceUser } from '#tests/appeals/mocks.js';

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

describe('appeal service user routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('invalid requests', () => {
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
	});

	describe('valid requests', () => {
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
	});
});
