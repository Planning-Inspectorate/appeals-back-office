// @ts-nocheck
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	ERROR_INVALID_SITE_VISIT_TYPE,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED,
	ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME,
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_UNACCOMPANIED
} from '@pins/appeals/constants/support.js';
import { request } from '../../../app-test.js';

import {
	advertisementAppeal as advertisementAppealData,
	appealEnforcementListed,
	casAdvertAppeal as casAdvertAppealData,
	casPlanningAppeal as casPlanningAppealData,
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	fullPlanningAppeal as fullPlanningAppealData,
	householdAppeal as householdAppealData,
	ldcAppeal,
	listedBuildingAppeal as listedBuildingAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { dateISOStringToDisplayDate, formatTime } from '@pins/appeals/utils/date-formatter.js';
import { format, parseISO } from 'date-fns';

import {
	addStatusesToLinkedAppeals,
	mockAppealFindUnique
} from '#tests/shared/site-visits-test-helpers.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

const inspectorName = 'Jane Smith';

describe('POST /:appealId/site-visits', () => {
	const getHouseholdAppeal = () => JSON.parse(JSON.stringify(householdAppealData));
	const getEnforcementLeadAppeal = () =>
		JSON.parse(
			JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
		);

	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.siteVisit.findFirst.mockResolvedValue();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe.each([
		['householdAppeal', householdAppealData],
		['advertisementAppeal', advertisementAppealData],
		['casPlanningAppeal', casPlanningAppealData],
		['casAdvertAppeal', casAdvertAppealData],
		['fullPlanningAppeal', fullPlanningAppealData],
		['listedBuildingAppeal', listedBuildingAppealData],
		['ldcAppeal', ldcAppeal],
		['elbAppeal', appealEnforcementListed]
	])('create site visit for appeal type %s', (_, appeal) => {
		beforeEach(() => {
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
		});
		test('creates an Unaccompanied site visit and sends notify email to appellant/agent', async () => {
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					inspector_name: '',
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: formatTime(siteVisit.visitStartTime),
					end_time: formatTime(siteVisit.visitEndTime),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});

			expect(response.status).toEqual(201);
		});

		test('creates an Accompanied site visit and sends GMT date and time notify email to appellant/agent and lpa', async () => {
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					inspector_name: '',
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '11:00',
					visit_date: '1 March 2022',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					inspector_name: '',
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '11:00',
					visit_date: '1 March 2022',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});

			expect(response.status).toEqual(201);
		});

		test('creates an Access Required site visit and sends notify email to appellant/agent', async () => {
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					inspector_name: inspectorName,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '12:00',
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});

			expect(response.status).toEqual(201);
		});
	});

	describe.each([
		['single appeal', getHouseholdAppeal],
		['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
	])('%s', (_, getAppeal) => {
		test('creates a site visit without updating the status', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitType: siteVisit.siteVisitType.name
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
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
			const appeal = getAppeal();
			appeal.appealStatus[0].status = 'issue_determination';
			addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
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
					appealId: appeal.id,
					visitDate: new Date(siteVisit.visitDate),
					visitEndTime: new Date(siteVisit.visitEndTime),
					visitStartTime: new Date(siteVisit.visitStartTime),
					siteVisitTypeId: siteVisit.siteVisitType.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
						format(parseISO(siteVisit.visitDate.split('T')[0]), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
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
			const appeal = getAppeal();
			appeal.appealStatus[0].status = 'issue_determination';
			addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
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
					appealId: appeal.id,
					visitDate: new Date(siteVisit.visitDate),
					visitEndTime: new Date(siteVisit.visitEndTime),
					visitStartTime: new Date(siteVisit.visitStartTime),

					siteVisitTypeId: siteVisit.siteVisitType.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
						format(parseISO(siteVisit.visitDate.split('T')[0]), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: siteVisit.siteVisitType.name
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					visitDate: new Date(siteVisit.visitDate),
					visitEndTime: new Date(siteVisit.visitEndTime),
					visitStartTime: new Date(siteVisit.visitStartTime),
					siteVisitTypeId: siteVisit.siteVisitType.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
						format(parseISO(siteVisit.visitDate), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: siteVisit.visitDate,
					visitType: siteVisit.siteVisitType.name
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					visitDate: new Date(siteVisit.visitDate),
					siteVisitTypeId: siteVisit.siteVisitType.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
						format(parseISO(siteVisit.visitDate), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});
			expect(response.body).toEqual({
				visitDate: siteVisit.visitDate,
				visitType: siteVisit.siteVisitType.name
			});
			expect(response.status).toEqual(201);
		});

		test('returns an error if appealId is not numeric', async () => {
			const appeal = getAppeal();

			const response = await request
				.post('/appeals/one/site-visits')
				.send({
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(null);

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});
			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitEndTime: '2022-03-31T18:00:00.000Z',
					visitStartTime: '2022-03-31T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-07T00:00:00.000Z',
					visitStartTime: '2023-12-07T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-07T00:00:00.000Z',
					visitEndTime: '2023-12-07T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-07T00:00:00.000Z',
					visitType: 'Accompanied',
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '07/12/2023',
					visitEndTime: '2023-12-07T18:00:00.000Z',
					visitStartTime: '2023-12-07T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-07T00:00:00.000Z',
					visitEndTime: '18:00',
					visitStartTime: '2023-12-07T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-07T00:00:00.000Z',
					visitEndTime: '2023-12-07T18:00:00.000Z',
					visitStartTime: '16:00',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-12-56T16:00:00.000Z',
					visitEndTime: '2023-12-07T18:00:00.000Z',
					visitStartTime: '2023-12-07T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T56:00:00.000Z',
					visitStartTime: '2023-07-12T16:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T56:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name,
					dateTimeKnown: 'yes'
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.post(`/appeals/${appeal.id}/site-visits`)
				.send({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitStartTime,
					visitStartTime: siteVisit.visitEndTime,
					visitType: 'accompanied',
					dateTimeKnown: 'yes'
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
