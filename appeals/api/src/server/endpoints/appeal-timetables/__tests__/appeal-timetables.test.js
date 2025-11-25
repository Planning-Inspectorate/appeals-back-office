// @ts-nocheck
import {
	advertisementAppeal,
	casAdvertAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	householdAppeal,
	listedBuildingAppealAppellantCaseValid
} from '#tests/appeals/mocks.js';
import {
	advertisementAppealWithTimetable,
	casAdvertAppealWithTimetable,
	casPlanningAppealWithTimetable,
	fullPlanningAppealWithTimetable,
	houseAppealWithTimetable,
	listedBuildingAppealWithTimetable
} from '#tests/appeals/timetableMocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import { PROCEDURE_TYPE_MAP } from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_HAVE_TIMETABLE_DATE,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import { add } from 'date-fns';
import { mapValues } from 'lodash-es';
import { request } from '../../../app-test.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const baseDate = '2024-06-05T22:50:00.000Z';
jest.useFakeTimers({ doNotFake: ['performance'] }).setSystemTime(new Date(baseDate));

const futureDate = add(new Date(baseDate), { days: 5 });
const withoutWeekends = await recalculateDateIfNotBusinessDay(futureDate.toISOString());
const utcDate = setTimeInTimeZone(withoutWeekends, 0, 0);
const responseDateSet = setTimeInTimeZone(utcDate, DEADLINE_HOUR, DEADLINE_MINUTE).toISOString();

