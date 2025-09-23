// @ts-nocheck

import { request } from '#tests/../app-test.js';
import { mocks } from '#tests/appeals/index.js';
import { caseTeams } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
const { databaseConnector } = await import('#utils/database-connector.js');

const householdAppeal = mocks.householdAppeal;
const teeamIdNumericErrorMessage = 'teamId must be a number equal to or greater than 0';
const teamIdRequiredErrorMessage = 'teamId is required';

describe('case team routes', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET', () => {
		describe('case-teams', () => {
			it('returns empty object when there are no teams', async () => {
				databaseConnector.team.findMany.mockResolvedValue({});

				const response = await request
					.get(`/appeals/case-teams`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});

			it('should return an array of case teams when case teams found', async () => {
				databaseConnector.team.findMany.mockResolvedValue(caseTeams);

				const response = await request
					.get(`/appeals/case-teams`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(caseTeams);
			});
		});
	});
	describe('PATCH', () => {
		describe(':appealId/case-team', () => {
			it(`returns error message when teamId isn't present`, async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { teamId: teamIdRequiredErrorMessage } });
			});

			it(`returns error message when teamId isn't is null`, async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({ teamId: null })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { teamId: teeamIdNumericErrorMessage } });
			});

			it(`returns error message when teamId isn't is a string`, async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({ teamId: 'a string' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { teamId: teeamIdNumericErrorMessage } });
			});

			it(`returns error message when teamId is less than 0`, async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.appeal.update.mockResolvedValue({ teamId: -1 });

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({ teamId: -1 })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						teamId: 'teamId must be a number equal to or greater than 0'
					}
				});
			});

			it(`returns teamId of null when 0 is provided`, async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.appeal.update.mockResolvedValue({ assignedTeamId: null });

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({ teamId: 0 })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.id },
					data: { assignedTeamId: null }
				});
				expect(response.body).toEqual({ assignedTeamId: null });
			});

			it('returns valid assigned team Id when valid teamId is provided', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.appeal.update.mockResolvedValue({ assignedTeamId: 1 });
				databaseConnector.team.findUnique.mockResolvedValue({ id: 1, name: 'Team 1' });
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				const response = await request
					.patch(`/appeals/${householdAppeal.id}/case-team`)
					.send({ teamId: 1 })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.id },
					data: { assignedTeamId: 1 }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: 'Case team Team 1 assigned',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				expect(response.body).toEqual({ assignedTeamId: 1 });
			});

			it('returns valid assigned team Id when valid teamId is provided and there are linked appeals', async () => {
				const leadAppeal = structuredClone(householdAppeal);
				leadAppeal.childAppeals = [
					{ childId: 10, parentId: 1 },
					{ childId: 20, parentId: 1 }
				];
				databaseConnector.appeal.findUnique.mockResolvedValue(leadAppeal);
				databaseConnector.appealRelationship.findMany.mockResolvedValue(leadAppeal.childAppeals);
				databaseConnector.appeal.update.mockResolvedValue({ assignedTeamId: 1 });

				const response = await request
					.patch(`/appeals/${leadAppeal.id}/case-team`)
					.send({ teamId: 1 })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(3);

				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(1, {
					where: { id: leadAppeal.id },
					data: { assignedTeamId: 1 }
				});

				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(2, {
					where: { id: leadAppeal.childAppeals[0].childId },
					data: { assignedTeamId: 1 }
				});

				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(3, {
					where: { id: leadAppeal.childAppeals[1].childId },
					data: { assignedTeamId: 1 }
				});

				expect(response.body).toEqual({ assignedTeamId: 1 });
			});
		});
	});
});
