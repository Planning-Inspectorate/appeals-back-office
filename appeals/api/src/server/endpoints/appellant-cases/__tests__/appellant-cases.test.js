// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	STATE_TARGET_INVALID,
	LENGTH_8,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	STATE_TARGET_READY_TO_START
} from '../../constants.js';
import {
	appellantCaseIncompleteReasons,
	appellantCaseInvalidReasons,
	appellantCaseValidationOutcomes,
	azureAdUserId
} from '#tests/shared/mocks.js';
import {
	fullPlanningAppeal,
	fullPlanningAppealAppellantCaseIncomplete,
	fullPlanningAppealAppellantCaseInvalid,
	householdAppeal,
	householdAppealAppellantCaseIncomplete,
	householdAppealAppellantCaseInvalid,
	householdAppealAppellantCaseValid
} from '#tests/appeals/mocks.js';
import { baseExpectedAppellantCaseResponse } from '#tests/appeals/expectation.js';

import joinDateAndTime from '#utils/join-date-and-time.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('appellant cases routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.useRealTimers();
	});

	describe('/appeals/:appealId/appellant-cases/:appellantCaseId', () => {
		describe('GET', () => {
			test('gets a single appellant case for a household appeal with no validation outcome', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { appellantCase, id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(baseExpectedAppellantCaseResponse(householdAppeal));
			});

			test('gets a single appellant case for a valid household appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseValid);

				const { appellantCase } = householdAppealAppellantCaseValid;
				const response = await request
					.get(
						`/appeals/${householdAppealAppellantCaseValid.id}/appellant-cases/${appellantCase.id}`
					)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(
					baseExpectedAppellantCaseResponse(householdAppealAppellantCaseValid)
				);
			});

			test('gets a single appellant case for an incomplete household appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);

				const { appellantCase } = householdAppealAppellantCaseIncomplete;
				const response = await request
					.get(
						`/appeals/${householdAppealAppellantCaseIncomplete.id}/appellant-cases/${appellantCase.id}`
					)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(
					baseExpectedAppellantCaseResponse(householdAppealAppellantCaseIncomplete)
				);
			});

			test('gets a single appellant case for an invalid household appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseInvalid);

				const { appellantCase } = householdAppealAppellantCaseInvalid;
				const response = await request
					.get(
						`/appeals/${householdAppealAppellantCaseInvalid.id}/appellant-cases/${appellantCase.id}`
					)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(
					baseExpectedAppellantCaseResponse(householdAppealAppellantCaseInvalid)
				);
			});

			test('gets a single appellant case for a valid full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const { appellantCase } = fullPlanningAppeal;
				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(baseExpectedAppellantCaseResponse(fullPlanningAppeal));
			});

			test('gets a single appellant case for an incomplete full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(
					fullPlanningAppealAppellantCaseIncomplete
				);

				const { appellantCase } = fullPlanningAppealAppellantCaseIncomplete;
				const response = await request
					.get(
						`/appeals/${fullPlanningAppealAppellantCaseIncomplete.id}/appellant-cases/${appellantCase.id}`
					)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(
					baseExpectedAppellantCaseResponse(fullPlanningAppealAppellantCaseIncomplete)
				);
			});

			test('gets a single appellant case for an invalid full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(
					fullPlanningAppealAppellantCaseInvalid
				);

				const { appellantCase } = fullPlanningAppealAppellantCaseInvalid;
				const response = await request
					.get(
						`/appeals/${fullPlanningAppealAppellantCaseInvalid.id}/appellant-cases/${appellantCase.id}`
					)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(
					baseExpectedAppellantCaseResponse(fullPlanningAppealAppellantCaseInvalid)
				);
			});

			test('returns an error if appealId is not numeric', async () => {
				const { appellantCase } = householdAppeal;
				const response = await request
					.get(`/appeals/one/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if appealId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const { appellantCase } = householdAppeal;
				const response = await request
					.get(`/appeals/3/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if appellantCaseId is not numeric', async () => {
				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/one`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appellantCaseId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if appellantCaseId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/3`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appellantCaseId: ERROR_NOT_FOUND
					}
				});
			});
		});

		describe('PATCH', () => {
			test('updates appellant case when the validation outcome is Incomplete without reason text and an appeal due date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);

				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					validationOutcome: 'Incomplete'
				};
				const formattedAppealDueDate = joinDateAndTime(body.appealDueDate);
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id },
					data: {
						dueDate: formattedAppealDueDate,
						updatedAt: expect.any(Date)
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);

				const body = {
					incompleteReasons: [
						{
							id: 1,
							text: ['Reason 1', 'Reason 2']
						},
						{
							id: 2,
							text: ['Reason 3', 'Reason 4']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(databaseConnector.appellantCaseIncompleteReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseIncompleteReasonText.createMany).toHaveBeenCalledWith(
					{
						data: [
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason 1'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason 2'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason 3'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason 4'
							}
						]
					}
				);
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					invalidReasons: [
						{
							id: 1,
							text: ['Reason 1', 'Reason 2']
						},
						{
							id: 2,
							text: ['Reason 3', 'Reason 4']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 2
					}
				});
				expect(databaseConnector.appellantCaseInvalidReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseInvalidReasonText.createMany).toHaveBeenCalledWith({
					data: [
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason 1'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason 2'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason 3'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason 4'
						}
					]
				});
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text containing blank strings', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					incompleteReasons: [
						{
							id: 1,
							text: ['Reason 1', 'Reason 2', '']
						},
						{
							id: 2,
							text: ['Reason 3', 'Reason 4', '']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(databaseConnector.appellantCaseIncompleteReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseIncompleteReasonText.createMany).toHaveBeenCalledWith(
					{
						data: [
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason 1'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason 2'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason 3'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason 4'
							}
						]
					}
				);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text where blank strings takes the text over 10 items', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const eightItemArray = new Array(LENGTH_8).fill('A');
				const body = {
					incompleteReasons: [
						{
							id: 1,
							text: [...eightItemArray, '', '']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				});
				expect(databaseConnector.appellantCaseIncompleteReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseIncompleteReasonText.createMany).toHaveBeenCalledWith(
					{
						data: new Array(LENGTH_8).fill({
							appellantCaseId: appellantCase.id,
							appellantCaseIncompleteReasonId: 1,
							text: 'A'
						})
					}
				);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text containing blank strings', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					invalidReasons: [
						{
							id: 1,
							text: ['Reason 1', 'Reason 2', '']
						},
						{
							id: 2,
							text: ['Reason 3', 'Reason 4', '']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 2
					}
				});
				expect(databaseConnector.appellantCaseInvalidReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseInvalidReasonText.createMany).toHaveBeenCalledWith({
					data: [
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason 1'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason 2'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason 3'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason 4'
						}
					]
				});
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text where blank strings takes the text over 10 items', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const eightItemArray = new Array(LENGTH_8).fill('A');
				const body = {
					invalidReasons: [
						{
							id: 1,
							text: [...eightItemArray, '', '']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 2
					}
				});
				expect(databaseConnector.appellantCaseInvalidReasonText.deleteMany).toHaveBeenCalled();
				expect(databaseConnector.appellantCaseInvalidReasonText.createMany).toHaveBeenCalledWith({
					data: new Array(LENGTH_8).fill({
						appellantCaseId: appellantCase.id,
						appellantCaseInvalidReasonId: 1,
						text: 'A'
					})
				});

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with numeric array', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					appealStatus: [
						{
							status: 'validation',
							valid: true
						}
					]
				});
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.deleteMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonOnAppellantCase.createMany.mockResolvedValue(
					true
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					invalidReasons: [{ id: 1 }, { id: 2 }],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 2
					}
				});

				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: id,
						createdAt: expect.any(Date),
						status: STATE_TARGET_INVALID,
						valid: true
					}
				});
				// expect(databaseConnector.appeal.update).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Valid', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					appealStatus: [
						{
							status: 'validation',
							valid: true
						}
					]
				});

				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[2]
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					validationOutcome: 'valid'
				};
				const { appellantCase } = householdAppeal;
				const response = await request
					.patch(`/appeals/${householdAppeal.id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 3
					}
				});

				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						createdAt: expect.any(Date),
						status: STATE_TARGET_READY_TO_START,
						valid: true
					}
				});

				expect(response.status).toEqual(200);
			});
		});
	});
});
