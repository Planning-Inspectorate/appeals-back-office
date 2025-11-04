// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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
		inquiryEndTime: new Date('2999-01-01T13:00:00.000Z'),
		estimatedDays: 6
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

		const mockTx = {
			address: { create: jest.fn() },
			inquiry: { create: jest.fn() },
			inquiryEstimate: { create: jest.fn() },
			appealTimetable: { create: jest.fn() }
		};
		mockTx.address.create.mockResolvedValue({ id: 99, ...address });
		mockTx.inquiry.create.mockResolvedValue(inquiry);
		mockTx.inquiryEstimate.create.mockResolvedValue({ id: 1, estimatedTime: 9, appealId: 2 });
		mockTx.appealTimetable.create.mockResolvedValue({});
		databaseConnector.$transaction = jest.fn();
		databaseConnector.$transaction.mockResolvedValue({
			inquiry: {
				id: 2
			},
			timetableData: {
				lpaQuestionnaireDueDate: '2025-01-20',
				lpaStatementDueDate: '2025-01-21',
				appellantStatementDueDate: '2025-01-22',
				planningObligationDueDate: '2025-01-23',
				statementOfCommonGroundDueDate: '2025-01-24',
				ipCommentsDueDate: '2025-01-25',
				proofOfEvidenceAndWitnessesDueDate: '2025-01-26'
			}
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/inquiry', () => {
		let requestData = null;
		const inquiryAddress = {
			addressLine1: 'Court 2',
			addressLine2: '24 Court Street',
			country: 'United Kingdom',
			county: 'Test County',
			postcode: 'AB12 3CD',
			town: 'Test Town'
		};
		beforeEach(() => {
			requestData = {
				inquiryStartTime: '2999-01-01T13:00:00.000Z',
				address: inquiryAddress,
				ipCommentsDueDate: new Date('2999-01-01T14:00:00.000Z'),
				lpaQuestionnaireDueDate: new Date('2999-01-01T15:00:00.000Z'),
				planningObligationDueDate: new Date('2999-01-01T16:00:00.000Z'),
				proofOfEvidenceAndWitnessesDueDate: new Date('2999-01-01T17:00:00.000Z'),
				startDate: new Date('2999-01-01T18:00:00.000Z'),
				statementDueDate: new Date('2999-01-01T19:00:00.000Z'),
				statementOfCommonGroundDueDate: new Date('2999-01-01T20:00:00.000Z')
			};
		});

		describe('POST', () => {
			test('creates a single inquiry with address', async () => {
				fullPlanningAppeal.appealType.type = 'Planning appeal';

				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				// @ts-ignore
				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send(requestData)
					.set('azureAdUserId', azureAdUserId);

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
					appeal_type: 'Planning',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					lpa_reference: '48269/APP/2021/1482',
					inquiry_date: '1 January 2999',
					inquiry_time: '1:00pm',
					inquiry_address:
						'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					statement_of_common_ground_deadline: '24 January 2025',
					lpa_statement_deadline: '21 January 2025',
					planning_obligation_deadline: '23 January 2025',
					proof_of_evidence_and_witnesses_deadline: '26 January 2025',
					questionnaire_due_date: '20 January 2025',
					ip_comments_deadline: '25 January 2025',
					is_lpa: false,
					inquiry_expected_days: '',
					start_date: '1 January 2999'
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
					personalisation: { ...personalisation, is_lpa: true },
					recipientEmail: fullPlanningAppeal.lpa.email,
					templateName: 'inquiry-set-up'
				});

				expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(fullPlanningAppeal.id);
				expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(2, 'inquiry', 'Create');

				expect(response.status).toEqual(201);
			});

			test('creates a single inquiry with no address or inquiryEndTime', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({ ...requestData, inquiryStartTime: inquiry.inquiryStartTime })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: 'Inquiry set up on 1 January 2999',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(fullPlanningAppeal.id);

				expect(response.status).toEqual(201);
			});

			test('returns an error if appealId is not provided', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.post(`/appeals/inquiry`)
					.send({
						...requestData,
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
						...requestData,
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
					.send({
						...requestData,
						inquiryStartTime: undefined,
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
					.post(`/appeals/${fullPlanningAppeal.id}/inquiry`)
					.send({
						...requestData,
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
					.send({ ...requestData, inquiryStartTime: inquiry.inquiryStartTime, address })
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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
						...requestData,
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

	describe('/:appealId/inquiry/:inquiryId', () => {
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
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					appealStatus: [
						{
							status: APPEAL_CASE_STATUS.EVENT,
							valid: true
						}
					]
				});
				databaseConnector.inquiry.findUnique.mockResolvedValue({
					...inquiry,
					addressId: null,
					address: null
				});
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						inquiryEndTime: '2999-01-01T13:00:00.000Z',
						estimatedDays: 6,
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
						estimatedDays: 6,
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
				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						createdAt: expect.any(Date),
						status: 'awaiting_event',
						valid: true
					}
				});

				expect(response.status).toEqual(201);
			});

			test('updates a single inquiry with addressId', async () => {
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					appealStatus: [
						{
							status: APPEAL_CASE_STATUS.AWAITING_EVENT,
							valid: true
						}
					]
				});
				databaseConnector.inquiry.findUnique.mockResolvedValue({
					...inquiry,
					address: undefined,
					addressId: 99
				});

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: '2999-01-01T12:00:00.000Z',
						estimatedDays: 6,
						addressId: 42,
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
						estimatedDays: 6,
						inquiryEndTime: undefined,
						address: {
							update: {
								addressCountry: 'United Kingdom',
								addressCounty: 'Test County',
								addressLine1: 'Court 2',
								addressLine2: '24 Court Street',
								addressTown: 'Test Town',
								postcode: 'AB12 3CD'
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
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
			});

			test('updates a single inquiry with null address', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: '2999-01-02T12:00:00.000Z', estimatedDays: 6, address: null })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						address: {
							disconnect: true
						},
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-02T12:00:00.000Z',
						inquiryEndTime: undefined,
						estimatedDays: 6
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

			test('updates a single inquiry with no address', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: '2999-01-02T12:00:00.000Z', estimatedDays: 6 })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-02T12:00:00.000Z',
						inquiryEndTime: undefined,
						estimatedDays: 6
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

			test('removes the address if address is null', async () => {
				const { inquiry } = fullPlanningAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue({ ...inquiry, address: null });

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({ inquiryStartTime: inquiry.inquiryStartTime, estimatedDays: 6, address: null })
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
						estimatedDays: 6,
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

			test('updates a single inquiry with no estimation day', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.inquiry.update.mockResolvedValue(inquiry);

				const response = await request
					.patch(`/appeals/${fullPlanningAppeal.id}/inquiry/${inquiry.id}`)
					.send({
						inquiryStartTime: '2999-01-02T12:00:00.000Z',
						estimatedDays: null,
						address: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.inquiry.update).toHaveBeenCalledWith({
					data: {
						address: {
							disconnect: true
						},
						appeal: {
							connect: {
								id: fullPlanningAppeal.id
							}
						},
						inquiryStartTime: '2999-01-02T12:00:00.000Z',
						estimatedDays: null
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
				lpa_reference: '48269/APP/2021/1482',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					...personalisation,
					is_lpa: false
				},
				recipientEmail: fullPlanningAppeal.appellant.email,
				templateName: 'inquiry-cancelled'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.anything(),
				personalisation: {
					...personalisation,
					is_lpa: true
				},
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
