// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_INVALID_LPA_QUESTIONNAIRE_VALIDATION_OUTCOME,
	ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED,
	ERROR_MUST_BE_BOOLEAN,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_INCOMPLETE_INVALID_REASON,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME,
	LENGTH_10,
	LENGTH_8,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	AUDIT_TRAIL_LPAQ_IS_CORRECT_APPEAL_TYPE_UPDATED
} from '@pins/appeals/constants/support.js';
import {
	lpaQuestionnaireIncompleteReasons,
	lpaQuestionnaireValidationOutcomes,
	azureAdUserId
} from '#tests/shared/mocks.js';
import {
	fullPlanningAppeal,
	householdAppeal,
	householdAppealLPAQuestionnaireComplete,
	householdAppealLPAQuestionnaireIncomplete,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import createManyToManyRelationData from '#utils/create-many-to-many-relation-data.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
const { databaseConnector } = await import('#utils/database-connector.js');
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { ERROR_MAX_LENGTH_CHARACTERS } from '@pins/appeals/constants/support.js';

describe('lpa questionnaires routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('/appeals/:appealId/lpa-questionnaires/:lpaQuestionnaireId', () => {
		describe('GET', () => {
			test('gets a single lpa questionnaire with no outcome', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.folder.findMany.mockResolvedValue([]);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});

			test('gets a single lpa questionnaire with an outcome of Complete', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealLPAQuestionnaireComplete
				);

				const { id, lpaQuestionnaire } = householdAppealLPAQuestionnaireComplete;
				const response = await request
					.get(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});

			test('gets a single lpa questionnaire with an outcome of Incomplete', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(
					householdAppealLPAQuestionnaireIncomplete
				);
				databaseConnector.folder.findMany.mockResolvedValue([]);

				const { id, lpaQuestionnaire } = householdAppealLPAQuestionnaireIncomplete;
				const response = await request
					.get(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});

			test('returns an error if appealId is not numeric', async () => {
				const response = await request
					.get(`/appeals/one/lpa-questionnaires/${householdAppeal.lpaQuestionnaire.id}`)
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

				const { lpaQuestionnaire } = householdAppeal;
				const response = await request
					.get(`/appeals/3/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if lpaQuestionnaireId is not numeric', async () => {
				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/lpa-questionnaires/one`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if lpaQuestionnaireId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.folder.findMany.mockResolvedValue([]);

				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/lpa-questionnaires/3`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireId: ERROR_NOT_FOUND
					}
				});
			});
		});

		describe('PATCH', () => {
			test('updates an lpa questionnaire when the validation outcome is complete for a household appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique
					.mockResolvedValueOnce({
						...householdAppeal,
						appealStatus: [
							{
								status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
								valid: true
							}
						]
					})
					.mockResolvedValueOnce({
						...householdAppeal,
						appealStatus: [
							{
								status: APPEAL_CASE_STATUS.EVENT,
								valid: true
							}
						]
					});
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.documentVersion.update.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.document.findUnique.mockResolvedValue(null);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ id: 1, key: 'no_redaction_required' }
				]);

				const body = {
					validationOutcome: 'complete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[0].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						createdAt: expect.any(Date),
						status: APPEAL_CASE_STATUS.AWAITING_EVENT,
						valid: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [
							APPEAL_CASE_STATUS.AWAITING_EVENT
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.update
				).not.toHaveBeenCalled();

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(response.status).toEqual(200);
			});

			test.each([
				{
					appeal: householdAppeal,
					templateName: 'lpaq-complete-has-appellant',
					personalisation: {
						lpa_reference: householdAppeal.applicationReference,
						appeal_reference_number: householdAppeal.reference,
						site_address: `${householdAppeal.address.addressLine1}, ${householdAppeal.address.addressLine2}, ${householdAppeal.address.addressTown}, ${householdAppeal.address.addressCounty}, ${householdAppeal.address.postcode}, ${householdAppeal.address.addressCountry}`
					}
				},
				{
					appeal: fullPlanningAppeal,
					templateName: 'lpaq-complete-appellant',
					personalisation: {
						lpa_reference: fullPlanningAppeal.applicationReference,
						appeal_reference_number: fullPlanningAppeal.reference,
						site_address: `${fullPlanningAppeal.address.addressLine1}, ${fullPlanningAppeal.address.addressLine2}, ${fullPlanningAppeal.address.addressTown}, ${fullPlanningAppeal.address.addressCounty}, ${fullPlanningAppeal.address.postcode}, ${fullPlanningAppeal.address.addressCountry}`,
						what_happens_next:
							'We will send you another email when the local planning authority submits their statement and we receive any comments from interested parties.'
					}
				},
				{
					appeal: listedBuildingAppeal,
					templateName: 'lpaq-complete-appellant',
					personalisation: {
						lpa_reference: listedBuildingAppeal.applicationReference,
						appeal_reference_number: listedBuildingAppeal.reference,
						site_address: `${listedBuildingAppeal.address.addressLine1}, ${listedBuildingAppeal.address.addressLine2}, ${listedBuildingAppeal.address.addressTown}, ${listedBuildingAppeal.address.addressCounty}, ${listedBuildingAppeal.address.postcode}, ${listedBuildingAppeal.address.addressCountry}`,
						what_happens_next:
							'We will send you another email when the local planning authority submits their statement and we receive any comments from interested parties.'
					}
				}
			])(
				'sends a correctly formatted notify email when the outcome is complete for an appeal of type %s',
				async (test) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique
						.mockResolvedValueOnce({
							...test.appeal,
							appealStatus: [
								{
									status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
									valid: true
								}
							]
						})
						.mockResolvedValue({
							...test.appeal,
							appealStatus: [
								{
									status: APPEAL_CASE_STATUS.EVENT,
									valid: true
								}
							]
						});
					// @ts-ignore
					databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
						lpaQuestionnaireValidationOutcomes[0]
					);
					// @ts-ignore
					databaseConnector.documentVersion.findMany.mockResolvedValue([]);
					// @ts-ignore
					databaseConnector.documentVersion.update.mockResolvedValue([]);
					// @ts-ignore
					databaseConnector.document.findUnique.mockResolvedValue(null);
					// @ts-ignore
					databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
						{ id: 1, key: 'no_redaction_required' }
					]);

					const body = {
						validationOutcome: 'complete'
					};
					const { id, lpaQuestionnaire } = test.appeal;
					const response = await request
						.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					// eslint-disable-next-line no-undef
					expect(mockNotifySend).toHaveBeenCalledTimes(2);
					// eslint-disable-next-line no-undef
					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						notifyClient: expect.anything(),
						personalisation: {
							lpa_reference: test.appeal.applicationReference,
							appeal_reference_number: test.appeal.reference,
							site_address: `${test.appeal.address.addressLine1}, ${test.appeal.address.addressLine2}, ${test.appeal.address.addressTown}, ${test.appeal.address.addressCounty}, ${test.appeal.address.postcode}, ${test.appeal.address.addressCountry}`
						},
						recipientEmail: test.appeal.lpa.email,
						templateName: 'lpaq-complete-lpa'
					});

					// eslint-disable-next-line no-undef
					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						notifyClient: expect.anything(),
						personalisation: test.personalisation,
						recipientEmail: test.appeal.appellant.email,
						templateName: test.templateName
					});

					expect(response.status).toEqual(200);
				}
			);

			test('updates an lpa questionnaire when the validation outcome is complete for a full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					appealStatus: [
						{
							status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
							valid: true
						}
					]
				});
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ id: 1, key: 'no_redaction_required' }
				]);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					validationOutcome: 'Complete'
				};
				const { id, lpaQuestionnaire } = fullPlanningAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[0].id
					},
					where: {
						id: fullPlanningAppeal.lpaQuestionnaire.id
					}
				});
				expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						createdAt: expect.any(Date),
						status: APPEAL_CASE_STATUS.STATEMENTS,
						valid: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: fullPlanningAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [
							APPEAL_CASE_STATUS.STATEMENTS
						]),
						loggedAt: expect.any(Date),
						userId: fullPlanningAppeal.caseOfficer.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.update
				).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is incomplete and lpaQuestionnaireDueDate is a weekday', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2099-06-22T23:59:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is incomplete and lpaQuestionnaireDueDate is a weekend day with a bank holiday on the following Monday', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2025-08-23T00:00:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is incomplete and lpaQuestionnaireDueDate is a bank holiday Friday with a folowing bank holiday Monday', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2125-04-18T00:00:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is incomplete and lpaQuestionnaireDueDate is a bank holiday with a bank holiday the next day', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2090-12-25T00:00:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is Incomplete without reason text', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'Incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is Incomplete with reason text', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
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
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'Incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany
				).toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.createMany
				).toHaveBeenCalledWith({
					data: [
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 1,
							text: 'Reason 1'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 1,
							text: 'Reason 2'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 2,
							text: 'Reason 3'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 2,
							text: 'Reason 4'
						}
					]
				});
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is Incomplete with reason text containing blank strings', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

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
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'Incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany
				).toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.createMany
				).toHaveBeenCalledWith({
					data: [
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 1,
							text: 'Reason 1'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 1,
							text: 'Reason 2'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 2,
							text: 'Reason 3'
						},
						{
							lpaQuestionnaireId: lpaQuestionnaire.id,
							lpaQuestionnaireIncompleteReasonId: 2,
							text: 'Reason 4'
						}
					]
				});
				expect(response.status).toEqual(200);
			});

			test('updates an lpa questionnaire when the validation outcome is Incomplete with reason text where blank strings takes the text over 10 items', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[1]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const eightItemArray = new Array(LENGTH_8).fill('A');
				const body = {
					incompleteReasons: [
						{
							id: 1,
							text: [...eightItemArray, '', '']
						}
					],
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'Incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					data: {
						lpaQuestionnaireValidationOutcomeId: lpaQuestionnaireValidationOutcomes[1].id
					},
					where: {
						id: householdAppeal.lpaQuestionnaire.id
					}
				});
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.createMany
				).toHaveBeenCalledWith({
					data: createManyToManyRelationData({
						data: body.incompleteReasons.map(({ id }) => id),
						relationOne: 'lpaQuestionnaireId',
						relationTwo: 'lpaQuestionnaireIncompleteReasonId',
						relationOneId: householdAppeal.lpaQuestionnaire.id
					})
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, [
							'LPA questionnaire'
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany
				).toHaveBeenCalled();
				expect(
					databaseConnector.lPAQuestionnaireIncompleteReasonText.createMany
				).toHaveBeenCalledWith({
					data: new Array(LENGTH_8).fill({
						lpaQuestionnaireId: lpaQuestionnaire.id,
						lpaQuestionnaireIncompleteReasonId: 1,
						text: 'A'
					})
				});
				expect(response.status).toEqual(200);
			});

			test('sends a correctly formatted notify email when the outcome is incomplete for a household appeal', async () => {
				const householdAppeal = householdAppealLPAQuestionnaireIncomplete;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const body = {
					incompleteReasons: [{ id: 1 }, { id: 2 }],
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'Incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledWith({
					notifyClient: expect.anything(),
					personalisation: {
						lpa_reference: householdAppeal.applicationReference,
						appeal_reference_number: householdAppeal.reference,
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						due_date: '22 June 2099',
						reasons: [
							'Documents or information are missing: Policy is missing',
							'Other: Addresses are incorrect or missing'
						]
					},
					recipientEmail: householdAppeal.lpa.email,
					templateName: 'lpaq-incomplete'
				});
				expect(response.status).toEqual(200);
			});

			test('returns an error if appealId is not numeric', async () => {
				const { lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/one/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						validationOutcome: 'Complete'
					})
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

				const { lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/3/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						validationOutcome: 'Complete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if lpaQuestionnaireId is not numeric', async () => {
				const { id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/one`)
					.send({
						validationOutcome: 'Complete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if lpaQuestionnaireId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/3`)
					.send({
						validationOutcome: 'Complete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if incompleteReasons is not a numeric array', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const body = {
					incompleteReasons: [{ id: '1' }, { id: '2' }],
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						incompleteReasons: ERROR_MUST_BE_INCOMPLETE_INVALID_REASON
					}
				});
			});

			test('returns an error if incompleteReasons text contains more than 10 items', async () => {
				const body = {
					incompleteReasons: [
						{
							id: '1',
							text: new Array(LENGTH_10 + 1).fill('A')
						}
					],
					lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
					validationOutcome: 'incomplete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						incompleteReasons: ERROR_MUST_BE_INCOMPLETE_INVALID_REASON
					}
				});
			});

			test('returns an error if validationOutcome is Complete and incompleteReasons is given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }],
						validationOutcome: 'Complete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						incompleteReasons: ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME
					}
				});
			});

			test('returns an error if validationOutcome is Complete and lpaQuestionnaireDueDate is given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
						validationOutcome: 'Complete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME
					}
				});
			});

			test('returns an error if validationOutcome is Incomplete and incompleteReasons is not given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validationOutcome: ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is not in the correct format', async () => {
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }],
						lpaQuestionnaireDueDate: '05/05/2099',
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate does not contain leading zeros', async () => {
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }],
						lpaQuestionnaireDueDate: '2099-5-5',
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is in the past', async () => {
				jest.useFakeTimers({ doNotFake: ['performance'] }).setSystemTime(new Date('2023-06-05'));

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }],
						lpaQuestionnaireDueDate: '2023-06-04T00:00:00.000Z',
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_IN_FUTURE
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is not a valid date', async () => {
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }],
						lpaQuestionnaireDueDate: '2099-02-30X765273865',
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if validationOutcome is invalid', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(undefined);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						validationOutcome: 'invalid'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validationOutcome: ERROR_INVALID_LPA_QUESTIONNAIRE_VALIDATION_OUTCOME
					}
				});
			});

			test('returns an error if incompleteReasons contains an invalid value', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({
						incompleteReasons: [{ id: 1 }, { id: 10 }],
						lpaQuestionnaireDueDate: '2099-06-22T00:00:00.000Z',
						validationOutcome: 'Incomplete'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						incompleteReasons: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if isConservationArea is not a boolean', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id, lpaQuestionnaire } = householdAppeal;
				const body = {
					isConservationArea: 'yes'
				};
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						isConservationArea: ERROR_MUST_BE_BOOLEAN
					}
				});
			});

			test('updates isConservationArea when given boolean true', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const body = {
					isConservationArea: true
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: true
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(body);
			});

			test('updates isConservationArea when given boolean false', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const body = {
					isConservationArea: false
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: false
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(body);
			});

			test('updates isConservationArea when given string true', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: 'true'
				};
				const responseBody = {
					isConservationArea: true
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: true
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isConservationArea when given string false', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: 'false'
				};
				const responseBody = {
					isConservationArea: false
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: false
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isConservationArea when given numeric 1', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: 1
				};
				const responseBody = {
					isConservationArea: true
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: true
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isConservationArea when given numeric 0', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: 0
				};
				const responseBody = {
					isConservationArea: false
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: false
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isConservationArea when given string 1', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: '1'
				};
				const responseBody = {
					isConservationArea: true
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: true
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isConservationArea when given string 0', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					isConservationArea: '0'
				};
				const responseBody = {
					isConservationArea: false
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						inConservationArea: false
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('updates isCorrectAppealType when given boolean false', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const body = {
					isCorrectAppealType: false
				};

				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						isCorrectAppealType: false
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_LPAQ_IS_CORRECT_APPEAL_TYPE_UPDATED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(body);
			});

			test('updates newConditionDetails when given string is less than 8000 characters', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const requestBody = {
					extraConditions: 'a'.repeat(6000)
				};
				const responseBody = {
					extraConditions: 'a'.repeat(6000)
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.lPAQuestionnaire.update).toHaveBeenCalledWith({
					where: { id: householdAppeal.lpaQuestionnaire.id },
					data: {
						newConditionDetails: 'a'.repeat(6000)
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(responseBody);
			});

			test('returns an error if newConditionDetails is more than 8000 characters', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { id, lpaQuestionnaire } = householdAppeal;
				const body = {
					extraConditions: 'a'.repeat(8001)
				};
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						extraConditions: stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [8000])
					}
				});
			});

			test('does not return an error when given an empty body', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { lpaQuestionnaire, id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});

			test('returns an error when unable to save the data', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
					lpaQuestionnaireValidationOutcomes[0]
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaireIncompleteReason.findMany.mockResolvedValue(
					lpaQuestionnaireIncompleteReasons
				);
				// @ts-ignore
				databaseConnector.lPAQuestionnaire.update.mockImplementation(() => {
					throw new Error('Internal Server Error');
				});

				const body = {
					validationOutcome: 'complete'
				};
				const { id, lpaQuestionnaire } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/lpa-questionnaires/${lpaQuestionnaire.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({
					errors: {
						body: ERROR_FAILED_TO_SAVE_DATA
					}
				});
			});
		});
	});
});
