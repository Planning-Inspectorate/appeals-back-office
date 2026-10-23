// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	fullPlanningAppeal as fullPlanningAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import {
	addStatusesToLinkedAppeals,
	getIdsOfLinkedGroup
} from '#tests/shared/site-visits-test-helpers.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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
					estimatedDays: hearing.estimatedDays,
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
			const hearingAddress = {
				addressLine1: 'Court 2',
				addressLine2: '24 Court Street',
				country: 'United Kingdom',
				county: 'Test County',
				postcode: 'AB12 3CD',
				town: 'Test Town'
			};
			const hearing = {
				id: 1,
				hearingStartTime: new Date('2999-01-01T12:00:00.000Z'),
				hearingEndTime: new Date('2999-01-01T13:00:00.000Z'),
				address: {
					addressLine1: hearingAddress.addressLine1,
					addressLine2: hearingAddress.addressLine2,
					addressTown: hearingAddress.town,
					addressCounty: hearingAddress.county,
					postcode: hearingAddress.postcode,
					addressCountry: hearingAddress.country
				}
			};

			const getFullPlanningAppeal = () => JSON.parse(JSON.stringify(fullPlanningAppealData));
			const getEnforcementLeadAppeal = () =>
				JSON.parse(
					JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
				);

			describe.each([
				['single hearing', getFullPlanningAppeal],
				['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
			])('%s', (_, getAppeal) => {
				let appeal;
				let idsOfLinkedGroup;
				let sizeOfLinkedGroup;

				beforeEach(() => {
					appeal = getAppeal();
					idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
					sizeOfLinkedGroup = idsOfLinkedGroup.length;
				});
				afterEach(() => {
					jest.clearAllMocks();
				});

				test('updates a hearing with address', async () => {
					appeal.currentStatus = APPEAL_CASE_STATUS.EVENT;
					appeal.appealStatus = [
						{
							status: APPEAL_CASE_STATUS.EVENT,
							valid: true
						}
					];
					addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						hearing: { ...hearing, addressId: null, address: null }
					});
					databaseConnector.hearing.update.mockResolvedValue({ ...hearing, appealId: appeal.id });
					databaseConnector.appealStatus.findFirst.mockImplementation(() => {
						return {
							id: 1,
							status: APPEAL_CASE_STATUS.EVENT,
							createdAt: '2025-09-18T10:07:15.406Z',
							valid: true,
							subStateMachineName: null,
							compoundStateName: null
						};
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.send({
							hearingStartTime: '2999-01-01T12:00:00.000Z',
							hearingEndTime: '2999-01-01T13:00:00.000Z',
							address: hearingAddress
						})
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
							where: {
								appealId: appealId
							},
							data: {
								hearingStartTime: '2999-01-01T12:00:00.000Z',
								hearingEndTime: '2999-01-01T13:00:00.000Z',
								address: {
									upsert: {
										create: {
											addressLine1: hearingAddress.addressLine1,
											addressLine2: hearingAddress.addressLine2,
											addressTown: hearingAddress.town,
											addressCounty: hearingAddress.county,
											postcode: hearingAddress.postcode,
											addressCountry: hearingAddress.country
										},
										update: {
											addressLine1: hearingAddress.addressLine1,
											addressLine2: hearingAddress.addressLine2,
											addressTown: hearingAddress.town,
											addressCounty: hearingAddress.county,
											postcode: hearingAddress.postcode,
											addressCountry: hearingAddress.country
										}
									}
								}
							},
							include: {
								address: true
							}
						});
						expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
							data: {
								appealId: appealId,
								createdAt: expect.any(Date),
								status: APPEAL_CASE_STATUS.AWAITING_EVENT,
								valid: true
							}
						});
					}

					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: 'The hearing address has been added',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});

					const personalisation = {
						appeal_reference_number: '1345264',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						lpa_reference: '48269/APP/2021/1482',
						hearing_date: '1 January 2999',
						hearing_time: '12:00pm',
						inspector_name: null,
						hearing_expected_days: '',
						hearing_address:
							'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						})
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: false },
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-updated'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: true },
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-updated'
					});

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

					expect(response.status).toEqual(201);
				});

				test('updates a hearing with no address or hearingEndTime', async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					databaseConnector.hearing.update.mockResolvedValue({ ...hearing, appealId: appeal.id });

					const response = await request
						.patch(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.send({ hearingStartTime: '2999-01-02T12:00:00.000Z' })
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
							where: {
								appealId
							},
							data: {
								hearingStartTime: '2999-01-02T12:00:00.000Z',
								hearingEndTime: undefined
							},
							include: {
								address: true
							}
						});
					}
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: 'Hearing date updated to 2 January 2999',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
					const personalisation = {
						appeal_reference_number: '1345264',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						lpa_reference: '48269/APP/2021/1482',
						hearing_date: '2 January 2999',
						hearing_time: '12:00pm',
						inspector_name: null,
						hearing_expected_days: '',
						hearing_address:
							'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						})
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: false },
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-updated'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: true },
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-updated'
					});

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

					expect(response.status).toEqual(201);
				});

				test('updates a hearing and sends notifications when no venue address is set', async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						hearing: {
							...hearing,
							addressId: null,
							address: null
						}
					});
					databaseConnector.hearing.update.mockResolvedValue({
						...hearing,
						appealId: appeal.id,
						hearingStartTime: new Date('2999-01-03T12:00:00.000Z'),
						addressId: null,
						address: null
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.send({ hearingStartTime: '2999-01-03T12:00:00.000Z' })
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
							where: {
								appealId: appealId
							},
							data: {
								hearingStartTime: '2999-01-03T12:00:00.000Z',
								hearingEndTime: undefined
							},
							include: {
								address: true
							}
						});
					}

					const personalisation = {
						appeal_reference_number: '1345264',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						lpa_reference: '48269/APP/2021/1482',
						hearing_date: '3 January 2999',
						hearing_time: '12:00pm',
						inspector_name: null,
						hearing_expected_days: '',
						hearing_address: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						})
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);
					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: false },
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-updated'
					});
					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: true },
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-updated'
					});

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

					expect(response.status).toEqual(201);
				});

				test('removes the address if address is null', async () => {
					const { hearing } = appeal;
					appeal.currentStatus = APPEAL_CASE_STATUS.AWAITING_EVENT;
					appeal.appealStatus = [
						{
							status: APPEAL_CASE_STATUS.EVENT,
							valid: false
						},
						{
							status: APPEAL_CASE_STATUS.AWAITING_EVENT,
							valid: true
						}
					];
					addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						hearing: { ...hearing, addressId: 1, address: hearingAddress }
					});
					databaseConnector.hearing.update.mockResolvedValue({
						...hearing,
						appealId: appeal.id,
						address: null
					});
					databaseConnector.appealStatus.findFirst.mockResolvedValue({
						id: 592,
						appealId: appeal.id,
						status: APPEAL_CASE_STATUS.EVENT,
						valid: false,
						createdAt: new Date('2999-01-01T12:00:00.000Z')
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.send({ hearingStartTime: hearing.hearingStartTime, address: null })
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.update).toHaveBeenCalledWith({
							where: {
								appealId: appealId
							},
							data: {
								hearingStartTime: hearing.hearingStartTime,
								hearingEndTime: undefined,
								address: {
									disconnect: true
								}
							},
							include: {
								address: true
							}
						});

						expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
							where: {
								appealId: appeal.id,
								createdAt: {
									gt: new Date('2999-01-01T12:00:00.000Z')
								}
							}
						});
					}

					expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(
						sizeOfLinkedGroup
					);

					expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(sizeOfLinkedGroup);

					expect(databaseConnector.appealStatus.update).toHaveBeenCalledWith({
						where: { id: 592 },
						data: { valid: true }
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

					expect(response.status).toEqual(201);
				});

				test('only creates the address added audit trail when the address is the only value updated', async () => {
					const existingHearing = {
						...hearing,
						hearingStartTime: new Date('2999-01-01T12:00:00.000Z'),
						hearingEndTime: new Date('2999-01-01T13:00:00.000Z'),
						addressId: null,
						address: null
					};

					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						hearing: existingHearing
					});
					databaseConnector.hearing.update.mockResolvedValue({
						...existingHearing,
						appealId: appeal.id,
						address: hearing.address
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.send({
							hearingStartTime: '2999-01-01T12:00:00.000Z',
							hearingEndTime: '2999-01-01T13:00:00.000Z',
							address: hearingAddress
						})
						.set('azureAdUserId', azureAdUserId);

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

					expect(response.status).toEqual(201);

					// The address added audit trail is the only one that should be created
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: 'The hearing address has been added',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
					// The hearing date audit trail should not be created
					expect(databaseConnector.auditTrail.create).not.toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: expect.stringContaining('Hearing date updated'),
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
				});
			});

			describe('validation', () => {
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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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
					databaseConnector.hearing.update.mockResolvedValue({
						...hearing,
						appealId: fullPlanningAppeal.id
					});

					const response = await request
						.patch(`/appeals/${fullPlanningAppeal.id}/hearing/${hearing.id}`)
						.send({ hearingStartTime: hearing.hearingStartTime, address })
						.set('azureAdUserId', azureAdUserId);

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Update'
					);

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

	describe('/:appealId/hearing', () => {
		describe('POST', () => {
			const hearingAddress = {
				addressLine1: 'Court 2',
				addressLine2: '24 Court Street',
				country: 'United Kingdom',
				county: 'Test County',
				postcode: 'AB12 3CD',
				town: 'Test Town'
			};
			const getFullPlanningAppeal = () => JSON.parse(JSON.stringify(fullPlanningAppealData));
			const getEnforcementLeadAppeal = () =>
				JSON.parse(
					JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
				);

			describe.each([
				['single appeal', getFullPlanningAppeal],
				['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
			])('%s', (_, getAppeal) => {
				let appeal;
				let idsOfLinkedGroup;
				let sizeOfLinkedGroup;
				const mockHearing = {
					id: 1,
					appealId: appeal.id,
					hearingStartTime: '2999-01-01T13:00:00.000Z',
					hearingEndTime: undefined
				};

				beforeEach(() => {
					appeal = getAppeal();
					idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
					sizeOfLinkedGroup = idsOfLinkedGroup.length;

					// // @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					databaseConnector.hearing.create.mockResolvedValue(mockHearing);
				});
				afterEach(() => {
					databaseConnector.appeal.findUnique.mockClear();
				});
				test('creates a hearing with address', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

					const response = await request
						.post(`/appeals/${appeal.id}/hearing`)
						.send({
							hearingStartTime: '2999-01-01T13:00:00.000Z',
							address: hearingAddress
						})
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.create).toHaveBeenCalledWith({
							data: {
								appeal: {
									connect: {
										id: appealId
									}
								},
								hearingStartTime: '2999-01-01T13:00:00.000Z',
								hearingEndTime: undefined,
								address: {
									create: {
										addressLine1: hearingAddress.addressLine1,
										addressLine2: hearingAddress.addressLine2,
										addressTown: hearingAddress.town,
										addressCounty: hearingAddress.county,
										postcode: hearingAddress.postcode,
										addressCountry: hearingAddress.country
									}
								}
							}
						});
					}
					['Hearing set up on 1 January 2999', 'The hearing address has been added'].forEach(
						(details) => {
							expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
								data: {
									appealId: appeal.id,
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
						hearing_date: '1 January 2999',
						hearing_time: '1:00pm',
						inspector_name: null,
						hearing_expected_days: '',
						hearing_address:
							'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						})
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: false },
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-set-up'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: true },
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-set-up'
					});

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledTimes(sizeOfLinkedGroup);
					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						mockHearing.id,
						'hearing',
						'Create'
					);

					expect(response.status).toEqual(201);
				});

				test('creates a hearing with no address or hearingEndTime', async () => {
					const response = await request
						.post(`/appeals/${appeal.id}/hearing`)
						.send({ hearingStartTime: hearing.hearingStartTime })
						.set('azureAdUserId', azureAdUserId);

					for (const appealId of idsOfLinkedGroup) {
						expect(databaseConnector.hearing.create).toHaveBeenCalledWith({
							data: {
								appeal: {
									connect: {
										id: appealId
									}
								},
								hearingStartTime: hearing.hearingStartTime.toISOString(),
								hearingEndTime: undefined
							}
						});
					}
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: 'Hearing set up on 1 January 2999',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});

					const personalisation = {
						appeal_reference_number: '1345264',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						lpa_reference: '48269/APP/2021/1482',
						hearing_date: '1 January 2999',
						hearing_time: '12:00pm',
						inspector_name: null,
						hearing_expected_days: '',
						hearing_address: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						})
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);
					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: false },
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-set-up'
					});
					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: { ...personalisation, is_lpa: true },
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-set-up'
					});

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledTimes(sizeOfLinkedGroup);
					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						mockHearing.id,
						'hearing',
						'Create'
					);

					expect(response.status).toEqual(201);
				});

				test('creates a hearing when in hearing ready to set up and transitions to awaiting hearing', async () => {
					appeal.currentStatus = APPEAL_CASE_STATUS.EVENT;
					appeal.appealStatus = [
						{
							id: 1,
							status: APPEAL_CASE_STATUS.EVENT,
							createdAt: '2025-09-18T10:07:15.406Z',
							valid: true,
							appealId: appeal.id,
							subStateMachineName: null,
							compoundStateName: null
						}
					];
					addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

					databaseConnector.appealStatus.findFirst.mockImplementation(() => {
						return {
							id: 1,
							status: APPEAL_CASE_STATUS.EVENT,
							createdAt: '2025-09-18T10:07:15.406Z',
							valid: true,
							subStateMachineName: null,
							compoundStateName: null
						};
					});

					// mock appealStatus.update and appealStatus.create to return the new status
					databaseConnector.appealStatus.updateMany.mockResolvedValue({
						id: 1,
						status: APPEAL_CASE_STATUS.EVENT,
						valid: false
					});

					databaseConnector.appealStatus.create.mockResolvedValue({
						id: 2,
						status: APPEAL_CASE_STATUS.AWAITING_EVENT,
						valid: true
					});

					const response = await request
						.post(`/appeals/${appeal.id}/hearing`)
						.send({ hearingStartTime: hearing.hearingStartTime, address })
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledTimes(
						sizeOfLinkedGroup
					);
					expect(databaseConnector.appealStatus.create).toHaveBeenCalledTimes(sizeOfLinkedGroup);

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledTimes(sizeOfLinkedGroup);
					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						mockHearing.id,
						'hearing',
						'Create'
					);

					expect(response.status).toEqual(201);
				});
			});

			describe('validation', () => {
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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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
					databaseConnector.hearing.create.mockResolvedValue(hearing);

					const response = await request
						.post(`/appeals/${fullPlanningAppeal.id}/hearing`)
						.send({ hearingStartTime: hearing.hearingStartTime, address })
						.set('azureAdUserId', azureAdUserId);

					expect(mockBroadcasters.broadcastEvent).toHaveBeenCalledWith(
						hearing.id,
						'hearing',
						'Create'
					);

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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

					expect(mockBroadcasters.broadcastEvent).not.toHaveBeenCalled();

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
			const getFullAppeal = () => JSON.parse(JSON.stringify(fullPlanningAppealData));

			const getEnforcementLeadAppeal = () =>
				JSON.parse(
					JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
				);

			describe.each([
				['single appeal', getFullAppeal],
				['linked appeals - enforcement multiple appellants', getEnforcementLeadAppeal]
			])('%s', (_, getAppeal) => {
				let appeal = getAppeal();
				let idsOfLinkedGroup;
				let sizeOfLinkedGroup;

				beforeEach(() => {
					appeal = getAppeal();
					idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
					sizeOfLinkedGroup = idsOfLinkedGroup.length;

					// // @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({ ...appeal, hearing });
					databaseConnector.hearing.findMany.mockResolvedValue([hearing]);
				});
				afterEach(() => {
					databaseConnector.appeal.findUnique.mockClear();
				});

				test('deletes a single hearing', async () => {
					const response = await request
						.delete(`/appeals/${appeal.id}/hearing/${hearing.id}`)
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.hearing.deleteMany).toHaveBeenCalledWith({
						where: {
							appealId: { in: idsOfLinkedGroup }
						}
					});

					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: 'Hearing cancelled',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});

					const personalisation = {
						appeal_reference_number: '1345264',
						...(appeal.appellantCase.enforcementReference && {
							enforcement_reference: appeal.appellantCase.enforcementReference
						}),
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						lpa_reference: '48269/APP/2021/1482',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					};

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation,
						recipientEmail: appeal.agent.email,
						templateName: 'hearing-cancelled'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation,
						recipientEmail: appeal.lpa.email,
						templateName: 'hearing-cancelled'
					});

					expect(response.status).toEqual(200);
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
});
