// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	LENGTH_8,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE
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
import config from '#config/config.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

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
			test('updates appellant case when the validation outcome is Incomplete without reason text and with an appeal due date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);
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
				databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.createMany.mockResolvedValue(true);

				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					validationOutcome: 'Incomplete'
				};

				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
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

				const formattedAppealDueDate = joinDateAndTime(body.appealDueDate);
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id },
					data: {
						caseExtensionDate: formattedAppealDueDate,
						caseUpdatedDate: expect.any(Date)
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text and an appeal due date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);
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
				databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.createMany.mockResolvedValue(true);

				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [
						{
							id: 1,
							text: ['Reason Text 1', 'Reason Text 2']
						},
						{
							id: 2,
							text: ['Reason Text 3', 'Reason Text 4']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
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
								text: 'Reason Text 1'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason Text 2'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason Text 3'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason Text 4'
							}
						]
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text containing blank strings', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.createMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [
						{
							id: 1,
							text: ['Reason Text 1', 'Reason Text 2', '']
						},
						{
							id: 2,
							text: ['Reason Text 3', 'Reason Text 4', '']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
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
								text: 'Reason Text 1'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 1,
								text: 'Reason Text 2'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason Text 3'
							},
							{
								appellantCaseId: appellantCase.id,
								appellantCaseIncompleteReasonId: 2,
								text: 'Reason Text 4'
							}
						]
					}
				);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Incomplete with reason text where blank strings takes the text over 10 items', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReasonsSelected.createMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const eightItemArray = new Array(LENGTH_8).fill('A');
				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [
						{
							id: 1,
							text: [...eightItemArray, '', '']
						}
					],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
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
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case']),
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('sends a correctly formatted notify email when the validation outcome is Incomplete', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealAppellantCaseIncomplete
				);
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

				const body = {
					appealDueDate: '2099-07-14',
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.appealIncomplete.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							due_date: '14 July 2099',
							reasons: [
								'The original application form is incomplete',
								'Other: Appellant contact information is incorrect or missing'
							]
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseInvalid);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.createMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					invalidReasons: [
						{
							id: 1,
							text: ['Reason Text 1', 'Reason Text 2']
						},
						{
							id: 2,
							text: ['Reason Text 3', 'Reason Text 4']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppealAppellantCaseInvalid;
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
							text: 'Reason Text 1'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason Text 2'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason Text 3'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason Text 4'
						}
					]
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text containing blank strings', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseInvalid);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.createMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					invalidReasons: [
						{
							id: 1,
							text: ['Reason Text 1', 'Reason Text 2', '']
						},
						{
							id: 2,
							text: ['Reason Text 3', 'Reason Text 4', '']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppealAppellantCaseInvalid;
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
							text: 'Reason Text 1'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 1,
							text: 'Reason Text 2'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason Text 3'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseInvalidReasonId: 2,
							text: 'Reason Text 4'
						}
					]
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case when the validation outcome is Invalid with reason text where blank strings takes the text over 10 items', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseInvalid);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany.mockResolvedValue(true);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReasonsSelected.createMany.mockResolvedValue(true);
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
				const { appellantCase, id } = householdAppealAppellantCaseInvalid;
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test('sends a correctly formatted notify email when the validation outcome is Invalid', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppealAppellantCaseInvalid);
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
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
							text: ['Reason Text 1', 'Reason Text 2']
						}
					],
					validationOutcome: 'Invalid'
				};
				const { appellantCase, id } = householdAppealAppellantCaseInvalid;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.appealInvalid.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							reasons: [
								'Appeal has not been submitted on time',
								'Other: The appeal site address does not match'
							]
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});

			test('updates appellant case and sends a notify email when the validation outcome is Valid', async () => {
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
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: true
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.appealConfirmed.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom'
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});
		});
	});
});