describe('appeal timetables routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('/appeals/:appealId/appeal-timetables/:appealTimetableId', () => {
		describe('PATCH', () => {
			const householdAppealRequestBody = {
				lpaQuestionnaireDueDate: utcDate.toISOString()
			};
			const fullPlanningAppealRequestBody = {
				lpaQuestionnaireDueDate: utcDate.toISOString(),
				lpaStatementDueDate: utcDate.toISOString()
			};

			const householdAppealResponseBody = {
				lpaQuestionnaireDueDate: responseDateSet
			};
			const fullPlanningAppealResponseBody = {
				lpaQuestionnaireDueDate: responseDateSet,
				lpaStatementDueDate: responseDateSet
			};

			test.each([
				[
					'householder',
					houseAppealWithTimetable,
					householdAppealRequestBody,
					householdAppealResponseBody
				],
				[
					'cas planning',
					casPlanningAppealWithTimetable,
					householdAppealRequestBody,
					householdAppealResponseBody
				],
				[
					'cas advert',
					casAdvertAppealWithTimetable,
					householdAppealRequestBody,
					householdAppealResponseBody
				]
			])(
				'updates a %s appeal timetable and sends notify',
				async (_, appealWithTimetable, requestBody, responseBody) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appealWithTimetable);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});
					databaseConnector.appealTimetable.update.mockResolvedValue(1);

					const { appealTimetable, id } = appealWithTimetable;
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send(requestBody)
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.appealTimetable.update).toHaveBeenCalledWith({
						data: responseBody,
						where: {
							appealId: appealWithTimetable.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appealWithTimetable.id,
							details: 'Timetable updated:<br>• LPA questionnaire due date changed to 10 June 2024',
							loggedAt: expect.any(Date),
							userId: appealWithTimetable.caseOfficer.id
						}
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						personalisation: {
							appeal_reference_number: appealWithTimetable.reference,
							final_comments_due_date: dateISOStringToDisplayDate(
								responseBody?.finalCommentsDueDate
							),
							ip_comments_due_date: dateISOStringToDisplayDate(responseBody?.ipCommentsDueDate),
							lpa_questionnaire_due_date: dateISOStringToDisplayDate(
								responseBody?.lpaQuestionnaireDueDate
							),
							lpa_reference: appealWithTimetable.applicationReference,
							lpa_statement_due_date: dateISOStringToDisplayDate(responseBody?.lpaStatementDueDate),
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appealWithTimetable.agent.email,
						templateName: 'has-appeal-timetable-updated'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						personalisation: {
							appeal_reference_number: appealWithTimetable.reference,
							final_comments_due_date: dateISOStringToDisplayDate(
								responseBody?.finalCommentsDueDate
							),
							ip_comments_due_date: dateISOStringToDisplayDate(responseBody?.ipCommentsDueDate),
							lpa_questionnaire_due_date: dateISOStringToDisplayDate(
								responseBody?.lpaQuestionnaireDueDate
							),
							lpa_reference: appealWithTimetable.applicationReference,
							lpa_statement_due_date: dateISOStringToDisplayDate(responseBody?.lpaStatementDueDate),
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appealWithTimetable.lpa.email,
						templateName: 'has-appeal-timetable-updated'
					});

					expect(response.status).toEqual(200);
					expect(response.body).toEqual(householdAppealRequestBody);
				}
			);

			test.each([
				[
					'full planning',
					fullPlanningAppealWithTimetable,
					fullPlanningAppealRequestBody,
					fullPlanningAppealResponseBody
				],
				[
					'advert',
					advertisementAppealWithTimetable,
					householdAppealRequestBody,
					householdAppealResponseBody
				]
			])(
				'updates a %s appeal timetable and sends notify',
				async (_, appealWithTimetable, requestBody, responseBody) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appealWithTimetable);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const { appealTimetable, id } = appealWithTimetable;
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send(requestBody)
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.appealTimetable.update).toHaveBeenCalledWith({
						data: responseBody,
						where: {
							appealId: appealWithTimetable.id
						}
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						personalisation: {
							appeal_reference_number: appealWithTimetable.reference,
							final_comments_due_date: dateISOStringToDisplayDate(
								responseBody?.finalCommentsDueDate
							),
							ip_comments_due_date: dateISOStringToDisplayDate(responseBody?.ipCommentsDueDate),
							lpa_questionnaire_due_date: dateISOStringToDisplayDate(
								responseBody?.lpaQuestionnaireDueDate
							),
							lpa_reference: appealWithTimetable.applicationReference,
							lpa_statement_due_date: dateISOStringToDisplayDate(responseBody?.lpaStatementDueDate),
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appealWithTimetable.agent.email,
						templateName: 'appeal-timetable-updated'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						personalisation: {
							appeal_reference_number: appealWithTimetable.reference,
							final_comments_due_date: dateISOStringToDisplayDate(
								responseBody?.finalCommentsDueDate
							),
							ip_comments_due_date: dateISOStringToDisplayDate(responseBody?.ipCommentsDueDate),
							lpa_questionnaire_due_date: dateISOStringToDisplayDate(
								responseBody?.lpaQuestionnaireDueDate
							),
							lpa_reference: appealWithTimetable.applicationReference,
							lpa_statement_due_date: dateISOStringToDisplayDate(responseBody?.lpaStatementDueDate),
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appealWithTimetable.lpa.email,
						templateName: 'appeal-timetable-updated'
					});

					expect(response.status).toEqual(200);
					expect(response.body).toEqual(requestBody);
				}
			);

			test('updates a full planning appeal timetable when appeal is a linked lead appeal', async () => {
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				const child = { ...fullPlanningAppeal, id: 4 };
				const appealWithTimetable = structuredClone(fullPlanningAppealWithTimetable);
				appealWithTimetable.childAppeals = [{ child }];
				const requestBody = structuredClone(householdAppealRequestBody);
				const responseBody = structuredClone(householdAppealResponseBody);
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithTimetable);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { appealTimetable, id } = appealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(requestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealTimetable.update).toHaveBeenCalledTimes(2);

				expect(databaseConnector.appealTimetable.update).toHaveBeenNthCalledWith(1, {
					data: responseBody,
					where: {
						appealId: appealWithTimetable.id
					}
				});

				expect(databaseConnector.appealTimetable.update).toHaveBeenNthCalledWith(2, {
					data: responseBody,
					where: {
						appealId: child.id
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: id,
						details: 'Timetable updated:<br>• LPA questionnaire due date changed to 10 June 2024',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(requestBody);
			});

			test('returns an error if appealId is not numeric', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request
					.patch(`/appeals/one/appeal-timetables/${houseAppealWithTimetable.appealTimetable.id}`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if appealId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const { appealTimetable } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/3/appeal-timetables/${appealTimetable.id}`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if appealTimetableId is not numeric', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/appeal-timetables/one`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealTimetableId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if appealTimetableId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { id } = householdAppeal;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/3`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealTimetableId: ERROR_NOT_FOUND
					}
				});
			});

			[
				'issueDeterminationDate',
				'lpaQuestionnaireDueDate',
				'lpaStatementDueDate',
				'statementOfCommonGroundDueDate',
				'planningObligationDueDate'
			].forEach((fieldName) => {
				test(`returns an error if ${fieldName} is not in the correct format`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send({
							[fieldName]: '05/05/2023'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
						}
					});
				});

				test(`returns an error if ${fieldName} does not contain leading zeros`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send({
							[fieldName]: '2023-5-5'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
						}
					});
				});

				test(`returns an error if ${fieldName} is not in the future`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const body = {
						[fieldName]: '2023-06-04T23:59:00.000Z'
					};
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_IN_FUTURE
						}
					});
				});

				test(`returns an error if ${fieldName} is a weekend day`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const body = {
						[fieldName]: '2099-09-19T23:59:00.000Z'
					};
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_BUSINESS_DAY
						}
					});
				});

				test(`returns an error if ${fieldName} is a bank holiday day`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const body = {
						[fieldName]: '2025-12-25T23:59:00.000Z'
					};
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send(body)
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_BUSINESS_DAY
						}
					});
				});

				test(`returns an error if ${fieldName} is not a valid date`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

					const { appealTimetable, id } = houseAppealWithTimetable;
					const response = await request
						.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
						.send({
							[fieldName]: '2099-02-30'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.body).toEqual({
						errors: {
							[fieldName]: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
						}
					});
				});
			});

			test('returns an error if lpaStatementDueDate is given for a household appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, appealType, id } = houseAppealWithTimetable;
				const body = {
					lpaStatementDueDate: utcDate.toISOString()
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: stringTokenReplacement(ERROR_MUST_NOT_HAVE_TIMETABLE_DATE, [
							appealType.key
						])
					}
				});
			});

			test('does not return an error when given an empty body', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});

			test('returns an error when unable to save the data', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);
				// @ts-ignore
				databaseConnector.appealTimetable.update.mockImplementation(() => {
					throw new Error('Internal Server Error');
				});

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealTimetable.update).toHaveBeenCalledWith({
					data: householdAppealResponseBody,
					where: {
						appealId: houseAppealWithTimetable.id
					}
				});
				expect(response.status).toEqual(500);
				expect(response.body).toEqual({
					errors: {
						body: ERROR_FAILED_TO_SAVE_DATA
					}
				});
			});
		});
	});
	describe('/appeals/:appealId/appeal-timetables', () => {
		describe('POST', () => {
			describe.each([
				[
					'householdAppeal',
					houseAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' },
					{}
				],
				[
					'casPlanningAppeal',
					casPlanningAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' },
					{}
				],
				[
					'casAdvertAppeal',
					casAdvertAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' },
					{}
				],
				[
					'advertisementAppeal',
					advertisementAppealWithTimetable,
					{
						appellantStatementDueDate: '2024-07-17T22:59:00.000Z',
						finalCommentsDueDate: '2024-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-17T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-19T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-17T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-17T22:59:00.000Z'
					},
					{}
				],
				[
					'fullPlanningAppeal',
					fullPlanningAppealWithTimetable,
					{
						lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
						appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-24T22:59:00.000Z'
					},
					{
						statement_of_common_ground_deadline: '',
						planning_obligation_deadline: ''
					}
				],
				[
					'listedBuildingAppeal',
					listedBuildingAppealWithTimetable,
					{
						lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
						appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-24T22:59:00.000Z'
					},
					{}
				]
			])(
				'updates a %s appeal timetable',
				(_, appeal, expectedResponse, additionalPersonalisation) => {
					test('when procedure type is written', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
						// @ts-ignore
						databaseConnector.user.upsert.mockResolvedValue({
							id: 1,
							azureAdUserId
						});

						const { id } = appeal;
						const response = await request
							.post(`/appeals/${id}/appeal-timetables/`)
							.send()
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(201);
						expect(response.body).toEqual(expectedResponse);

						expect(mockNotifySend).toHaveBeenCalledTimes(2);

						expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
							azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
							notifyClient: expect.anything(),
							personalisation: {
								appeal_reference_number: appeal.reference,
								appeal_type: appeal.appealType.type,
								appellant_email_address: appeal.appellant.email,
								child_appeals: [],
								comment_deadline: '',
								due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								final_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.finalCommentsDueDate || ''
								),
								ip_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.ipCommentsDueDate || ''
								),
								local_planning_authority: appeal.lpa.name,
								lpa_reference: appeal.applicationReference,
								lpa_statement_deadline: dateISOStringToDisplayDate(
									expectedResponse.lpaStatementDueDate || ''
								),
								procedure_type: 'written representations',
								questionnaire_due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
								start_date: '5 June 2024',
								we_will_email_when:
									'when you can view information from other parties in the appeals service.',
								site_visit: true,
								costs_info: true,
								statement_of_common_ground_deadline: '',
								team_email_address: 'caseofficers@planninginspectorate.gov.uk'
							},
							recipientEmail: appeal.appellant.email,
							templateName: 'appeal-start-date-change-appellant'
						});

						expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
							azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
							notifyClient: expect.anything(),
							personalisation: {
								appeal_reference_number: appeal.reference,
								appeal_type: appeal.appealType.type,
								appellant_email_address: appeal.appellant.email,
								child_appeals: [],
								comment_deadline: '',
								due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								final_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.finalCommentsDueDate || ''
								),
								ip_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.ipCommentsDueDate || ''
								),
								local_planning_authority: appeal.lpa.name,
								lpa_reference: appeal.applicationReference,
								lpa_statement_deadline: dateISOStringToDisplayDate(
									expectedResponse.lpaStatementDueDate || ''
								),
								procedure_type: 'written representations',
								questionnaire_due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
								start_date: '5 June 2024',
								statement_of_common_ground_deadline: '',
								...additionalPersonalisation,
								team_email_address: 'caseofficers@planninginspectorate.gov.uk'
							},
							recipientEmail: appeal.lpa.email,
							templateName: 'appeal-start-date-change-lpa'
						});
					});

					test('when procedure type is undefined', async () => {
						// @ts-ignore
						appeal.procedureType = undefined;
						databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
						// @ts-ignore
						databaseConnector.user.upsert.mockResolvedValue({
							id: 1,
							azureAdUserId
						});

						const { id } = appeal;
						const response = await request
							.post(`/appeals/${id}/appeal-timetables/`)
							.send()
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(201);
						expect(response.body).toEqual(expectedResponse);

						expect(mockNotifySend).toHaveBeenCalledTimes(2);

						expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
							azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
							notifyClient: expect.anything(),
							personalisation: {
								appeal_reference_number: appeal.reference,
								appeal_type: appeal.appealType.type,
								appellant_email_address: appeal.appellant.email,
								child_appeals: [],
								comment_deadline: '',
								due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								final_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.finalCommentsDueDate || ''
								),
								ip_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.ipCommentsDueDate || ''
								),
								local_planning_authority: appeal.lpa.name,
								lpa_reference: appeal.applicationReference,
								lpa_statement_deadline: dateISOStringToDisplayDate(
									expectedResponse.lpaStatementDueDate || ''
								),
								procedure_type: 'written representations',
								questionnaire_due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
								start_date: '5 June 2024',
								we_will_email_when:
									'when you can view information from other parties in the appeals service.',
								site_visit: true,
								costs_info: true,
								statement_of_common_ground_deadline: '',
								team_email_address: 'caseofficers@planninginspectorate.gov.uk'
							},
							recipientEmail: appeal.appellant.email,
							templateName: 'appeal-start-date-change-appellant'
						});

						expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
							azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
							notifyClient: expect.anything(),
							personalisation: {
								appeal_reference_number: appeal.reference,
								appeal_type: appeal.appealType.type,
								appellant_email_address: appeal.appellant.email,
								child_appeals: [],
								comment_deadline: '',
								due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								final_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.finalCommentsDueDate || ''
								),
								ip_comments_deadline: dateISOStringToDisplayDate(
									expectedResponse.ipCommentsDueDate || ''
								),
								local_planning_authority: appeal.lpa.name,
								lpa_reference: appeal.applicationReference,
								lpa_statement_deadline: dateISOStringToDisplayDate(
									expectedResponse.lpaStatementDueDate || ''
								),
								procedure_type: 'written representations',
								questionnaire_due_date: dateISOStringToDisplayDate(
									expectedResponse.lpaQuestionnaireDueDate || ''
								),
								site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
								start_date: '5 June 2024',
								statement_of_common_ground_deadline: '',
								...additionalPersonalisation,
								team_email_address: 'caseofficers@planninginspectorate.gov.uk'
							},
							recipientEmail: appeal.lpa.email,
							templateName: 'appeal-start-date-change-lpa'
						});
					});
				}
			);

			test.each([
				[
					'householdAppeal',
					houseAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-10T22:59:00.000Z' },
					{}
				],
				[
					'casPlanningAppeal',
					casPlanningAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-10T22:59:00.000Z' },
					{}
				],
				[
					'casAdvertAppeal',
					casAdvertAppealWithTimetable,
					{ lpaQuestionnaireDueDate: '2024-06-10T22:59:00.000Z' },
					{}
				],
				[
					'advertisementAppeal',
					advertisementAppealWithTimetable,
					{
						appellantStatementDueDate: '2024-07-15T22:59:00.000Z',
						finalCommentsDueDate: '2024-08-05T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-15T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-17T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-15T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-15T22:59:00.000Z'
					},
					{}
				],
				[
					'fullPlanningAppeal',
					fullPlanningAppealWithTimetable,
					{
						lpaQuestionnaireDueDate: '2024-06-10T22:59:00.000Z',
						appellantStatementDueDate: '2024-07-08T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-22T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-08T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-08T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-22T22:59:00.000Z'
					},
					{
						statement_of_common_ground_deadline: '',
						planning_obligation_deadline: ''
					}
				],
				[
					'listedBuildingAppeal',
					listedBuildingAppealWithTimetable,
					{
						lpaQuestionnaireDueDate: '2024-06-10T22:59:00.000Z',
						appellantStatementDueDate: '2024-07-08T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-22T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-08T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-08T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-22T22:59:00.000Z'
					},
					{}
				]
			])(
				'update the start date on a weekend should change it to the following working day',
				async (_, appeal, expectedResponse, additionalPersonalisation) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ startDate: '2024-06-01T22:59:00.000Z' }) // saturday
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(expectedResponse);

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedResponse.lpaQuestionnaireDueDate || ''),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedResponse.finalCommentsDueDate || ''
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedResponse.ipCommentsDueDate || ''
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedResponse.lpaStatementDueDate || ''
							),
							procedure_type: 'written representations',
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedResponse.lpaQuestionnaireDueDate || ''
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '3 June 2024', // the following working day
							we_will_email_when:
								'when you can view information from other parties in the appeals service.',
							site_visit: true,
							costs_info: true,
							statement_of_common_ground_deadline: '',
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-start-date-change-appellant'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedResponse.lpaQuestionnaireDueDate || ''),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedResponse.finalCommentsDueDate || ''
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedResponse.ipCommentsDueDate || ''
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedResponse.lpaStatementDueDate || ''
							),
							procedure_type: 'written representations',
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedResponse.lpaQuestionnaireDueDate || ''
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '3 June 2024', // the following working day
							statement_of_common_ground_deadline: '',
							...additionalPersonalisation,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-start-date-change-lpa'
					});
				}
			);

			test.each([
				['householdAppeal', householdAppeal],
				['casPlanningAppeal', casPlanningAppeal],
				['casAdvertAppeal', casAdvertAppeal]
			])('start a %s timetable', async (_, appeal) => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id } = appeal;
				const response = await request
					.post(`/appeals/${id}/appeal-timetables/`)
					.send()
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
				expect(response.body).toEqual({ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' });

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: appeal.appealType.type,
						appellant_email_address: appeal.appellant.email,
						child_appeals: [],
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: appeal.lpa.name,
						lpa_reference: appeal.applicationReference,
						lpa_statement_deadline: '',
						procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
						questionnaire_due_date: '12 June 2024',
						site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
						start_date: '5 June 2024',
						we_will_email_when:
							'when you can view information from other parties in the appeals service.',
						site_visit: true,
						costs_info: true,
						statement_of_common_ground_deadline: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appeal.appellant.email,
					templateName: 'appeal-valid-start-case-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: appeal.reference,
						appeal_type: appeal.appealType.type,
						appellant_email_address: appeal.appellant.email,
						child_appeals: [],
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: appeal.lpa.name,
						lpa_reference: appeal.applicationReference,
						lpa_statement_deadline: '',
						procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
						questionnaire_due_date: '12 June 2024',
						site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
						start_date: '5 June 2024',
						statement_of_common_ground_deadline: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appeal.lpa.email,
					templateName: 'appeal-valid-start-case-lpa'
				});
			});

			describe.each([
				[
					'fullPlanning',
					{ ...fullPlanningAppeal, procedureType: { key: 'hearing' } },
					{
						appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-24T22:59:00.000Z',
						statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
					},
					{ statement_of_common_ground_deadline: '10 July 2024', planning_obligation_deadline: '' }
				],
				[
					'listedBuilding',
					{ ...listedBuildingAppealAppellantCaseValid, procedureType: { key: 'hearing' } },
					{
						appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-24T22:59:00.000Z',
						statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
					},
					{}
				],
				[
					'advertisementAppeal',
					{ ...advertisementAppeal, procedureType: { key: 'hearing' } },
					{
						appellantStatementDueDate: '2024-07-17T22:59:00.000Z',
						finalCommentsDueDate: '2024-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-17T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-19T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-17T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-17T22:59:00.000Z',
						statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
					},
					{}
				]
			])('for a %s appeal', (appealType, appeal, expectedTimetableDto, personalisation) => {
				test(`start an appeal timetable with a hearing procedure type`, async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal
					});
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});
					const timetable = mapValues(expectedTimetableDto, (date) => new Date(date));

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ procedureType: 'hearing' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(expectedTimetableDto);

					expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
						create: { ...timetable, appealId: id },
						update: { ...timetable },
						where: { appealId: id },
						include: { appeal: true }
					});

					const auditDetails =
						appealType === 'fullPlanning'
							? ['The case timeline was created', 'Appeal started\nAppeal procedure: hearing']
							: ['The case timeline was created'];

					auditDetails.forEach((details) => {
						expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
							data: {
								appealId: id,
								details,
								loggedAt: expect.any(Date),
								userId: 1
							}
						});
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							we_will_email_when: [
								'to let you know when you can view information from other parties in the appeals service',
								'when we set up your hearing'
							],
							site_visit: false,
							costs_info: false,
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-valid-start-case-s78-appellant'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							...personalisation,
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-valid-start-case-s78-lpa'
					});
				});

				test(`start an appeal timetable with a hearing procedure type and a hearing start time`, async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal
					});
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const timetable = mapValues(expectedTimetableDto, (date) => new Date(date));

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ procedureType: 'hearing', hearingStartTime: '2024-07-10T13:45:00.000Z' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(expectedTimetableDto);

					expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
						create: { ...timetable, appealId: id },
						update: { ...timetable },
						where: { appealId: id },
						include: { appeal: true }
					});
					expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
						where: { id },
						data: {
							caseStartedDate: '2024-06-04T23:00:00.000Z',
							caseUpdatedDate: new Date('2024-06-05T22:50:00.000Z'),
							hearing: {
								upsert: {
									create: {
										hearingStartTime: '2024-07-10T13:45:00.000Z'
									},
									update: {
										hearingStartTime: '2024-07-10T13:45:00.000Z'
									},
									where: {
										appealId: id
									}
								}
							},
							procedureTypeId: 1
						},
						include: {
							appealStatus: true,
							appealType: true
						}
					});

					const auditDetails =
						appealType === 'fullPlanning'
							? ['The case timeline was created', 'Appeal started\nAppeal procedure: hearing']
							: ['The case timeline was created'];

					auditDetails.forEach((details) => {
						expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
							data: {
								appealId: id,
								details,
								loggedAt: expect.any(Date),
								userId: 1
							}
						});
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							we_will_email_when: [
								'to let you know when you can view information from other parties in the appeals service',
								'when we set up your hearing'
							],
							site_visit: false,
							costs_info: false,
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							hearing_date: '10 July 2024',
							hearing_time: '2:45pm',
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-valid-start-case-s78-appellant-hearing'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							hearing_date: '10 July 2024',
							hearing_time: '2:45pm',
							...personalisation,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-valid-start-case-s78-lpa-hearing'
					});
				});

				test(`restart an appeal timetable with a hearing procedure type`, async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						caseStartedDate: '2024-06-05T22:59:00.000Z'
					});
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const timetable = mapValues(expectedTimetableDto, (date) => new Date(date));

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ startDate: '2024-06-05T22:59:00.000Z' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(expectedTimetableDto);

					expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
						create: { ...timetable, appealId: id },
						update: { ...timetable },
						where: { appealId: id },
						include: { appeal: true }
					});

					const auditDetails =
						appealType === 'fullPlanning'
							? ['The case timeline was created', 'Appeal started\nAppeal procedure: hearing']
							: ['The case timeline was created'];

					auditDetails.forEach((details) => {
						expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
							data: {
								appealId: id,
								details,
								loggedAt: expect.any(Date),
								userId: 1
							}
						});
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							we_will_email_when: [
								'to let you know when you can view information from other parties in the appeals service',
								'when we set up your hearing'
							],
							site_visit: false,
							costs_info: false,
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-start-date-change-appellant'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: [],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							...personalisation,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-start-date-change-lpa'
					});
				});

				test(`start an appeal timetable for a lead appeal`, async () => {
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal,
						childAppeals: [
							{ type: CASE_RELATIONSHIP_LINKED, childRef: '1111111' },
							{ type: CASE_RELATIONSHIP_RELATED, childRef: '2222222' },
							{ type: CASE_RELATIONSHIP_LINKED, childRef: '3333333' }
						]
					});
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const timetable = mapValues(expectedTimetableDto, (date) => new Date(date));

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ procedureType: 'hearing' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(expectedTimetableDto);

					expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
						create: { ...timetable, appealId: id },
						update: { ...timetable },
						where: { appealId: id },
						include: { appeal: true }
					});

					const auditDetails =
						appealType === 'fullPlanning'
							? ['The case timeline was created', 'Appeal started\nAppeal procedure: hearing']
							: ['The case timeline was created'];

					auditDetails.forEach((details) => {
						expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
							data: {
								appealId: id,
								details,
								loggedAt: expect.any(Date),
								userId: 1
							}
						});
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: ['1111111', '3333333'],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							we_will_email_when: [
								'to let you know when you can view information from other parties in the appeals service',
								'when we set up your hearing'
							],
							site_visit: false,
							costs_info: false,
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-valid-start-case-s78-appellant'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							child_appeals: ['1111111', '3333333'],
							comment_deadline: '',
							due_date: dateISOStringToDisplayDate(expectedTimetableDto.lpaQuestionnaireDueDate),
							final_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.finalCommentsDueDate
							),
							ip_comments_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.ipCommentsDueDate
							),
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaStatementDueDate
							),
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: dateISOStringToDisplayDate(
								expectedTimetableDto.lpaQuestionnaireDueDate
							),
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							statement_of_common_ground_deadline: dateISOStringToDisplayDate(
								expectedTimetableDto.statementOfCommonGroundDueDate
							),
							...personalisation,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-valid-start-case-s78-lpa'
					});
				});
			});

			test('empty object', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({});
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id } = householdAppeal;
				const response = await request
					.post(`/appeals/${id}/appeal-timetables/`)
					.send()
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: { appealId: 'Not found' } });
			});

			test('null return', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id } = householdAppeal;
				const response = await request
					.post(`/appeals/${id}/appeal-timetables/`)
					.send()
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: { appealId: 'Not found' } });
			});

			test('start an appeal timetable with no appeal type', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					appealType: {}
				});
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id } = householdAppeal;
				const response = await request
					.post(`/appeals/${id}/appeal-timetables/`)
					.send()
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: { appealId: 'Not found' }
				});
			});
		});
	});

	describe('GET /appeals/:appealId/appeal-timetables/calculate', () => {
		beforeEach(() => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);
		});

		test('returns the calculated appeal timetable', async () => {
			const { id } = fullPlanningAppeal;
			const response = await request
				.get(
					`/appeals/${id}/appeal-timetables/calculate?startDate=2024-06-12T22:59:00.000Z&procedureType=hearing`
				)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				appellantStatementDueDate: '2024-07-17T22:59:00.000Z',
				finalCommentsDueDate: '2024-07-31T22:59:00.000Z',
				ipCommentsDueDate: '2024-07-17T22:59:00.000Z',
				lpaQuestionnaireDueDate: '2024-06-19T22:59:00.000Z',
				lpaStatementDueDate: '2024-07-17T22:59:00.000Z',
				s106ObligationDueDate: '2024-07-31T22:59:00.000Z',
				statementOfCommonGroundDueDate: '2024-07-17T22:59:00.000Z',
				startDate: '2024-06-11T23:00:00.000Z'
			});
		});

		test('returns the calculated appeal timetable for a weekend start date', async () => {
			const { id } = fullPlanningAppeal;
			const response = await request
				.get(
					`/appeals/${id}/appeal-timetables/calculate?startDate=2024-06-15T22:59:00.000Z&procedureType=hearing`
				)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				appellantStatementDueDate: '2024-07-22T22:59:00.000Z',
				finalCommentsDueDate: '2024-08-05T22:59:00.000Z',
				ipCommentsDueDate: '2024-07-22T22:59:00.000Z',
				lpaQuestionnaireDueDate: '2024-06-24T22:59:00.000Z',
				lpaStatementDueDate: '2024-07-22T22:59:00.000Z',
				s106ObligationDueDate: '2024-08-05T22:59:00.000Z',
				statementOfCommonGroundDueDate: '2024-07-22T22:59:00.000Z',
				startDate: '2024-06-16T23:00:00.000Z'
			});
		});

		test('returns the calculated appeal timetable with no start date', async () => {
			const { id } = fullPlanningAppeal;
			const response = await request
				.get(`/appeals/${id}/appeal-timetables/calculate?procedureType=hearing`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
				finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
				ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
				lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
				lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
				s106ObligationDueDate: '2024-07-24T22:59:00.000Z',
				startDate: '2024-06-04T23:00:00.000Z',
				statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
			});
		});
	});

	describe('POST /appeals/:appealId/appeal-timetables/notify-preview', () => {
		test('returns the rendered HTML of the emails that would be sent to the relevant parties', async () => {
			const appeal = {
				...fullPlanningAppeal
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);

			const { id } = fullPlanningAppeal;
			const response = await request
				.post(`/appeals/${id}/appeal-timetables/notify-preview`)
				.set('azureAdUserId', azureAdUserId)
				.send({
					startDate: '2024-06-12T22:59:00.000Z',
					procedureType: 'hearing',
					hearingStartTime: '2024-06-12T12:00:00.000Z'
				});

			expect(response.status).toEqual(200);
			const appellantPreview = response.body.appellant;
			const lpaPreview = response.body.lpa;
			expect(appellantPreview).toContain(
				'Your appeal started on 12 June 2024. The timetable for the appeal begins from this date'
			);
			expect(lpaPreview).toContain(
				'You have a new planning appeal against the application 48269/APP/2021/1482.'
			);
		});

		test('returns an error if the appeal is a child appeal', async () => {
			const appeal = {
				...fullPlanningAppeal,
				parentAppeals: [{ type: CASE_RELATIONSHIP_LINKED }]
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			const { id } = fullPlanningAppeal;
			const response = await request
				.post(`/appeals/${id}/appeal-timetables/notify-preview`)
				.set('azureAdUserId', azureAdUserId)
				.send({
					startDate: '2024-06-12T22:59:00.000Z',
					procedureType: 'hearing',
					hearingStartTime: '2024-06-12T12:00:00.000Z'
				});

			expect(response.status).toEqual(500);
			expect(response.body).toMatchObject({
				errors: {
					body: 'failed to populate notification email due to Emails are not sent for child appeals.'
				}
			});
		});

		test('returns an error if the appeal is not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			const { id } = fullPlanningAppeal;
			const response = await request
				.post(`/appeals/${id}/appeal-timetables/notify-preview`)
				.set('azureAdUserId', azureAdUserId)
				.send({
					startDate: '2024-06-12T22:59:00.000Z',
					procedureType: 'hearing',
					hearingStartTime: '2024-06-12T12:00:00.000Z'
				});

			expect(response.status).toEqual(404);
			expect(response.body).toMatchObject({
				errors: { appealId: 'Not found' }
			});
		});
	});
});
