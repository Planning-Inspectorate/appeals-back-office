// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	ERROR_INVALID_SITE_VISIT_TYPE,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED,
	ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME,
	SITE_VISIT_TYPE_UNACCOMPANIED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_ACCESS_REQUIRED
} from '@pins/appeals/constants/support.js';

import { householdAppeal as householdAppealData } from '#tests/appeals/mocks.js';
import { fullPlanningAppeal as fullPlanningAppealData } from '#tests/appeals/mocks.js';
import { listedBuildingAppeal as listedBuildingAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { format, parseISO } from 'date-fns';
import { formatTime, dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
import {
	fetchRescheduleTemplateIds,
	fetchSiteVisitScheduleTemplateIds
} from '../site-visits.service.js';

describe('site visit routes', () => {
	/** @type {typeof householdAppealData} */
	let householdAppeal;
	let inspectorName;

	beforeEach(() => {
		householdAppeal = JSON.parse(JSON.stringify(householdAppealData));

		inspectorName = 'Jane Smith';

		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		// @ts-ignore
		databaseConnector.siteVisit.findUnique.mockResolvedValue({
			...householdAppeal.siteVisit,
			appeal: householdAppeal
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe('/:appealId/site-visits', () => {
		describe('POST', () => {
			test('creates a site visit without updating the status', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(response.status).toEqual(201);
				expect(response.body).toEqual({
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('creates a site visit with updating the status and time fields with leading zeros', async () => {
				householdAppeal.appealStatus[0].status = 'issue_determination';

				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
							format(parseISO(siteVisit.visitDate.split('T')[0]), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(201);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('creates a site visit with updating the status and time fields without leading zeros', async () => {
				householdAppeal.appealStatus[0].status = 'issue_determination';

				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),

						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
							format(parseISO(siteVisit.visitDate.split('T')[0]), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(201);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('creates a site visit with time fields in 24h format', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
							format(parseISO(siteVisit.visitDate), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(201);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('creates an Unaccompanied site visit without time fields', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate,
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: new Date(siteVisit.visitDate),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
							format(parseISO(siteVisit.visitDate), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitType: siteVisit.siteVisitType.name
				});
				expect(response.status).toEqual(201);
			});

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'creates an Unaccompanied site visit and sends notify email to appellant/agent, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));

					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore`
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

					// Send request using siteVisitData fields
					const response = await request
						.post(`/appeals/${appeal.id}/site-visits`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-schedule-unaccompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							lpa_reference: appeal.applicationReference,
							inspector_name: '',
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(response.status).toEqual(201);
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'creates an Accompanied site visit and sends GMT date and time notify email to appellant/agent and lpa, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));

					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

					const response = await request
						.post(`/appeals/${appeal.id}/site-visits`)
						.send({
							visitDate: '2022-03-01T00:00:00.000Z',
							visitEndTime: '2022-03-01T12:00:00.000Z',
							visitStartTime: '2022-01-31T11:00:00.000Z',
							visitType: siteVisit.siteVisitType.name
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.body).toEqual({
						visitDate: '2022-03-01T00:00:00.000Z',
						visitEndTime: '2022-03-01T12:00:00.000Z',
						visitStartTime: '2022-01-31T11:00:00.000Z',
						visitType: siteVisit.siteVisitType.name
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-schedule-accompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							end_time: '12:00',
							lpa_reference: appeal.applicationReference,
							inspector_name: '',
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: '11:00',
							visit_date: '1 March 2022'
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-schedule-accompanied-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							end_time: '12:00',
							lpa_reference: appeal.applicationReference,
							inspector_name: '',
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: '11:00',
							visit_date: '1 March 2022'
						},
						recipientEmail: appeal.lpa.email
					});

					expect(response.status).toEqual(201);
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'creates an Access Required site visit and sends notify email to appellant/agent, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));

					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

					const visitData = {
						visitEndTime: '2022-03-31T12:00:00.000Z',
						visitStartTime: '2022-03-31T11:00:00.000Z',
						visitType: siteVisit.siteVisitType.name
					};

					const response = await request
						.post(`/appeals/${appeal.id}/site-visits`)
						.send({
							visitDate: siteVisit.visitDate,
							inspectorName,
							...visitData
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						...visitData
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-schedule-access-required-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							end_time: '13:00',
							lpa_reference: appeal.applicationReference,
							inspector_name: inspectorName,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: '12:00',
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(response.status).toEqual(201);
				}
			);

			test('returns an error if appealId is not numeric', async () => {
				const response = await request
					.post('/appeals/one/site-visits')
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
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

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if visitType is not a string value', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitType: 123
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitType: ERROR_INVALID_SITE_VISIT_TYPE
					}
				});
			});

			test('returns an error if visitType is an incorrect value', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(null);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitType: 'access not required'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitType: ERROR_INVALID_SITE_VISIT_TYPE
					}
				});
			});

			test('returns an error if visitType is not Unaccompanied and visitDate is not given when visitEndTime and visitStartTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitEndTime: '2022-03-31T18:00:00.000Z',
						visitStartTime: '2022-03-31T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});
			});

			test('returns an error if visitType is Access required and visitEndTime is not given when visitDate and visitStartTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-07T00:00:00.000Z',
						visitStartTime: '2023-12-07T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});
			});

			test('returns an error if visitType is Access required and visitStartTime is not given when visitDate and visitEndTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-07T00:00:00.000Z',
						visitEndTime: '2023-12-07T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});
			});

			test('returns an error if visitType is Accompanied and visitStartTime is not given when visitDate is given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-07T00:00:00.000Z',
						visitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED
					}
				});
			});

			test('returns an error if visitDate is in an invalid format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '07/12/2023',
						visitEndTime: '2023-12-07T18:00:00.000Z',
						visitStartTime: '2023-12-07T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitStartTime is in an invalid format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-07T00:00:00.000Z',
						visitEndTime: '18:00',
						visitStartTime: '2023-12-07T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitEndTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitEndTime is in an invalid format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-07T00:00:00.000Z',
						visitEndTime: '2023-12-07T18:00:00.000Z',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-12-56T16:00:00.000Z',
						visitEndTime: '2023-12-07T18:00:00.000Z',
						visitStartTime: '2023-12-07T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitEndTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T56:00:00.000Z',
						visitStartTime: '2023-07-12T16:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitEndTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitStartTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T56:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitStartTime is not before visitEndTime', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitStartTime,
						visitStartTime: siteVisit.visitEndTime,
						visitType: 'accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME
					}
				});
			});
		});
	});

	describe('/:appealId/site-visits/:siteVisitId', () => {
		describe('GET', () => {
			test('gets a single site visit', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const { siteVisit } = householdAppeal;
				const response = await request
					.get(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					appealId: siteVisit.appealId,
					visitDate: siteVisit.visitDate,
					siteVisitId: siteVisit.id,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('returns an error if appealId is not numeric', async () => {
				const response = await request.get('/appeals/one').set('azureAdUserId', azureAdUserId);

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

				const response = await request.get('/appeals/3').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('returns an error if siteVisitId is not numeric', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/site-visits/one`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						siteVisitId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if siteVistId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${householdAppeal.id}/site-visits/2`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						siteVisitId: ERROR_NOT_FOUND
					}
				});
			});
		});

		describe('PATCH', () => {
			test('updates a site visit without updating the status', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						siteVisitTypeId: siteVisit.siteVisitType.id,
						visitEndTime: null,
						visitStartTime: null
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalledWith();
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitType: siteVisit.siteVisitType.name
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('updates a site visit with updating the status and time fields with leading zeros', async () => {
				householdAppeal.appealStatus[0].status = 'issue_determination';

				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				});
			});

			test('updates a site visit with updating the status and time fields without leading zeros', async () => {
				householdAppeal.appealStatus[0].status = 'issue_determination';

				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				// expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
				// 	data: {
				// 		appealId: householdAppeal.id,
				// 		createdAt: expect.any(Date),
				// 		status:  expect.any(String),
				// 		valid: true
				// 	}
				// });
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				// expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				// 	data: {
				// 		appealId: householdAppeal.id,
				// 		details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [
				// 			STATE_TARGET_ISSUE_DETERMINATION
				// 		]),
				// 		loggedAt: expect.any(Date),
				// 		userId: householdAppeal.caseOfficer.id
				// 	}
				// });
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: '2022-03-31T03:00:00.000Z',
					visitStartTime: '2022-03-31T01:00:00.000Z',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				});
			});

			test('updates a site visit with time fields in 24h format', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				});
			});

			test('updates an Unaccompanied site visit without time fields', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						siteVisitTypeId: siteVisit.siteVisitType.id,
						visitEndTime: null,
						visitStartTime: null
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(0);
				expect(response.status).toEqual(200);
			});

			test('updates an Unaccompanied site visit with blank time fields', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: '',
						visitStartTime: '',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: null,
						visitStartTime: null,
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: '',
					visitStartTime: '',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('updates a site visit from Unaccompanied to Access Required with visit-type change', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
					siteVisitChangeType: 'visit-type'
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'site-visit-change-unaccompanied-to-access-required-appellant',
					personalisation: {
						appeal_reference_number: '1345264',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						start_time: '02:00',
						end_time: '04:00',
						inspector_name: '',
						lpa_reference: '48269/APP/2021/1482',
						visit_date: '31 March 2022'
					},
					recipientEmail: householdAppeal.agent.email
				});
			});

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Accompanied site visit to Unaccompanied and changing time and date, sends notify emails, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
							siteVisitChangeType: 'all'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied',
						siteVisitChangeType: 'all'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-unaccompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-unaccompanied-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Access required site visit to changing time and date, sends notify emails to Appellant, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: 'Access required',
							inspectorName,
							siteVisitChangeType: 'date-time'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Access required',
						siteVisitChangeType: 'date-time'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-access-required-date-change-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: inspectorName,
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Accompanied site visit to changing time and date, sends notify emails to Appellant & LPA, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
							siteVisitChangeType: 'date-time'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
						siteVisitChangeType: 'date-time'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-date-change-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-date-change-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Accompanied site visit to Unaccompanied, sends notify emails to Appellant & LPA, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: 'Accompanied',
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied',
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-unaccompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-unaccompanied-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Unaccompanied site visit to Accompanied, sends notify emails to Appellant & LPA, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-unaccompanied-to-accompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-unaccompanied-to-accompanied-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Access required site visit to Accompanied, sends notify emails to Appellant & LPA, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
							inspectorName,
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-access-required-to-accompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: inspectorName,
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-access-required-to-accompanied-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: inspectorName,
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Accompanied site visit to Access Required, sends notify emails to Appellant & LPA, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-access-required-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-accompanied-to-access-required-lpa',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.lpa.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Access Required site visit to Unaccompanied, sends notify emails to Appellant, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-access-required-to-unaccompanied-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});
				}
			);

			test.each([
				['householdAppeal', householdAppealData],
				['fullPlanningAppeal', fullPlanningAppealData],
				['listedBuildingAppeal', listedBuildingAppealData]
			])(
				'updates an Unaccompanied site visit to Access Required, sends notify emails to Appellant, appeal type: %s',
				async (_, appeal) => {
					const { siteVisit } = JSON.parse(JSON.stringify(appeal));
					siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
					// @ts-ignore
					databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
					// @ts-ignore
					databaseConnector.user.upsert.mockResolvedValue({
						id: 1,
						azureAdUserId
					});

					const response = await request
						.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
						.send({
							visitDate: siteVisit.visitDate,
							visitEndTime: siteVisit.visitEndTime,
							visitStartTime: siteVisit.visitStartTime,
							visitType: siteVisit.siteVisitType.name,
							previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
							siteVisitChangeType: 'visit-type'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(databaseConnector.siteVisit.update).toHaveBeenCalledTimes(1);
					expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
						where: { id: siteVisit.id },
						data: {
							visitDate: new Date(siteVisit.visitDate),
							visitEndTime: new Date(siteVisit.visitEndTime),
							visitStartTime: new Date(siteVisit.visitStartTime),
							siteVisitTypeId: siteVisit.siteVisitType.id
						}
					});
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: appeal.id,
							details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
							loggedAt: expect.any(Date),
							userId: appeal.caseOfficer.id
						}
					});
					expect(response.status).toEqual(200);
					expect(response.body).toEqual({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(1);

					expect(mockNotifySend).toHaveBeenCalledWith({
						azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
						notifyClient: expect.any(Object),
						templateName: 'site-visit-change-unaccompanied-to-access-required-appellant',
						personalisation: {
							appeal_reference_number: appeal.reference,
							site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
							start_time: formatTime(siteVisit.visitStartTime),
							end_time: formatTime(siteVisit.visitEndTime),
							inspector_name: '',
							lpa_reference: appeal.applicationReference,
							visit_date: dateISOStringToDisplayDate(siteVisit.visitDate)
						},
						recipientEmail: appeal.agent.email
					});
				}
			);

			test('returns an error if appealId is not numeric', async () => {
				const response = await request
					.patch(`/appeals/one/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
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

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if siteVisitId is not numeric', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/one`)
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						siteVisitId: ERROR_MUST_BE_NUMBER
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if siteVisitId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/2`)
					.send({
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						siteVisitId: ERROR_NOT_FOUND
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not a string value', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitType: 123
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitType: ERROR_INVALID_SITE_VISIT_TYPE
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is an incorrect value', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(null);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitType: 'access not required'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitType: ERROR_INVALID_SITE_VISIT_TYPE
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitDate is not given when visitEndTime and visitStartTime are given', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitStartTime: siteVisit.visitStartTime,
						visitEndTime: siteVisit.visitEndTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitEndTime is not given when visitDate and visitStartTime are given', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitStartTime: siteVisit.visitStartTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitStartTime is not given when visitDate and visitEndTime are given', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('updates a site visit with unchanged type and times, does not send notify emails', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						siteVisitChangeType: 'unchanged'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: new Date(siteVisit.visitDate),
						visitEndTime: new Date(siteVisit.visitEndTime),
						visitStartTime: new Date(siteVisit.visitStartTime),
						siteVisitTypeId: siteVisit.siteVisitType.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name,
					siteVisitChangeType: 'unchanged'
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitDate is in an invalid format', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '07/12/2023',
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitDate is not a valid date', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '56/12/2023',
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitEndTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitStartTime: '2023-07-12T18:00:00.000Z',
						visitEndTime: '2023-07-12T56:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitEndTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitStartTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T56:00:00.000Z',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});

			test('returns an error if visitStartTime is not before visitEndTime', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitStartTime,
						visitStartTime: siteVisit.visitEndTime,
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME
					}
				});

				expect(mockNotifySend).not.toHaveBeenCalled();
			});
		});
	});

	describe('fetchRescheduleTemplateIds', () => {
		test('returns an ID for unaccompanied To Access required with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Access required', 'Unaccompanied', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-unaccompanied-to-access-required-appellant'
			});
		});

		test('returns an ID for Access required To Unaccompanied with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Unaccompanied', 'Access required', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-access-required-to-unaccompanied-appellant'
			});
		});

		test('returns appellant and lpa IDs for Unaccompanied To Accompanied with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Accompanied', 'Unaccompanied', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-unaccompanied-to-accompanied-appellant',
				lpa: 'site-visit-change-unaccompanied-to-accompanied-lpa'
			});
		});

		test('returns appellant and lpa IDs for Access required To Accompanied with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Accompanied', 'Access required', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-access-required-to-accompanied-appellant',
				lpa: 'site-visit-change-access-required-to-accompanied-lpa'
			});
		});

		test('returns appellant and lpa IDs for Accompanied To Access required with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Access required', 'Accompanied', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-accompanied-to-access-required-appellant',
				lpa: 'site-visit-change-accompanied-to-access-required-lpa'
			});
		});

		test('returns appellant and lpa IDs for Accompanied To Unaccompanied with visit-type', () => {
			const result = fetchRescheduleTemplateIds('Unaccompanied', 'Accompanied', 'visit-type');
			expect(result).toEqual({
				appellant: 'site-visit-change-accompanied-to-unaccompanied-appellant',
				lpa: 'site-visit-change-accompanied-to-unaccompanied-lpa'
			});
		});

		test('returns an empty object for an unknown transition with visit-type', () => {
			const result = fetchRescheduleTemplateIds('UnknownType', 'AnotherUnknownType', 'visit-type');
			expect(result).toEqual({});
		});

		test('returns an empty object for unchanged transition type', () => {
			const result = fetchRescheduleTemplateIds('Accompanied', 'Accompanied', 'unchanged');
			expect(result).toEqual({});
		});

		test('returns templates for all transition types with all', () => {
			const result = fetchRescheduleTemplateIds('Accompanied', 'Unaccompanied', 'all');
			expect(result).toEqual({
				appellant: 'site-visit-change-unaccompanied-to-accompanied-appellant',
				lpa: 'site-visit-change-unaccompanied-to-accompanied-lpa'
			});
		});

		test('returns appellant ID for Access required date-time change', () => {
			const result = fetchRescheduleTemplateIds('Access required', 'AnyType', 'date-time');
			expect(result).toEqual({
				appellant: 'site-visit-change-access-required-date-change-appellant'
			});
		});

		test('returns appellant and lpa IDs for Accompanied date-time change', () => {
			const result = fetchRescheduleTemplateIds('Accompanied', 'AnyType', 'date-time');
			expect(result).toEqual({
				appellant: 'site-visit-change-accompanied-date-change-appellant',
				lpa: 'site-visit-change-accompanied-date-change-lpa'
			});
		});
	});

	describe('fetchSiteVisitScheduleTemplateIds', () => {
		test('returns appellant ID for Access required', () => {
			const result = fetchSiteVisitScheduleTemplateIds('Access required');
			expect(result).toEqual({
				appellant: 'site-visit-schedule-access-required-appellant'
			});
		});

		test('returns appellant and lpa IDs for Accompanied', () => {
			const result = fetchSiteVisitScheduleTemplateIds('Accompanied');
			expect(result).toEqual({
				appellant: 'site-visit-schedule-accompanied-appellant',
				lpa: 'site-visit-schedule-accompanied-lpa'
			});
		});

		test('returns appellant ID for Unaccompanied', () => {
			const result = fetchSiteVisitScheduleTemplateIds('Unaccompanied');
			expect(result).toEqual({
				appellant: 'site-visit-schedule-unaccompanied-appellant'
			});
		});

		test('handles extra whitespace and case insensitivity for Accompanied', () => {
			const result = fetchSiteVisitScheduleTemplateIds('  aCComPAnied  ');
			expect(result).toEqual({
				appellant: 'site-visit-schedule-accompanied-appellant',
				lpa: 'site-visit-schedule-accompanied-lpa'
			});
		});

		test('returns empty object for unknown visit type', () => {
			const result = fetchSiteVisitScheduleTemplateIds('Virtual');
			expect(result).toEqual({});
		});
	});
});
