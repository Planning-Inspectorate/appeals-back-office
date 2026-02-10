// @ts-nocheck
import {
	advertisementAppeal,
	advertisementAppealAppellantCaseIncomplete,
	advertisementAppealAppellantCaseInvalid,
	casAdvertAppeal,
	casAdvertAppealAppellantCaseIncomplete,
	casAdvertAppealAppellantCaseInvalid,
	casAdvertAppealAppellantCaseValid,
	casPlanningAppeal,
	casPlanningAppealAppellantCaseIncomplete,
	casPlanningAppealAppellantCaseInvalid,
	casPlanningAppealAppellantCaseValid,
	enforcementNoticeAppeal,
	enforcementNoticeAppealAppellantCaseInvalid,
	fullPlanningAppeal,
	fullPlanningAppealAppellantCaseIncomplete,
	fullPlanningAppealAppellantCaseInvalid,
	fullPlanningAppealCaseValid,
	householdAppeal,
	householdAppealAppellantCaseIncomplete,
	householdAppealAppellantCaseInvalid,
	householdAppealAppellantCaseValid,
	ldcAppeal,
	ldcAppealAppellantCaseIncomplete,
	ldcAppealAppellantCaseInvalid,
	ldcAppealAppellantCaseValid,
	listedBuildingAppeal,
	listedBuildingAppealAppellantCaseIncomplete,
	listedBuildingAppealAppellantCaseInvalid,
	listedBuildingAppealAppellantCaseValid
} from '#tests/appeals/mocks.js';
import {
	appellantCaseIncompleteReasons,
	appellantCaseInvalidReasons,
	appellantCaseValidationOutcomes,
	azureAdUserId
} from '#tests/shared/mocks.js';
import { formatReasonsToHtmlList } from '#utils/format-reasons-to-html-list.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	LENGTH_8
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { request } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('appellant cases routes', () => {
	beforeEach(() => {
		jest
			.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
			.setSystemTime(new Date('2026-01-27'));
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.team.findUnique.mockResolvedValue({
			id: 1,
			name: 'Case Team',
			email: 'caseofficers@planninginspectorate.gov.uk'
		});
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.useRealTimers();
	});

	describe('/appeals/:appealId/appellant-cases/:appellantCaseId', () => {
		describe('GET', () => {
			describe.each([
				[
					'householdAppeal',
					householdAppeal,
					householdAppealAppellantCaseValid,
					householdAppealAppellantCaseIncomplete,
					householdAppealAppellantCaseInvalid
				],
				[
					'casPlanningAppeal',
					casPlanningAppeal,
					casPlanningAppealAppellantCaseValid,
					casPlanningAppealAppellantCaseIncomplete,
					casPlanningAppealAppellantCaseInvalid
				],
				[
					'casAdvertAppeal',
					casAdvertAppeal,
					casAdvertAppealAppellantCaseValid,
					casAdvertAppealAppellantCaseIncomplete,
					casAdvertAppealAppellantCaseInvalid
				],
				[
					'fullPlanningAppeal',
					fullPlanningAppeal,
					fullPlanningAppealCaseValid,
					fullPlanningAppealAppellantCaseIncomplete,
					fullPlanningAppealAppellantCaseInvalid
				],
				[
					'listedBuildingAppeal',
					listedBuildingAppeal,
					listedBuildingAppealAppellantCaseValid,
					listedBuildingAppealAppellantCaseIncomplete,
					listedBuildingAppealAppellantCaseInvalid
				],
				[
					'ldcAppeal',
					ldcAppeal,
					ldcAppealAppellantCaseValid,
					ldcAppealAppellantCaseIncomplete,
					ldcAppealAppellantCaseInvalid
				]
			])(
				'%s appellant case GET scenarios',
				(_, appealNoValidation, appealValid, appealIncomplete, appealInvalid) => {
					test('gets a single appellant case for an appeal with no validation outcome', async () => {
						// @ts-ignore
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appeal.findUnique.mockResolvedValue(appealNoValidation);

						const { appellantCase, id } = appealNoValidation;
						const response = await request
							.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(200);
						expect(response.body).toMatchSnapshot();
					});

					test('gets a single appellant case for a valid appeal', async () => {
						// @ts-ignore
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appeal.findUnique.mockResolvedValue(appealValid);

						const { appellantCase, id } = appealValid;
						const response = await request
							.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(200);
						expect(response.body).toMatchSnapshot();
					});

					test('gets a single appellant case for an incomplete appeal', async () => {
						// @ts-ignore
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appeal.findUnique.mockResolvedValue(appealIncomplete);

						const { appellantCase, id } = appealIncomplete;
						const response = await request
							.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(200);
						expect(response.body).toMatchSnapshot();
					});

					test('gets a single appellant case for an invalid appeal', async () => {
						// @ts-ignore
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appeal.findUnique.mockResolvedValue(appealInvalid);

						const { appellantCase, id } = appealInvalid;
						const response = await request
							.get(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(200);
						expect(response.body).toMatchSnapshot();
					});
				}
			);

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
						caseExtensionDate: expect.any(String),
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				const details = `${stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
					'Appeal'
				])}\n${formatReasonsToHtmlList([
					'The original application form is incomplete',
					'Other: Appellant contact information is incorrect or missing'
				])}`;
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: details,
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

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
				const reasons = [
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
				];

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
						data: reasons
					}
				);

				const details = `${stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
					'Appeal'
				])}\n${formatReasonsToHtmlList([
					'The original application form is incomplete',
					'Other: Appellant contact information is incorrect or missing'
				])}`;

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: details,
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

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
				const details = `${stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
					'Appeal'
				])}\n${formatReasonsToHtmlList([
					'The original application form is incomplete',
					'Other: Appellant contact information is incorrect or missing'
				])}`;
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppealAppellantCaseIncomplete.id,
						details: details,
						loggedAt: expect.any(Date),
						userId: householdAppealAppellantCaseIncomplete.caseOfficer.id
					}
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(response.status).toEqual(200);
			});

			test.each([
				['advertisementAppeal', advertisementAppealAppellantCaseIncomplete],
				['householdAppeal', householdAppealAppellantCaseIncomplete],
				['casPlanningAppeal', casPlanningAppealAppellantCaseIncomplete],
				['casAdvertAppeal', casAdvertAppealAppellantCaseIncomplete],
				['fullPlanningAppeal', fullPlanningAppealAppellantCaseIncomplete],
				['listedBuildingAppeal', listedBuildingAppealAppellantCaseIncomplete],
				['ldcAppeal', ldcAppealAppellantCaseIncomplete]
			])(
				'sends a correctly formatted notify email when the validation outcome is Incomplete for %s appeal',
				async (_, appeal) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
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
					const { appellantCase, id } = appeal;
					const response = await request
						.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							lpa_reference: appeal.applicationReference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							due_date: '14 July 2099',
							reasons: [
								'The original application form is incomplete',
								'Other: Appellant contact information is incorrect or missing'
							],
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.agent.email,
						templateName: 'appeal-incomplete'
					});

					expect(response.status).toEqual(200);
				}
			);

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

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

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

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

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

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(response.status).toEqual(200);
			});

			test.each([
				['householdAppeal', householdAppealAppellantCaseInvalid, FEEDBACK_FORM_LINKS.HAS],
				[
					'advertisementAppeal',
					advertisementAppealAppellantCaseInvalid,
					FEEDBACK_FORM_LINKS.FULL_ADVERTS
				],
				[
					'casPlanningAppeal',
					casPlanningAppealAppellantCaseInvalid,
					FEEDBACK_FORM_LINKS.CAS_PLANNING
				],
				['casAdvertAppeal', casAdvertAppealAppellantCaseInvalid, FEEDBACK_FORM_LINKS.CAS_ADVERTS],
				['fullPlanningAppeal', fullPlanningAppealAppellantCaseInvalid, FEEDBACK_FORM_LINKS.S78],
				['listedBuildingAppeal', listedBuildingAppealAppellantCaseInvalid, FEEDBACK_FORM_LINKS.S20],
				['ldc', ldcAppealAppellantCaseInvalid, FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE]
			])(
				'sends a correctly formatted notify email when the validation outcome is Invalid for %s appeal',
				async (_, appeal, expectedFeedbackLink) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
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
					const { appellantCase, id } = appeal;
					const response = await request
						.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							lpa_reference: appeal.applicationReference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							feedback_link: expectedFeedbackLink,
							reasons: [
								'Appeal has not been submitted on time',
								'Other: The appeal site address does not match'
							],
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.agent.email,
						templateName: 'appeal-invalid'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							lpa_reference: appeal.applicationReference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							feedback_link: FEEDBACK_FORM_LINKS.LPA,
							reasons: [
								'Appeal has not been submitted on time',
								'Other: The appeal site address does not match'
							],
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-invalid-lpa'
					});

					expect(response.status).toEqual(200);
				}
			);

			test.each([
				['householdAppeal', householdAppeal, FEEDBACK_FORM_LINKS.HAS],
				['advertisementAppeal', advertisementAppeal, FEEDBACK_FORM_LINKS.FULL_ADVERTS],
				['casAdvertAppeal', casAdvertAppeal, FEEDBACK_FORM_LINKS.CAS_ADVERTS],
				['casPlanningAppeal', casPlanningAppeal, FEEDBACK_FORM_LINKS.CAS_PLANNING],
				['fullPlanningAppeal', fullPlanningAppeal, FEEDBACK_FORM_LINKS.S78],
				['listedBuildingAppeal', listedBuildingAppeal, FEEDBACK_FORM_LINKS.S20],
				['ldc', ldcAppeal, FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE]
			])(
				'updates appellant case and sends a notify email when the validation outcome is Valid for %s appeal',
				async (_, appeal, expectedFeedbackLink) => {
					// Mock DB responses
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						appealStatus: [{ status: 'validation', valid: true }]
					});
					// @ts-ignore
					databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
						appellantCaseValidationOutcomes[2]
					);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });
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

					const body = { validationOutcome: 'valid' };
					const { appellantCase, id } = appeal;

					const response = await request
						.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
						where: { id: appellantCase.id },
						data: { appellantCaseValidationOutcomeId: 3 }
					});

					expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							createdAt: expect.any(Date),
							status: APPEAL_CASE_STATUS.READY_TO_START,
							valid: true
						}
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							lpa_reference: appeal.applicationReference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							feedback_link: expectedFeedbackLink,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.agent.email,
						templateName: 'appeal-confirmed'
					});

					expect(response.status).toEqual(200);
				}
			);

			test('updates appellant case and sends notify emails for valid enforcement notice appeal', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...enforcementNoticeAppeal,
					appealType: {
						key: 'C',
						type: 'Enforcement Notice appeal'
					},
					appealGrounds: [
						{
							ground: {
								groundRef: 'b',
								groundDescription: 'Ground B'
							}
						},
						{
							ground: {
								groundRef: 'a',
								groundDescription: 'Ground A'
							}
						}
					]
				});
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[2]
				);
				databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				databaseConnector.documentVersion.update.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ id: 1, key: 'no_redaction_required' }
				]);
				databaseConnector.document.findUnique.mockResolvedValue(null);

				const patchBody = {
					validationOutcome: 'valid',
					groundABarred: false,
					otherInformation: 'Accio horcrux'
				};
				const { appellantCase, id } = enforcementNoticeAppeal;
				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: { appellantCaseValidationOutcomeId: 3 }
				});

				expect(response.status).toEqual(200);
				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: enforcementNoticeAppeal.reference,
						lpa_reference: enforcementNoticeAppeal.applicationReference,
						site_address: `${enforcementNoticeAppeal.address.addressLine1}, ${enforcementNoticeAppeal.address.addressLine2}, ${enforcementNoticeAppeal.address.addressTown}, ${enforcementNoticeAppeal.address.addressCounty}, ${enforcementNoticeAppeal.address.postcode}, ${enforcementNoticeAppeal.address.addressCountry}`,
						feedback_link: FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						local_planning_authority: enforcementNoticeAppeal.lpa.name,
						appeal_type: 'Enforcement Notice',
						enforcement_reference: enforcementNoticeAppeal.appellantCase.enforcementReference,
						appeal_grounds: ['a', 'b'],
						ground_a_barred: false,
						other_info: 'Accio horcrux'
					},
					recipientEmail: enforcementNoticeAppeal.agent.email,
					templateName: 'appeal-confirmed-enforcement-appellant'
				});
				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: enforcementNoticeAppeal.reference,
						lpa_reference: enforcementNoticeAppeal.applicationReference,
						site_address: `${enforcementNoticeAppeal.address.addressLine1}, ${enforcementNoticeAppeal.address.addressLine2}, ${enforcementNoticeAppeal.address.addressTown}, ${enforcementNoticeAppeal.address.addressCounty}, ${enforcementNoticeAppeal.address.postcode}, ${enforcementNoticeAppeal.address.addressCountry}`,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						local_planning_authority: enforcementNoticeAppeal.lpa.name,
						appeal_type: 'Enforcement Notice',
						enforcement_reference: enforcementNoticeAppeal.appellantCase.enforcementReference,
						appeal_grounds: ['a', 'b'],
						ground_a_barred: false,
						other_info: 'Accio horcrux',
						appellant_contact_details: 'Lee Thornton, test@1367.com, 01234 567 890',
						agent_contact_details: 'John Smith, test@136s7.com, 09876 543 210'
					},
					recipientEmail: enforcementNoticeAppeal.lpa.email,
					templateName: 'appeal-confirmed-enforcement-lpa'
				});
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
					'Must be null or one of the following values: hearing, inquiry, written, writtenPart1'
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

			test('creates new appellant advert details', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				databaseConnector.appellantCaseAdvertDetails.findFirst.mockResolvedValue(null);

				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					advertInPosition: true,
					highwayLand: false
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appellantCaseAdvertDetails.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						appellantCaseId: appellantCase.id,
						advertInPosition: patchBody.advertInPosition,
						highwayLand: patchBody.highwayLand
					})
				});
			});

			test('updates existing appellant advert details', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				databaseConnector.appellantCaseAdvertDetails.findFirst.mockResolvedValue({
					id: 1
				});

				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					advertInPosition: true,
					highwayLand: false
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appellantCaseAdvertDetails.update).toHaveBeenCalledWith({
					where: { id: 1 },
					data: expect.objectContaining({
						advertInPosition: patchBody.advertInPosition,
						highwayLand: patchBody.highwayLand
					})
				});
			});

			test('updates existing appellant ldc details', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id, appellantCase } = householdAppeal;
				const patchBody = {
					siteUseAtTimeOfApplication: 'Residential',
					applicationMadeUnderActSection: 'exisiting-development'
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				console.log(response.error);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith(
					expect.objectContaining({
						data: expect.objectContaining({
							applicationMadeUnderActSection: 'exisiting-development',
							siteUseAtTimeOfApplication: 'Residential'
						})
					})
				);
			});

			test('returns an error if groundABarred is not a boolean', async () => {
				const { id, appellantCase } = enforcementNoticeAppeal;
				const patchBody = {
					groundABarred: 'not a boolean'
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty('groundABarred', 'must be a boolean');
			});

			test('returns an error if otherInformation is too long', async () => {
				const { id, appellantCase } = enforcementNoticeAppeal;
				const patchBody = {
					otherInformation: 'x'.repeat(1001)
				};

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(patchBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body.errors).toHaveProperty(
					'otherInformation',
					'must be 1000 characters or less'
				);
			});

			test('updates the appeal case with groundABarred and otherInformation', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...enforcementNoticeAppeal,
					appealStatus: [{ status: 'validation', valid: true }]
				});
				// @ts-ignore
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[2]
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });
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
					validationOutcome: 'valid',
					validAt: new Date().toISOString(),
					groundABarred: true,
					otherInformation: 'Other information'
				};
				const { appellantCase, id } = enforcementNoticeAppeal;

				const response = await request
					.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
					where: { id: appellantCase.id },
					data: { appellantCaseValidationOutcomeId: 3 }
				});

				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: enforcementNoticeAppeal.id,
						createdAt: expect.any(Date),
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: true
					}
				});

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					where: { id },
					data: {
						caseUpdatedDate: expect.any(Date),
						caseValidDate: expect.any(String)
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.enforcementNoticeAppealOutcome.create).toHaveBeenCalledWith({
					data: {
						appeal: expect.any(Object),
						groundABarred: true,
						otherInformation: 'Other information',
						otherLiveAppeals: undefined,
						enforcementNoticeInvalid: undefined
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: enforcementNoticeAppeal.id,
						details: `Appeal reviewed as valid on 27 January 2026\nOther information`,
						loggedAt: expect.any(Date),
						userId: enforcementNoticeAppeal.caseOfficer.id
					}
				});

				expect(mockNotifySend).toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates the appellant case for invalid enforcement appeal with valid enforcement notice', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(
					enforcementNoticeAppealAppellantCaseInvalid
				);
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				databaseConnector.appellantCaseInvalidReason.findMany.mockResolvedValue(
					appellantCaseInvalidReasons
				);
				databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany.mockResolvedValue(true);
				databaseConnector.appellantCaseInvalidReasonsSelected.createMany.mockResolvedValue(true);
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
					validationOutcome: 'Invalid',
					otherLiveAppeals: 'no',
					enforcementNoticeInvalid: 'no'
				};
				const { appellantCase, id } = enforcementNoticeAppealAppellantCaseInvalid;
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
				expect(databaseConnector.enforcementNoticeAppealOutcome.create).toHaveBeenCalledWith({
					data: {
						appeal: expect.any(Object),
						otherInformation: undefined,
						otherLiveAppeals: 'no',
						enforcementNoticeInvalid: 'no'
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates the appellant case for invalid enforcement appeal with invalid enforcement notice', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(
					enforcementNoticeAppealAppellantCaseInvalid
				);
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[1]
				);
				databaseConnector.appellantCaseEnforcementInvalidReasonsSelected.deleteMany.mockResolvedValue(
					true
				);
				databaseConnector.appellantCaseEnforcementInvalidReasonsSelected.createMany.mockResolvedValue(
					true
				);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					validationOutcome: 'invalid',
					enforcementInvalidReasons: [
						{ id: 1, text: ['has some text'] },
						{ id: 2, text: ['has some other text'] },
						{ id: 8, text: ['This is the other field'] }
					],
					enforcementNoticeInvalid: 'yes',
					otherInformation: 'Enforcement other information'
				};
				const { appellantCase, id } = enforcementNoticeAppealAppellantCaseInvalid;
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
				expect(
					databaseConnector.appellantCaseEnforcementInvalidReasonText.deleteMany
				).toHaveBeenCalled();
				expect(
					databaseConnector.appellantCaseEnforcementInvalidReasonText.createMany
				).toHaveBeenCalledWith({
					data: [
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 1,
							text: 'has some text'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 2,
							text: 'has some other text'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 8,
							text: 'This is the other field'
						}
					]
				});
				expect(databaseConnector.enforcementNoticeAppealOutcome.create).toHaveBeenCalledWith({
					data: {
						appeal: expect.any(Object),
						otherInformation: 'Enforcement other information',
						otherLiveAppeals: undefined,
						enforcementNoticeInvalid: 'yes'
					}
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						enforcement_reference: 'Reference',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						reason_1: 'has some text',
						reason_2: 'has some other text',
						reason_8: 'This is the other field',
						other_info: 'Enforcement other information',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: enforcementNoticeAppeal.agent.email,
					templateName: 'enforcement-notice-invalid-appellant'
				});
				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						enforcement_reference: 'Reference',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						reason_1: 'has some text',
						reason_2: 'has some other text',
						reason_8: 'This is the other field',
						other_info: 'Enforcement other information',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: enforcementNoticeAppeal.lpa.email,
					templateName: 'enforcement-notice-invalid-lpa'
				});

				expect(response.status).toEqual(200);
			});

			test('updates the appellant case for incomplete enforcement notice appeal with invalid enforcement notice', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...enforcementNoticeAppealAppellantCaseInvalid,
					caseExtensionDate: '2035-07-14T00:00:00.000Z'
				});
				databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
					appellantCaseValidationOutcomes[0]
				);
				databaseConnector.appellantCaseEnforcementInvalidReasonsSelected.deleteMany.mockResolvedValue(
					true
				);
				databaseConnector.appellantCaseEnforcementInvalidReasonsSelected.createMany.mockResolvedValue(
					true
				);
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					validationOutcome: 'incomplete',
					enforcementInvalidReasons: [
						{ id: 1, text: ['has some text'] },
						{ id: 2, text: ['has some other text'] },
						{ id: 8, text: ['This is the other field'] }
					],
					enforcementNoticeInvalid: 'yes',
					otherInformation: 'Enforcement other information'
				};
				const { appellantCase, id } = enforcementNoticeAppealAppellantCaseInvalid;
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
				expect(
					databaseConnector.appellantCaseEnforcementInvalidReasonText.deleteMany
				).toHaveBeenCalled();
				expect(
					databaseConnector.appellantCaseEnforcementInvalidReasonText.createMany
				).toHaveBeenCalledWith({
					data: [
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 1,
							text: 'has some text'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 2,
							text: 'has some other text'
						},
						{
							appellantCaseId: appellantCase.id,
							appellantCaseEnforcementInvalidReasonId: 8,
							text: 'This is the other field'
						}
					]
				});
				expect(databaseConnector.enforcementNoticeAppealOutcome.create).toHaveBeenCalledWith({
					data: {
						appeal: expect.any(Object),
						otherInformation: 'Enforcement other information',
						otherLiveAppeals: undefined,
						enforcementNoticeInvalid: 'yes'
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(2);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: id,
						details:
							'Appeal marked as incomplete:\n<ul><li>There is a mistake in the wording: this is a short reason</li><li>Enforcement other information</li></ul>',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: id,
						details: 'Case updated',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(1);
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						enforcement_reference: 'Reference',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						reason_1: 'has some text',
						reason_2: 'has some other text',
						reason_8: 'This is the other field',
						other_info: 'Enforcement other information',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						due_date: '14 July 2035'
					},
					recipientEmail: enforcementNoticeAppealAppellantCaseInvalid.lpa.email,
					templateName: 'enforcement-notice-incomplete-lpa'
				});
				expect(response.status).toEqual(200);
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
			const expectedLabel = 'Other minor developments';

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

		test('updates appellant case date contacted the Planning Inspectorate', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(enforcementNoticeAppeal);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const patchBody = {
				contactPlanningInspectorateDate: '2024-05-13T00:00:00.000Z'
			};
			const expectedDate = '13 May 2024';

			const { appellantCase, id } = enforcementNoticeAppeal;
			const response = await request
				.patch(`/appeals/${id}/appellant-cases/${appellantCase.id}`)
				.send(patchBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
				where: { id: appellantCase.id },
				data: {
					contactPlanningInspectorateDate: patchBody.contactPlanningInspectorateDate
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: enforcementNoticeAppeal.id,
					details: `Date contacted the Planning Inspectorate updated to ${expectedDate}`,
					loggedAt: expect.any(Date),
					userId: enforcementNoticeAppeal.caseOfficer.id
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
					details: 'Development type updated to Unknown-type',
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(200);
		});
	});

	describe('POST /appeals/:appealId/appellant-cases/:appellantCaseId/contact-address', () => {
		test('creates a new contact address and updates appellant case and case history', async () => {
			const { postCode: postcode, ...restAddress } =
				enforcementNoticeAppeal.appellantCase.contactAddress;
			const body = {
				...restAddress,
				postcode
			};

			const mockTx = {
				address: {
					create: jest.fn().mockResolvedValue(body)
				},
				appellantCase: {
					update: jest.fn().mockResolvedValue({ count: 1 })
				}
			};

			const {
				id: appealId,
				appellantCase: { id: appellantCaseId }
			} = enforcementNoticeAppeal;

			const transactionSpy = jest.spyOn(databaseConnector, '$transaction');
			transactionSpy.mockImplementation(async (callback) => {
				const result = await callback(mockTx);
				return result;
			});

			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appealId}/appellant-cases/${appellantCaseId}/contact-address`)
				.send(body)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);

			expect(databaseConnector.$transaction).toHaveBeenCalled();
			expect(mockTx.address.create).toHaveBeenCalledWith({
				data: body
			});
			expect(mockTx.appellantCase.update).toHaveBeenCalledWith({
				data: {
					contactAddressId: body.id
				},
				where: {
					id: appellantCaseId,
					appealId
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: enforcementNoticeAppeal.id,
					details: 'Contact address updated to Address, Town, Postcode',
					loggedAt: expect.any(Date),
					userId: 1
				}
			});
		});
	});

	describe('PATCH /:appealId/appellant-cases/:appellantCaseId/contact-address/:contactAddressId', () => {
		test('updates the contact address details of an appellant case', async () => {
			const body = {
				addressLine1: 'New address line'
			};

			// @ts-ignore
			databaseConnector.address.update.mockResolvedValue({
				addressLine1: body.addressLine1,
				...enforcementNoticeAppeal.address
			});
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const {
				id: appealId,
				appellantCase: { id: appellantCaseId, contactAddressId }
			} = enforcementNoticeAppeal;
			const response = await request
				.patch(
					`/appeals/${appealId}/appellant-cases/${appellantCaseId}/contact-address/${contactAddressId}`
				)
				.send(body)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);

			expect(databaseConnector.address.update).toHaveBeenCalledWith({
				where: {
					id: contactAddressId,
					AppellantCase: {
						every: { id: appellantCaseId, appealId }
					}
				},
				data: {
					addressLine1: body.addressLine1
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: enforcementNoticeAppeal.id,
					details: 'Contact address updated to 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY',
					loggedAt: expect.any(Date),
					userId: 1
				}
			});
		});
	});
});
