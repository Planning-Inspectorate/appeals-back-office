// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import * as SUPPORT_CONSTANTS from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal rule 6 parties routes', () => {
	/** @type {typeof fullPlanningAppealData} */
	let fullPlanningAppeal;

	const rule6Party = {
		id: 385,
		appealId: fullPlanningAppealData.id,
		serviceUserId: 473,
		serviceUser: {
			id: 473,
			organisationName: 'Test Organisation',
			email: 'test@example.com'
		}
	};

	const appealId = fullPlanningAppealData.id;

	beforeEach(() => {
		fullPlanningAppeal = JSON.parse(JSON.stringify(fullPlanningAppealData));
		fullPlanningAppeal.appealTimetable = {
			lpaStatementDueDate: '2025-05-01T00:00:00.000Z',
			proofOfEvidenceAndWitnessesDueDate: '2025-06-01T00:00:00.000Z'
		};

		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue({
			...fullPlanningAppeal,
			appealRule6Parties: [rule6Party]
		});
		// @ts-ignore
		databaseConnector.user.upsert.mockResolvedValue({ id: 1 });
		// @ts-ignore
		databaseConnector.team.findUnique.mockResolvedValue({
			email: 'team@email.com'
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
			test('creates a single rule 6 party and sends emails', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				databaseConnector.appealRule6Party.create.mockResolvedValue({
					appealId: fullPlanningAppeal.id,
					id: 10,
					serviceUserId: 20
				});

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

				expect(mockBroadcasters.broadcastServiceUser).toHaveBeenCalledWith(
					20,
					'Create',
					'Rule6Party',
					fullPlanningAppeal.reference
				);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appealId,
						details: stringTokenReplacement(SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_ADDED, [
							'Test Organisation'
						]),
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appealId,
						details: SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_ADDED_EMAILS_SENT,
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					templateName: 'rule-6-status-accepted-rule-6-party',
					notifyClient: expect.anything(),
					recipientEmail: 'test@example.com',
					personalisation: {
						appeal_reference_number: fullPlanningAppeal.reference,
						lpa_reference: fullPlanningAppeal.applicationReference,
						site_address: expect.stringContaining('Maidstone'),
						statements_due_date: '1 May 2025',
						proofs_due_date: '1 June 2025',
						team_email_address: 'team@email.com'
					}
				});
				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					templateName: 'rule-6-status-accepted-main-parties',
					notifyClient: expect.anything(),
					recipientEmail: fullPlanningAppeal.agent.email,
					personalisation: {
						appeal_reference_number: fullPlanningAppeal.reference,
						lpa_reference: fullPlanningAppeal.applicationReference,
						site_address: expect.stringContaining('Maidstone'),
						rule_6_organisation: 'Test Organisation',
						team_email_address: 'team@email.com'
					}
				});

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					templateName: 'rule-6-status-accepted-main-parties',
					notifyClient: expect.anything(),
					recipientEmail: fullPlanningAppeal.lpa.email,
					personalisation: {
						appeal_reference_number: fullPlanningAppeal.reference,
						lpa_reference: fullPlanningAppeal.applicationReference,
						site_address: expect.stringContaining('Maidstone'),
						rule_6_organisation: 'Test Organisation',
						team_email_address: 'team@email.com'
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

	describe('/:appealId/rule-6-parties/:rule6PartyId', () => {
		describe('PATCH', () => {
			test('updates a rule 6 party and sends email', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					appealRule6Parties: [rule6Party]
				});
				// @ts-ignore
				databaseConnector.appealRule6Party.update.mockResolvedValue({
					...rule6Party,
					serviceUser: { organisationName: 'Test Organisation', email: 'test@example.com' }
				});

				const response = await request
					.patch(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
					.send({
						serviceUser: { organisationName: 'Test Organisation', email: 'test@example.com' }
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealRule6Party.update).toHaveBeenCalledWith({
					where: {
						id: Number(rule6Party.id)
					},
					data: {
						serviceUser: {
							update: {
								organisationName: 'Test Organisation',
								email: 'test@example.com'
							}
						}
					},
					select: {
						id: true,
						appealId: true,
						serviceUserId: true,
						serviceUser: {
							select: {
								id: true,
								organisationName: true,
								email: true
							}
						}
					}
				});

				expect(mockBroadcasters.broadcastServiceUser).toHaveBeenCalledWith(
					rule6Party.serviceUserId,
					'Update',
					'Rule6Party',
					fullPlanningAppeal.reference
				);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appealId,
						details: stringTokenReplacement(
							SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_DETAILS_UPDATED,
							['Test Organisation']
						),
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					templateName: 'rule-6-party-updated',
					notifyClient: expect.anything(),
					recipientEmail: 'test@example.com',
					personalisation: {
						appeal_reference_number: fullPlanningAppeal.reference,
						lpa_reference: fullPlanningAppeal.applicationReference,
						site_address: expect.stringContaining('Maidstone'),
						rule_6_organisation: 'Test Organisation',
						team_email_address: 'team@email.com'
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					...rule6Party,
					serviceUser: { organisationName: 'Test Organisation', email: 'test@example.com' }
				});
			});

			test('returns an error if appealId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/appealId/rule-6-parties/1`)
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

			test('returns an error if rule6PartyId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${appealId}/rule-6-parties/rule6PartyId`)
					.send({
						serviceUser: {
							organisationName: 'Test Organisation',
							email: 'test@example.com'
						}
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { rule6PartyId: 'must be a number' }
				});
			});

			test('returns an error if organisationName is not provided', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.patch(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
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
					.patch(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
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
					.patch(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
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
					.patch(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
					.send({ serviceUser: { organisationName: 'Test Organisation', email: 'test@blah@com' } })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { 'serviceUser.email': 'must be a valid email' }
				});
			});
		});

		describe('DELETE', () => {
			test('deletes a rule 6 party', async () => {
				// @ts-ignore
				databaseConnector.appealRule6Party.findUnique.mockResolvedValue(rule6Party);
				// @ts-ignore
				databaseConnector.appealRule6Party.delete.mockResolvedValue({
					appealId,
					serviceUserId: Number(rule6Party.serviceUserId)
				});

				const response = await request
					.delete(`/appeals/${appealId}/rule-6-parties/${rule6Party.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealRule6Party.findUnique).toHaveBeenCalledWith({
					where: { id: Number(rule6Party.id) },
					select: {
						id: true,
						appealId: true,
						serviceUserId: true,
						serviceUser: {
							select: {
								id: true,
								organisationName: true,
								salutation: true,
								firstName: true,
								middleName: true,
								lastName: true,
								email: true,
								website: true,
								phoneNumber: true,
								addressId: true
							}
						}
					}
				});

				expect(databaseConnector.appealRule6Party.delete).toHaveBeenCalledWith({
					where: { id: Number(rule6Party.id) }
				});

				expect(mockBroadcasters.broadcastServiceUser).toHaveBeenCalledWith(
					rule6Party.serviceUserId,
					'Delete',
					'Rule6Party',
					fullPlanningAppeal.reference
				);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appealId,
						details: stringTokenReplacement(SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_REMOVED, [
							'Test Organisation'
						]),
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					appealId: appealId,
					serviceUserId: rule6Party.serviceUserId
				});
			});

			test('returns an error if appealId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/appealId/rule-6-parties/1`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { appealId: 'must be a number' }
				});
			});

			test('returns an error if rule6PartyId is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.delete(`/appeals/${appealId}/rule-6-parties/rule6PartyId`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { rule6PartyId: 'must be a number' }
				});
			});
		});
	});
});
