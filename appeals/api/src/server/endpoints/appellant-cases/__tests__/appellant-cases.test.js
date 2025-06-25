// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	LENGTH_8,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED
} from '@pins/appeals/constants/support.js';
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
	fullPlanningAppealCaseValid,
	householdAppeal,
	householdAppealAppellantCaseIncomplete,
	householdAppealAppellantCaseInvalid,
	householdAppealAppellantCaseValid
} from '#tests/appeals/mocks.js';

import stringTokenReplacement from '#utils/string-token-replacement.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
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
			test.each([
				['householdAppeal', householdAppeal],
				['fullPlanningAppeal', fullPlanningAppeal]
			])(
				'gets a single appellant case for an appeal with no validation outcome',
				async (_, appeal) => {
					// @ts-ignore
					databaseConnector.folder.findMany.mockResolvedValue([]);
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

					const { appellantCase, id } = appeal;
					const response = await request
						.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(200);
					expect(response.body).toMatchSnapshot();
				}
			);

			test.each([
				['householdAppeal', householdAppealAppellantCaseValid],
				['fullPlanningAppeal', fullPlanningAppealCaseValid]
			])('gets a single appellant case for a valid appeal: %s', async (_, appeal) => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

				const { appellantCase, id } = appeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});

			test.each([
				['householdAppeal', householdAppealAppellantCaseIncomplete],
				['fullPlanningAppeal', fullPlanningAppealAppellantCaseIncomplete]
			])('gets a single appellant case for an incomplete appeal: %s', async (_, appeal) => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

				const { appellantCase, id } = appeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});

			test.each([
				['householdAppeal', householdAppealAppellantCaseInvalid],
				['fullPlanningAppeal', fullPlanningAppealAppellantCaseInvalid]
			])('gets a single appellant case for an invalid appeal: %s', async (_, appeal) => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([]);
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

				const { appellantCase, id } = appeal;
				const response = await request
					.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
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
			test('updates appellant case site area', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const patchBody = {
					siteAreaSquareMetres: '30.6'
				};
				const dataToSave = {
					siteAreaSquareMetres: patchBody.siteAreaSquareMetres
				};

				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: dataToSave
				});

				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED, ['30.6']),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});

				expect(response.status).toEqual(200);
			});
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
					appealDueDate: '2099-07-14T00:00:00.000Z',
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

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id },
					data: {
						caseExtensionDate: body.appealDueDate,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
					appealDueDate: '2099-07-14T00:00:00.000Z',
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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
					appealDueDate: '2099-07-14T00:00:00.000Z',
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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
					appealDueDate: '2099-07-14T00:00:00.000Z',
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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
					appealDueDate: '2099-07-14T00:00:00.000Z',
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					validationOutcome: 'Incomplete'
				};
				const { appellantCase, id } = householdAppealAppellantCaseIncomplete;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						due_date: '14 July 2099',
						reasons: [
							'The original application form is incomplete',
							'Other: Appellant contact information is incorrect or missing'
						]
					},
					recipientEmail: 'test@136s7.com',
					templateName: 'appeal-incomplete'
				});

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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);

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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						reasons: [
							'Appeal has not been submitted on time',
							'Other: The appeal site address does not match'
						]
					},
					recipientEmail: 'test@136s7.com',
					templateName: 'appeal-invalid'
				});

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
				// @ts-ignore
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.documentVersion.update.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ id: 1, key: 'no_redaction_required' }
				]);
				// @ts-ignore
				databaseConnector.document.findUnique.mockResolvedValue(null);

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
				expect(mockNotifySend).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						lpa_reference: '48269/APP/2021/1482',
						appeal_reference_number: '1345264',
						feedback_link: 'https://forms.office.com/r/9U4Sq9rEff',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom'
					},
					recipientEmail: 'test@136s7.com',
					templateName: 'appeal-confirmed'
				});

				expect(response.status).toEqual(200);
			});
			test('updates appellant case site area and procedure preferences', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 2,
					appellantProcedurePreferenceWitnessCount: 1
				};

				const dataToSave = {
					appellantProcedurePreference: patchBody.appellantProcedurePreference,
					appellantProcedurePreferenceDetails: patchBody.appellantProcedurePreferenceDetails,
					appellantProcedurePreferenceDuration: patchBody.appellantProcedurePreferenceDuration,
					appellantProcedurePreferenceWitnessCount:
						patchBody.appellantProcedurePreferenceWitnessCount
				};

				const { appellantCase, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: dataToSave
				});

				expect(response.status).toEqual(200);
				expect(response.body.appellantProcedurePreference).toEqual('inquiry');
				expect(response.body.appellantProcedurePreferenceDetails).toEqual(
					'Need for a detailed examination.'
				);
				expect(response.body.appellantProcedurePreferenceDuration).toEqual(2);
				expect(response.body.appellantProcedurePreferenceWitnessCount).toEqual(1);
			});
			test('returns an error if appellantProcedurePreferenceDuration is not a number', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 'not-a-number',
					appellantProcedurePreferenceWitnessCount: 1
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreferenceDuration',
					'must be a number'
				);
			});
			test('returns an error if appellantProcedurePreference is outside the allowed range', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'not-valid',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 1,
					appellantProcedurePreferenceWitnessCount: 1
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreference',
					'Must be null or one of the following values: hearing, inquiry, written'
				);
			});
			test('returns an error if appellantProcedurePreferenceDuration is outside the allowed range', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 100,
					appellantProcedurePreferenceWitnessCount: 1
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreferenceDuration',
					'must be a number between 0 and 99'
				);
			});
			test('returns an error if appellantProcedurePreferenceWitnessCount is not a number', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 1,
					appellantProcedurePreferenceWitnessCount: 'not-a-number'
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreferenceWitnessCount',
					'must be a number'
				);
			});

			test('returns an error if appellantProcedurePreferenceWitnessCount is outside the allowed range', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'Need for a detailed examination.',
					appellantProcedurePreferenceDuration: 2,
					appellantProcedurePreferenceWitnessCount: 100
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreferenceWitnessCount',
					'must be a number between 0 and 99'
				);
			});

			test('returns an error if appellantProcedurePreferenceDetails is too long', async () => {
				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					appellantProcedurePreference: 'inquiry',
					appellantProcedurePreferenceDetails: 'x'.repeat(1001),
					appellantProcedurePreferenceDuration: 2,
					appellantProcedurePreferenceWitnessCount: 1
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'appellantProcedurePreferenceDetails',
					'must be 1000 characters or less'
				);
			});
		});
	});

	describe('PATCH /appeals/:appealId/appellant-cases/:appellantCaseId', () => {
		test('updates appellant case development type and logs the correct label', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const patchBody = {
				developmentType: 'other-minor'
			};
			const expectedLabel = 'other minor developments';

			const { appellantCase, id } = householdAppeal;
			const response = await request
				.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
				.send(patchBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
				where: { id: appellantCase.id },
				data: {
					developmentType: patchBody.developmentType
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					details: `Development type updated to ${expectedLabel}`,
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(200);
		});

		test('handles unmapped development type gracefully', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const patchBody = {
				developmentType: 'unknown-type'
			};

			const { appellantCase, id } = householdAppeal;
			const response = await request
				.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
				.send(patchBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
				where: { id: appellantCase.id },
				data: {
					developmentType: patchBody.developmentType
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					details: 'Development type updated to unknown-type',
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(200);
		});
	});
});
