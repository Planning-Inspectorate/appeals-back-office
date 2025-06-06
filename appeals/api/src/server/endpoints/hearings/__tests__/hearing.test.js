import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';

import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { omit } from 'lodash-es';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('hearing routes', () => {
	/** @type {typeof fullPlanningAppealData} */
	let fullPlanningAppeal;
	const address = {
		addressLine1: fullPlanningAppealData.address.addressLine1,
		addressLine2: fullPlanningAppealData.address.addressLine2,
		town: fullPlanningAppealData.address.addressTown,
		county: fullPlanningAppealData.address.addressCounty,
		postcode: fullPlanningAppealData.address.postcode,
		country: fullPlanningAppealData.address.addressCountry
	};
	const hearing = {
		...fullPlanningAppealData.hearing,
		hearingStartTime: new Date('2999-01-01T12:00:00.000Z'),
		hearingEndTime: new Date('2999-01-01T13:00:00.000Z')
	};

	beforeEach(() => {
		fullPlanningAppeal = JSON.parse(JSON.stringify(fullPlanningAppealData));
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue({
			hearing,
			fullPlanningAppeal
		});
		// @ts-ignore
		databaseConnector.hearing.findUnique.mockResolvedValue({ ...hearing });
		// @ts-ignore
		databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/hearing/:hearingId', () => {
		describe('GET', () => {
			test('gets a single hearing', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

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
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if hearingId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/hearing/hearingId`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingId: 'must be a number' }
				});
			});
		});

		describe('PATCH', () => {
			test('updates a single hearing with address', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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

				expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							create: omit(hearing.address, 'id')
						}
					},
					where: {
						id: hearing.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Hearing address updated to 96 The Avenue, Leftfield, MD21 5XY',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(response.status).toEqual(201);
			});

			test('updates a single hearing with addressId', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						addressId: 42
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address: {
							connect: {
								id: 42
							}
						}
					},
					where: {
						id: hearing.id
					}
				});

				expect(response.status).toEqual(201);
			});

			test('updates a single hearing with no address or hearingEndTime', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({ hearingStartTime: '2999-01-02T12:00:00.000Z' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: '2999-01-02T12:00:00.000Z',
						hearingEndTime: undefined
					},
					where: {
						id: hearing.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Hearing date updated to 2 January 2999',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(response.status).toEqual(201);
			});

			test('removes the address if address is null', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({ hearingStartTime: hearing.hearingStartTime, address: null })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: undefined,
						address: {
							disconnect: true
						}
					},
					where: {
						id: hearing.id
					}
				});

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals//hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/appealId/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if hearingId is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if hearingId is not a number', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/hearingId`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingId: 'must be a number' }
				});
			});

			test('returns an error if hearingStartTime is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingEndTime: hearing.hearingEndTime,
						address
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: 'hearingStartTime',
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('does not return an error if hearingEndTime is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({ hearingStartTime: hearing.hearingStartTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if hearingEndTime is not a valid date', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: 'hearingEndTime',
						address
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
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
			test('creates a single hearing with address', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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

				expect(databaseConnector.hearing.create).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: hearing.hearingStartTime.toISOString(),
						hearingEndTime: hearing.hearingEndTime.toISOString(),
						address: {
							create: omit(hearing.address, 'id')
						}
					}
				});
				['Hearing set up on 1 January 2999', 'The hearing address has been added'].forEach(
					(details) => {
						expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
							data: {
								appealId: fullPlanningAppeal.id,
								details,
								loggedAt: expect.any(Date),
								userId: 1
							}
						});
					}
				);

				expect(response.status).toEqual(201);
			});

			test('creates a single hearing with no address or hearingEndTime', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.send({ hearingStartTime: hearing.hearingStartTime })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.hearing.create).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						hearingStartTime: hearing.hearingStartTime.toISOString(),
						hearingEndTime: undefined
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Hearing set up on 1 January 2999',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if appealId is not a number', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/appealId/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						hearingEndTime: hearing.hearingEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if hearingStartTime is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.send({ hearingEndTime: hearing.hearingEndTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hearingStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if hearingStartTime is not a valid date', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.send({
						hearingEndTime: hearing.hearingEndTime,
						address,
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

			test('does not return an error if hearingEndTime is not provided', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.send({ hearingStartTime: hearing.hearingStartTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if hearingEndTime is not a valid date', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
					.send({
						hearingStartTime: hearing.hearingStartTime,
						address,
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
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

		describe('DELETE', () => {
			test('deletes a single hearing', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({ ...fullPlanningAppeal, hearing });

				const response = await request
					.delete(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);

				expect(databaseConnector.hearing.delete).toHaveBeenCalledWith({
					where: {
						id: hearing.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Hearing cancelled',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { hearing } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/BUSSIN/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if hearingId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/${fullPlanningAppeal.id}/hearing/BUSSIN`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingId: 'must be a number' }
				});
			});

			test('returns an error if the hearing has already occurred', async () => {
				const appeal = {
					...fullPlanningAppeal,
					hearing: {
						...fullPlanningAppeal.hearing,
						hearingStartTime: new Date('2020-01-01')
					}
				};
				const { hearing } = appeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

				const response = await request
					.delete(`/appeals/${appeal.id}/hearing/${hearing.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { hearingStartTime: 'must be in the future' }
				});
			});
		});
	});
});
