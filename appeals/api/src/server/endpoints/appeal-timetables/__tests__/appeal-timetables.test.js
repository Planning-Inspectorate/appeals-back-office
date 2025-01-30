// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_HAVE_TIMETABLE_DATE,
	ERROR_NOT_FOUND
} from '../../constants.js';
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
						details: AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
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

			test('returns an error if issueDeterminationDate is not in the correct format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						issueDeterminationDate: '05/05/2023'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if issueDeterminationDate does not contain leading zeros', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						issueDeterminationDate: '2023-5-5'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if issueDeterminationDate is not in the future', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					issueDeterminationDate: '2023-06-04T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_IN_FUTURE
					}
				});
			});

			test('returns an error if issueDeterminationDate is a weekend day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					issueDeterminationDate: '2099-09-19T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if issueDeterminationDate is a bank holiday day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					issueDeterminationDate: '2025-12-25T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if issueDeterminationDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						issueDeterminationDate: '2099-02-30'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						issueDeterminationDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is not in the correct format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaQuestionnaireDueDate: '05/05/2023'
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
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaQuestionnaireDueDate: '2023-5-5'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is not in the future', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					lpaQuestionnaireDueDate: '2023-06-04T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_IN_FUTURE
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is a weekend day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					lpaQuestionnaireDueDate: '2099-09-19T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is a bank holiday day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const body = {
					lpaQuestionnaireDueDate: '2025-12-25T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if lpaQuestionnaireDueDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(houseAppealWithTimetable);

				const { appealTimetable, id } = houseAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaQuestionnaireDueDate: '2023-02-30'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaQuestionnaireDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaStatementDueDate is not in the correct format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaStatementDueDate: '05/05/2023'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaStatementDueDate does not contain leading zeros', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaStatementDueDate: '2023-5-5'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if lpaStatementDueDate is not in the future', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const body = {
					lpaStatementDueDate: '2023-06-04T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_IN_FUTURE
					}
				});
			});

			test('returns an error if lpaStatementDueDate is a weekend day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const body = {
					lpaStatementDueDate: '2099-09-19T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if lpaStatementDueDate is a bank holiday day', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const body = {
					lpaStatementDueDate: '2025-12-25T23:59:00.000Z'
				};
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send(body)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_BUSINESS_DAY
					}
				});
			});

			test('returns an error if lpaStatementDueDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppealWithTimetable);

				const { appealTimetable, id } = fullPlanningAppealWithTimetable;
				const response = await request
					.patch(`/appeals/${id}/appeal-timetables/${appealTimetable.id}`)
					.send({
						lpaStatementDueDate: '2023-02-30'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						lpaStatementDueDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
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
});
