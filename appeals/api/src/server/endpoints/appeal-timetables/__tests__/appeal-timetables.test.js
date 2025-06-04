// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_HAVE_TIMETABLE_DATE,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, fullPlanningAppeal } from '#tests/appeals/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { add } from 'date-fns';
import { recalculateDateIfNotBusinessDay, setTimeInTimeZone } from '#utils/business-days.js';
import { DEADLINE_HOUR } from '@pins/appeals/constants/dates.js';
import { DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';

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

			const householdAppealReponseBody = {
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
					data: householdAppealReponseBody,
					where: {
						id: appealTimetable.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: 'Timetable updated\nLPA questionnaire due date changed to 10 June 2024',
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual(householdAppealRequestBody);
			});

			test('updates a full planning appeal timetable', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(fullPlanningAppealRequestBody)
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appealTimetable.update).toHaveBeenCalledWith({
					data: fullPlanningAppealResponseBody,
					where: {
						id: appealTimetable.id
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(fullPlanningAppealRequestBody);
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
					data: householdAppealReponseBody,
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

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				// eslint-disable-next-line no-undef
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
						procedure_type: 'a written procedure',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.appellant.email,
					templateName: 'appeal-start-date-change-appellant'
				});
				// eslint-disable-next-line no-undef
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
						procedure_type: 'a written procedure',
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

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				// eslint-disable-next-line no-undef
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
						procedure_type: 'a written procedure',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.appellant.email,
					templateName: 'appeal-valid-start-case-appellant'
				});
				// eslint-disable-next-line no-undef
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
						procedure_type: 'a written procedure',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.lpa.email,
					templateName: 'appeal-valid-start-case-lpa'
				});
			});

			test('start an s78 appeal timetable with a hearing procedure type', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const { id } = fullPlanningAppeal;
				const response = await request
					.post(`/appeals/${id}/appeal-timetables/`)
					.send({ procedureType: 'hearing' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(201);
				expect(response.body).toEqual({
					appellantStatementDueDate: '2024-07-10T22:59:00.000Z',
					finalCommentsDueDate: '2024-07-24T22:59:00.000Z',
					ipCommentsDueDate: '2024-07-10T22:59:00.000Z',
					lpaQuestionnaireDueDate: '2024-06-12T22:59:00.000Z',
					lpaStatementDueDate: '2024-07-10T22:59:00.000Z',
					s106ObligationDueDate: '2024-07-24T22:59:00.000Z',
					statementOfCommonGroundDueDate: '2024-07-10T22:59:00.000Z'
				});

				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Full Planning',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '24 July 2024',
						ip_comments_deadline: '10 July 2024',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '10 July 2024',
						procedure_type: 'a hearing',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.appellant.email,
					templateName: 'appeal-valid-start-case-s78-appellant'
				});
				// eslint-disable-next-line no-undef
				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					notifyClient: expect.anything(),
					personalisation: {
						appeal_reference_number: '1345264',
						appeal_type: 'Full Planning',
						appellant_email_address: householdAppeal.appellant.email,
						comment_deadline: '',
						due_date: '12 June 2024',
						final_comments_deadline: '24 July 2024',
						ip_comments_deadline: '10 July 2024',
						local_planning_authority: 'Maidstone Borough Council',
						lpa_reference: '48269/APP/2021/1482',
						lpa_statement_deadline: '10 July 2024',
						procedure_type: 'a hearing',
						questionnaire_due_date: '12 June 2024',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_date: '5 June 2024'
					},
					recipientEmail: householdAppeal.lpa.email,
					templateName: 'appeal-valid-start-case-s78-lpa'
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
});
