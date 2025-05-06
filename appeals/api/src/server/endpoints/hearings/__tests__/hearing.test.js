import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';

import { householdAppeal as householdAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('hearing routes', () => {
	/** @type {typeof householdAppealData} */
	let householdAppeal;

	beforeEach(() => {
		householdAppeal = JSON.parse(JSON.stringify(householdAppealData));
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue({
			...householdAppeal.hearing,
			householdAppeal
		});
		// @ts-ignore
		databaseConnector.hearing.findUnique.mockResolvedValue({
			...householdAppeal.hearing
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/hearing/:hearingId', () => {
		describe('GET', () => {
			test('gets a single hearing', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					hearingId: hearing.id,
					appealId: hearing.appealId,
					hearingStartTime: hearing.hearingStartTime,
					hearingEndTime: hearing.hearingEndTime,
					addressId: hearing.addressId,
					address: hearing.address
				});
			});

			test('returns an error if appealId is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/appealId/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if hearingId is not provided', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/hearing`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if hearingId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/hearing/hearingId`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingId: 'must be a number' }
				});
			});
		});
		describe('PATCH', () => {
			test('updates a single hearing with address', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});
			test('updates a single hearing with addressId', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals//hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if appealId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/appealId/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if hearingId is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if hearingId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/hearingId`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingId: 'must be a number' }
				});
			});

			test('returns an error if addressId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: 'addressId'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { addressId: 'must be a number' }
				});
			});

			test('returns an error if hearingStartTime is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});
			test('returns an error if hearingStartTime is not a valid date', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: 'hearingStartTime',
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if hearingEndTime is not a valid date', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: 'hearingEndTime',
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingEndTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if addressLine1 is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine1 is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: 123,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine1 is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: 'a'.repeat(251),
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if addressLine2 is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: 123,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine2': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine2 is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: 'a'.repeat(251),
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine2': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if town is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be a string'
					}
				});
			});
			test('returns an error if town is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: 123
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be a string'
					}
				});
			});
			test('returns an error if town is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: 'a'.repeat(251)
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if country is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: 123,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.country': 'must be a string'
					}
				});
			});
			test('returns an error if country is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: 'a'.repeat(251),
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.country': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if county is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: 123,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.county': 'must be a string'
					}
				});
			});
			test('returns an error if county is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: 'a'.repeat(251),
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.county': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if postcode is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be a string'
					}
				});
			});
			test('returns an error if postcode is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 123,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be a string'
					}
				});
			});
			test('returns an error if postcode is greater than 8 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 'a'.repeat(9),
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be 8 characters or less'
					}
				});
			});
			test('returns an error if postcode is not a valid UK postcode', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 'ZZ999XZZ',
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'needs to be a valid and include spaces'
					}
				});
			});
		});
	});

	describe('/:appealId/hearing', () => {
		describe('POST', () => {
			test('updates a single hearing with address', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});
			test('updates a single hearing with addressId', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if appealId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/appealId/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if addressId is not a number', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: 'addressId'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { addressId: 'must be a number' }
				});
			});

			test('returns an error if hearingStartTime is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({ hearingEndTime: hearing.hearingEndTime, addressId: hearing.addressId })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});
			test('returns an error if hearingStartTime is not a valid date', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingEndTime: hearing.hearingEndTime,
						addressId: hearing.addressId,
						hearingStartTime: 'hearingStartTime'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});
			test('returns an error if hearingEndTime is not a valid date', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						addressId: hearing.addressId,
						hearingEndTime: 'hearingEndTime'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingEndTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if addressLine1 is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine1 is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: 123,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine1 is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: 'a'.repeat(251),
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine1': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if addressLine2 is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: 123,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine2': 'must be a string'
					}
				});
			});
			test('returns an error if addressLine2 is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: 'a'.repeat(251),
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.addressLine2': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if town is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be a string'
					}
				});
			});
			test('returns an error if town is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: 123
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be a string'
					}
				});
			});
			test('returns an error if town is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: 'a'.repeat(251)
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.town': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if country is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: 123,
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.country': 'must be a string'
					}
				});
			});
			test('returns an error if country is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: 'a'.repeat(251),
							county: hearing.address.addressCounty,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.country': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if county is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: 123,
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.county': 'must be a string'
					}
				});
			});
			test('returns an error if county is greater than 250 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: 'a'.repeat(251),
							postcode: hearing.address.postcode,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.county': 'must be 250 characters or less'
					}
				});
			});

			test('returns an error if postcode is not provided', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be a string'
					}
				});
			});
			test('returns an error if postcode is not a string', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 123,
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be a string'
					}
				});
			});
			test('returns an error if postcode is greater than 8 characters', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 'a'.repeat(9),
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'must be 8 characters or less'
					}
				});
			});
			test('returns an error if postcode is not a valid UK postcode', async () => {
				const { hearing } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							addressLine1: hearing.address.addressLine1,
							addressLine2: hearing.address.addressLine2,
							country: hearing.address.addressCountry,
							county: hearing.address.addressCounty,
							postcode: 'ZZ999XZZ',
							town: hearing.address.addressTown
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						'address.postcode': 'needs to be a valid and include spaces'
					}
				});
			});
		});
	});
});
