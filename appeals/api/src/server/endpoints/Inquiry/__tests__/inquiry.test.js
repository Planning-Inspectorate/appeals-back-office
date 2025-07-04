// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';

import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('inquiry routes', () => {
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
	const inquiry = {
		...fullPlanningAppealData.inquiry,
		inquiryStartTime: new Date('2999-01-01T12:00:00.000Z'),
		inquiryEndTime: new Date('2999-01-01T13:00:00.000Z')
	};

	beforeEach(() => {
		fullPlanningAppeal = JSON.parse(JSON.stringify(fullPlanningAppealData));
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue({
			inquiry,
			fullPlanningAppeal
		});
		// @ts-ignore
		databaseConnector.inquiry.findUnique.mockResolvedValue({ ...inquiry });
		// @ts-ignore
		databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/inquiry/:inquiryId', () => {
		describe('GET', () => {
			test('gets a single inquiry', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inquiryId: inquiry.id,
					appealId: inquiry.appealId,
					inquiryStartTime: inquiry.inquiryStartTime,
					inquiryEndTime: inquiry.inquiryEndTime,
					addressId: inquiry.addressId,
					address: inquiry.address
				});
			});

			test('returns an error if appealId is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/appealId/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if inquiryId is not provided', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if inquiryId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/inquiry/inquiryId`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { inquiryId: 'must be a number' }
				});
			});
		});

		describe('PATCH', () => {
			const inquiryAddress = {
				addressLine1: 'Court 2',
				addressLine2: '24 Court Street',
				country: 'United Kingdom',
				county: 'Test County',
				postcode: 'AB12 3CD',
				town: 'Test Town'
			};
			const inquiry = {
				id: 1,
				inquiryStartTime: new Date('2999-01-01T12:00:00.000Z'),
				inquiryEndTime: new Date('2999-01-01T13:00:00.000Z'),
				address: {
					addressLine1: inquiryAddress.addressLine1,
					addressLine2: inquiryAddress.addressLine2,
					addressTown: inquiryAddress.town,
					addressCounty: inquiryAddress.county,
					postcode: inquiryAddress.postcode,
					addressCountry: inquiryAddress.country
				}
			};

			test('updates a single inquiry with address', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						inquiryEndTime: '2999-01-01T13:00:00.000Z',
						address: inquiryAddress
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						inquiryEndTime: '2999-01-01T13:00:00.000Z',
						address: {
							create: {
								addressLine1: inquiryAddress.addressLine1,
								addressLine2: inquiryAddress.addressLine2,
								addressTown: inquiryAddress.town,
								addressCounty: inquiryAddress.county,
								postcode: inquiryAddress.postcode,
								addressCountry: inquiryAddress.country
							}
						}
					},
					where: {
						id: inquiry.id
					},
					include: {
						address: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details:
							'Inquiry address updated to Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					inquiry_date: '1 January 2999',
					inquiry_time: '12:00pm',
					inquiry_address:
						'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom'
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'inquiry-updated'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'inquiry-updated'
				});

				expect(response.status).toEqual(201);
			});

			test('updates a single inquiry with addressId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						inquiryEndTime: '2999-01-01T13:00:00.000Z',
						addressId: 42
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						inquiryEndTime: '2999-01-01T13:00:00.000Z',
						address: {
							connect: {
								id: 42
							}
						}
					},
					where: {
						id: inquiry.id
					},
					include: {
						address: true
					}
				});

				expect(response.status).toEqual(201);
			});

			test('updates a single inquiry with no address or inquiryEndTime', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: '2999-01-02T12:00:00.000Z' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-02T12:00:00.000Z',
						inquiryEndTime: undefined
					},
					where: {
						id: inquiry.id
					},
					include: {
						address: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Inquiry date updated to 2 January 2999',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					inquiry_date: '2 January 2999',
					inquiry_time: '12:00pm',
					inquiry_address:
						'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom'
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'inquiry-updated'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'inquiry-updated'
				});

				expect(response.status).toEqual(201);
			});

			test('removes the address if address is null', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue({ ...inquiry, address: null });

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: inquiry.inquiryStartTime, address: null })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: undefined,
						address: {
							disconnect: true
						}
					},
					where: {
						id: inquiry.id
					},
					include: {
						address: true
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals//inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});

			test('returns an error if appealId is not a number', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/appealId/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if inquiryId is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if inquiryId is not a number', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/inquiryId`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { inquiryId: 'must be a number' }
				});
			});

			test('returns an error if inquiryStartTime is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryStartTime: 'must be a valid utc date time format'
					}
				});
			});
			test('returns an error if inquiryStartTime is not a valid date', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: 'inquiryStartTime',
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('does not return an error if inquiryEndTime is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: inquiry.inquiryStartTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if inquiryEndTime is not a valid date', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: 'inquiryEndTime',
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryEndTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if addressLine1 is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: 123,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: 'a'.repeat(251),
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: 123,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: 'a'.repeat(251),
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: 123,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: 'a'.repeat(251),
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: 123,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: 'a'.repeat(251),
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 123,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 'a'.repeat(9),
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 'ZZ999XZZ',
							town: inquiry.address.addressTown
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

	describe('/:appealId/inquiry', () => {
		describe('POST', () => {
			const inquiryAddress = {
				addressLine1: 'Court 2',
				addressLine2: '24 Court Street',
				country: 'United Kingdom',
				county: 'Test County',
				postcode: 'AB12 3CD',
				town: 'Test Town'
			};

			test('creates a single inquiry with address', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: '2999-01-01T13:00:00.000Z',
						address: inquiryAddress
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.create).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-01T13:00:00.000Z',
						inquiryEndTime: undefined,
						address: {
							create: {
								addressLine1: inquiryAddress.addressLine1,
								addressLine2: inquiryAddress.addressLine2,
								addressTown: inquiryAddress.town,
								addressCounty: inquiryAddress.county,
								postcode: inquiryAddress.postcode,
								addressCountry: inquiryAddress.country
							}
						}
					}
				});
				['Inquiry set up on 1 January 2999', 'The inquiry address has been added'].forEach(
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
				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					inquiry_date: '1 January 2999',
					inquiry_time: '1:00pm',
					inquiry_address:
						'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom'
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'inquiry-set-up'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'inquiry-set-up'
				});

				expect(response.status).toEqual(201);
			});

			test('creates a single inquiry with no address or inquiryEndTime', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({ inquiryStartTime: inquiry.inquiryStartTime })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.create).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: inquiry.inquiryStartTime.toISOString(),
						inquiryEndTime: undefined
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Inquiry set up on 1 January 2999',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(405);
				expect(response.body).toEqual({
					errors: 'Method is not allowed'
				});
			});
			test('returns an error if appealId is not a number', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/appealId/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if inquiryStartTime is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({ inquiryEndTime: inquiry.inquiryEndTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if inquiryStartTime is not a valid date', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryEndTime: inquiry.inquiryEndTime,
						address,
						inquiryStartTime: 'inquiryStartTime'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryStartTime: 'must be a valid utc date time format'
					}
				});
			});

			test('does not return an error if inquiryEndTime is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({ inquiryStartTime: inquiry.inquiryStartTime, address })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
			});

			test('returns an error if inquiryEndTime is not a valid date', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						address,
						inquiryEndTime: 'inquiryEndTime'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inquiryEndTime: 'must be a valid utc date time format'
					}
				});
			});

			test('returns an error if addressLine1 is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: 123,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: 'a'.repeat(251),
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: 123,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: 'a'.repeat(251),
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: 123,
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: 'a'.repeat(251),
							county: inquiry.address.addressCounty,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: 123,
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: 'a'.repeat(251),
							postcode: inquiry.address.postcode,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 123,
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 'a'.repeat(9),
							town: inquiry.address.addressTown
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
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						inquiryStartTime: inquiry.inquiryStartTime,
						inquiryEndTime: inquiry.inquiryEndTime,
						address: {
							addressLine1: inquiry.address.addressLine1,
							addressLine2: inquiry.address.addressLine2,
							country: inquiry.address.addressCountry,
							county: inquiry.address.addressCounty,
							postcode: 'ZZ999XZZ',
							town: inquiry.address.addressTown
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
			test('deletes a single inquiry', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({ ...fullPlanningAppeal, inquiry });

				const response = await request
					.delete(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.delete).toHaveBeenCalledWith({
					where: {
						id: inquiry.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Inquiry cancelled',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				const personalisation = {
					appeal_reference_number: '1345264',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482'
				};

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.appellant.email,
					templateName: 'inquiry-cancelled'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation,
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'inquiry-cancelled'
				});

				expect(response.status).toEqual(200);
			});

			test('returns an error if appealId is not a number', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/BUSSIN/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if inquiryId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/${fullPlanningAppeal.id}/inquiry/BUSSIN`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { inquiryId: 'must be a number' }
				});
			});

			test('returns an error if the inquiry has already occurred', async () => {
				const appeal = {
					...fullPlanningAppeal,
					inquiry: {
						...fullPlanningAppeal.inquiry,
						inquiryStartTime: new Date('2020-01-01')
					}
				};
				const { inquiry } = appeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

				const response = await request
					.delete(`/appeals/${appeal.id}/inquiry/${inquiry.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { inquiryStartTime: 'must be in the future' }
				});
			});
		});
	});
});
