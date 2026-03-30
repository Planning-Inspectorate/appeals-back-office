// @ts-nocheck
import { request } from '#server/app-test.js';
import { householdAppeal, householdAppealAgent } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_LPA_UPDATED,
	CASE_RELATIONSHIP_LINKED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const validLPA = {
	id: 1,
	name: 'Maidstone Borough Council',
	lpaCode: 'MAID',
	email: 'maid@lpa-email.gov.uk'
};

const newLPA = {
	id: 48,
	name: 'Test Council',
	lpaCode: 'TEST',
	email: 'test2@example.com'
};

describe('local-planning-authorities', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET /local-planning-authorities', () => {
		test('returns 200 when getting list of LPAs', async () => {
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);

			const response = await request
				.get(`/appeals/local-planning-authorities`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.lPA.findMany).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual([validLPA, newLPA]);
		});
	});

	describe('POST /:appealId/lpa', () => {
		test('returns 200 if valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(newLPA);

			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/lpa`)
				.send({
					newLpaId: 48
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					lpaId: 48,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: householdAppeal.id
				}
			});
			expect(mockNotifySend).toHaveBeenCalledTimes(2);
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId,
				templateName: 'lpa-changed-appellant',
				notifyClient: expect.anything(),
				recipientEmail: householdAppeal.appellant.email,
				personalisation: {
					appeal_reference_number: householdAppeal.reference,
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					local_planning_authority: newLPA.name,
					lpa_reference: householdAppeal.applicationReference || ''
				}
			});
			databaseConnector.lPA.findUnique.mockResolvedValue(validLPA);

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId,
				templateName: 'lpa-removed',
				notifyClient: expect.anything(),
				recipientEmail: validLPA.email,
				personalisation: {
					appeal_reference_number: householdAppeal.reference,
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					local_planning_authority: newLPA.name,
					lpa_reference: householdAppeal.applicationReference || ''
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLPA.name]),
					loggedAt: expect.any(Date),
					userId: 1
				}
			});

			expect(response.status).toEqual(200);
		});

		test('returns 200 if valid request and no appellant details', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAgent);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(newLPA);

			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/lpa`)
				.send({
					newLpaId: 48
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					lpaId: 48,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: householdAppeal.id
				}
			});
			expect(mockNotifySend).toHaveBeenCalledTimes(2);
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId,
				templateName: 'lpa-changed-appellant',
				notifyClient: expect.anything(),
				recipientEmail: householdAppeal.agent.email,
				personalisation: {
					appeal_reference_number: householdAppeal.reference,
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					local_planning_authority: newLPA.name,
					lpa_reference: householdAppeal.applicationReference || ''
				}
			});
			databaseConnector.lPA.findUnique.mockResolvedValue(validLPA);

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId,
				templateName: 'lpa-removed',
				notifyClient: expect.anything(),
				recipientEmail: validLPA.email,
				personalisation: {
					appeal_reference_number: householdAppeal.reference,
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					local_planning_authority: newLPA.name,
					lpa_reference: householdAppeal.applicationReference || ''
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLPA.name]),
					loggedAt: expect.any(Date),
					userId: 1
				}
			});

			expect(response.status).toEqual(200);
		});

		test('returns 200 if valid request with new LPA for linked appeals', async () => {
			const parentLinkedAppeal = {
				...householdAppeal,
				childAppeals: [
					{
						type: CASE_RELATIONSHIP_LINKED,
						child: {
							id: 99,
							reference: '1234599',
							agent: { id: 111 },
							appellant: { id: 222, email: 'test@example.com' }
						}
					}
				]
			};
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(parentLinkedAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(newLPA);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${parentLinkedAppeal.id}/lpa`)
				.send({
					newLpaId: 48
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(2);
			expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(1, {
				data: {
					lpaId: 48,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: parentLinkedAppeal.id
				}
			});
			expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(2, {
				data: {
					lpaId: 48,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: parentLinkedAppeal.childAppeals[0].child.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(2);
			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: parentLinkedAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLPA.name]),
					loggedAt: expect.any(Date),
					userId: 1
				}
			});
			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
				data: {
					appealId: parentLinkedAppeal.childAppeals[0].child.id,
					details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLPA.name]),
					loggedAt: expect.any(Date),
					userId: 1
				}
			});
			expect(response.status).toEqual(200);
		}, 30000);

		test('returns 400 if invalid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/lpa`)
				.send({
					newLpaId: 'some invalid text'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).not.toHaveBeenCalled();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});
	});
});
