// @ts-nocheck
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	ERROR_INVALID_SITE_VISIT_TYPE,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED,
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
import { dateISOStringToDisplayDate, formatTime } from '@pins/appeals/utils/date-formatter.js';

import {
	addStatusesToLinkedAppeals,
	getIdsOfLinkedGroup,
	mockAppealFindUnique
} from '#tests/shared/site-visits-test-helpers.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

const inspectorName = 'Jane Smith';

describe('PATCH /:appealId/site-visits/:siteVisitId', () => {
	const getHouseholdAppeal = () => JSON.parse(JSON.stringify(householdAppealData));
	const getEnforcementLeadAppeal = () =>
		JSON.parse(
			JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
		);

	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
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
	])('site visit updates for appeal type: %s', (_, appeal) => {
		test('updates a site visit from Unaccompanied to Access Required with visit-type change, sends notify emails', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));

			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});
		});

		test('updates an Accompanied site visit to Unaccompanied and changing time and date, sends notify emails', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Access required site visit to changing time and date, sends notify emails to Appellant', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});
		});

		test('updates an Accompanied site visit to changing time and date, sends notify emails to Appellant & LPA', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Accompanied site visit to Unaccompanied, sends notify emails to Appellant & LPA', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Unaccompanied site visit to Accompanied, sends notify emails to Appellant & LPA', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Access required site visit to Accompanied, sends notify emails to Appellant & LPA', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Accompanied site visit to Access Required, sends notify emails to Appellant & LPA', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.lpa.email
			});
		});

		test('updates an Access Required site visit to Unaccompanied, sends notify emails to Appellant', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});
		});

		test('updates an Unaccompanied site visit to Access Required, sends notify emails to Appellant', async () => {
			const { siteVisit } = JSON.parse(JSON.stringify(appeal));
			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [appeal.id] } },
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
					...(appeal.appellantCase?.enforcementReference && {
						enforcement_reference: appeal.appellantCase.enforcementReference
					}),
					visit_date: dateISOStringToDisplayDate(siteVisit.visitDate),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: appeal.agent.email
			});
		});
	});

	describe.each([
		['single appeal', getHouseholdAppeal],
		['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
	])('%s', (_, getAppeal) => {
		test('updates a site visit without updating the status', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

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
				.patch(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
				.send({
					visitType: siteVisit.siteVisitType.name
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } },
				data: {
					siteVisitTypeId: siteVisit.siteVisitType.id,
					visitEndTime: null,
					visitStartTime: null
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
			expect(databaseConnector.appealStatus.create).not.toHaveBeenCalledWith();
			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				visitType: siteVisit.siteVisitType.name
			});

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('updates a site visit with updating the status and time fields', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			appeal.appealStatus[0].status = 'issue_determination';
			addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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
					previousVisitType: 'Accompanied'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } },
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
				previousVisitType: 'Accompanied'
			});
		});

		test('updates an Unaccompanied site visit without time fields', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } },
				data: {
					visitDate: new Date(siteVisit.visitDate),
					siteVisitTypeId: siteVisit.siteVisitType.id,
					visitEndTime: null,
					visitStartTime: null
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
			expect(response.body).toEqual({
				visitDate: siteVisit.visitDate,
				visitType: siteVisit.siteVisitType.name,
				previousVisitType: 'Accompanied'
			});

			expect(mockNotifySend).toHaveBeenCalledTimes(0);
			expect(response.status).toEqual(200);
		});

		test('updates an Unaccompanied site visit with blank time fields', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
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
					visitEndTime: '',
					visitStartTime: '',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } },
				data: {
					visitDate: new Date(siteVisit.visitDate),
					visitEndTime: null,
					visitStartTime: null,
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
				visitEndTime: '',
				visitStartTime: '',
				visitType: siteVisit.siteVisitType.name,
				previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED
			});

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('returns an error if appealId is not numeric', async () => {
			const appeal = getAppeal();
			const response = await request
				.patch(`/appeals/one/site-visits/${appeal.siteVisit.id}`)
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
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
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

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('returns an error if siteVisitId is not numeric', async () => {
			const appeal = getAppeal();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/one`)
				.send({
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/2`)
				.send({
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
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
			const appeal = getAppeal();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisitType.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitStartTime: siteVisit.visitStartTime,
					visitEndTime: siteVisit.visitEndTime,
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

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('returns an error if visitType is not Unaccompanied and visitEndTime is not given when visitDate and visitStartTime are given', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: siteVisit.visitDate,
					visitStartTime: siteVisit.visitStartTime,
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

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('returns an error if visitType is not Unaccompanied and visitStartTime is not given when visitDate and visitEndTime are given', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitEndTime,
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

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('updates a site visit with unchanged type and times, does not send notify emails', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

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
					siteVisitChangeType: 'unchanged',
					knowDateTime: true
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } },
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
				siteVisitChangeType: 'unchanged'
			});

			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('returns an error if visitDate is in an invalid format', async () => {
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: '07/12/2023',
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: '56/12/2023',
					visitEndTime: siteVisit.visitEndTime,
					visitStartTime: siteVisit.visitStartTime,
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitStartTime: '2023-07-12T18:00:00.000Z',
					visitEndTime: '2023-07-12T56:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T56:00:00.000Z',
					visitType: appeal.siteVisit.siteVisitType.name
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
			const appeal = getAppeal();
			const { siteVisit } = appeal;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.patch(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send({
					visitDate: siteVisit.visitDate,
					visitEndTime: siteVisit.visitStartTime,
					visitStartTime: siteVisit.visitEndTime,
					visitType: appeal.siteVisit.siteVisitType.name
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
