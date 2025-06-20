// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { mapValues } from 'lodash-es';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_HAVE_TIMETABLE_DATE,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, fullPlanningAppeal, listedBuildingAppeal } from '#tests/appeals/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { add } from 'date-fns';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import { DEADLINE_HOUR } from '@pins/appeals/constants/dates.js';
import { DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { PROCEDURE_TYPE_MAP } from '@pins/appeals/constants/common.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const baseDate = '2024-06-05T22:50:00.000Z';
jest.useFakeTimers({ doNotFake: ['performance'] }).setSystemTime(new Date(baseDate));

const futureDate = add(new Date(baseDate), { days: 5 });
const withoutWeekends = await recalculateDateIfNotBusinessDay(futureDate.toISOString());
const utcDate = setTimeInTimeZone(withoutWeekends, 0, 0);
const responseDateSet = setTimeInTimeZone(utcDate, DEADLINE_HOUR, DEADLINE_MINUTE).toISOString();

const houseAppealWithTimetable = {
	...householdAppeal,
	caseStartedDate: new Date(2022, 4, 18),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z')
	}
};

const fullPlanningAppealWithTimetable = {
	...fullPlanningAppeal,
	caseStartedDate: new Date(2022, 4, 22),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z'),
		lpaStatementDueDate: null
	}
};

const listedBuildingAppealWithTimetable = {
	...listedBuildingAppeal,
	caseStartedDate: new Date(2022, 4, 22),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z'),
		lpaStatementDueDate: null
	}
};

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

			test('updates a household appeal timetable', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				databaseConnector.appealTimetable.update.mockResolvedValue(1);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(householdAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealTimetable.update).toHaveBeenCalledWith({
					data: householdAppealResponseBody,
					where: {
						id: appealTimetable.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: 'Timetable updated:<br>• LPA questionnaire due date changed to 10 June 2024',
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(householdAppealRequestBody);
			});

			test.each([
				[
					'full planning',
					fullPlanningAppealWithTimetable,
					fullPlanningAppealRequestBody,
					fullPlanningAppealResponseBody
				],
				[
					'listed building',
					listedBuildingAppealWithTimetable,
					fullPlanningAppealRequestBody,
					fullPlanningAppealResponseBody
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
							id: appealTimetable.id
						}
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
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
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`
						},
						recipientEmail: appealWithTimetable.agent.email,
						templateName: 'appeal-timetable-updated'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
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
							site_address: `${appealWithTimetable.address.addressLine1}, ${appealWithTimetable.address.addressLine2}, ${appealWithTimetable.address.addressTown}, ${appealWithTimetable.address.addressCounty}, ${appealWithTimetable.address.postcode}, ${appealWithTimetable.address.addressCountry}`
						},
						recipientEmail: appealWithTimetable.lpa.email,
						templateName: 'appeal-timetable-updated'
					});

					expect(response.status).toEqual(200);
					expect(response.body).toEqual(requestBody);
				}
			);

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
						id: appealTimetable.id
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
			test('updates a household appeal timetable', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);
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

				expect(response.status).toEqual(201);
				expect(response.body).toEqual({ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' });

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Householder',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '',
						procedure_type: 'written representations',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024',
						we_will_email_when:
							'when you can view information from other parties in the appeals service.',
						site_visit: true,
						costs_info: true
					},
					recipientEmail: householdAppeal.appellant.email,
					templateName: 'appeal-start-date-change-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Householder',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '',
						procedure_type: 'written representations',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.lpa.email,
					templateName: 'appeal-start-date-change-lpa'
				});
			});

			test('start a household appeal timetable', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
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

				expect(response.status).toEqual(201);
				expect(response.body).toEqual({ lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z' });

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Householder',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '',
						procedure_type: 'written representations',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024',
						we_will_email_when:
							'when you can view information from other parties in the appeals service.',
						site_visit: true,
						costs_info: true
					},
					recipientEmail: householdAppeal.appellant.email,
					templateName: 'appeal-valid-start-case-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Householder',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '',
						ip_comments_deadline: '',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '',
						procedure_type: 'written representations',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.lpa.email,
					templateName: 'appeal-valid-start-case-lpa'
				});
			});

			test.each([
				[
					'fullPlanning',
					{ ...fullPlanningAppeal, procedureType: { key: 'hearing' } },
					{ statement_of_common_ground_deadline: '10 July 2024', planning_obligation_deadline: '' }
				],
				['listedBuilding', { ...listedBuildingAppeal, procedureType: { key: 'hearing' } }, {}]
			])(
				'start an %s appeal timetable with a hearing procedure type',
				async (appealType, appeal, personalisation) => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...appeal
					});
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const s78timetableDto = {
						appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
						finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
						ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
						lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
						s106ObligationDueDate: '2024-07-24T22:59:00.000Z',
						statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
					};
					const s78timetable = mapValues(s78timetableDto, (date) => new Date(date));

					const { id } = appeal;
					const response = await request
						.post(`/appeals/${id}/appeal-timetables/`)
						.send({ procedureType: 'hearing' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(response.body).toEqual(s78timetableDto);

					expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
						create: { ...s78timetable, appealId: id },
						update: { ...s78timetable },
						where: { appealId: id },
						include: { appeal: true }
					});

					const auditDetails =
						appealType === 'fullPlanning'
							? ['The case timeline was created', 'Case started\nAppeal procedure: hearing']
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
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							comment_deadline: '',
							due_date: '12 June 2024',
							final_comments_deadline: '24 July 2024',
							ip_comments_deadline: '10 July 2024',
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: '10 July 2024',
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: '12 June 2024',
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							we_will_email_when: [
								'to let you know when you can view information from other parties in the appeals service',
								'when we set up your hearing'
							],
							site_visit: false,
							costs_info: false
						},
						recipientEmail: appeal.appellant.email,
						templateName: 'appeal-valid-start-case-s78-appellant'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: appeal.reference,
							appeal_type: appeal.appealType.type,
							appellant_email_address: appeal.appellant.email,
							comment_deadline: '',
							due_date: '12 June 2024',
							final_comments_deadline: '24 July 2024',
							ip_comments_deadline: '10 July 2024',
							local_planning_authority: appeal.lpa.name,
							lpa_reference: appeal.applicationReference,
							lpa_statement_deadline: '10 July 2024',
							procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType.key],
							questionnaire_due_date: '12 June 2024',
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_date: '5 June 2024',
							...personalisation
						},
						recipientEmail: appeal.lpa.email,
						templateName: 'appeal-valid-start-case-s78-lpa'
					});
				}
			);

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
});
