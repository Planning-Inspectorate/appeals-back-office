// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	ERROR_INVALID_SITE_VISIT_TYPE,
	ERROR_MUST_BE_CORRECT_DATE_FORMAT,
	ERROR_MUST_BE_CORRECT_TIME_FORMAT,
	ERROR_MUST_BE_NUMBER,
	ERROR_NOT_FOUND,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED,
	ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME,
	SITE_VISIT_TYPE_UNACCOMPANIED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_ACCESS_REQUIRED
} from '../../constants.js';

import { householdAppeal as householdAppealData } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { format, parseISO } from 'date-fns';

const { databaseConnector } = await import('../../../utils/database-connector.js');
import { fetchVisitNotificationTemplateIds } from '../site-visits.service.js';
import config from '#config/config.js';

describe('site visit routes', () => {
	/** @type {typeof householdAppealData} */
	let householdAppeal;

	beforeEach(() => {
		householdAppeal = JSON.parse(JSON.stringify(householdAppealData));
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
				expect(response.status).toEqual(200);
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
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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
				expect(response.status).toEqual(200);
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

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '9:00',
						visitStartTime: '7:00',
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: siteVisit.visitDate,
						visitEndTime: '9:00',
						visitStartTime: '7:00',
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
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: '9:00',
					visitStartTime: '7:00',
					visitType: siteVisit.siteVisitType.name
				});
			});

			test('creates a site visit with time fields in 24h format', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitEndTime: '18:00',
					visitStartTime: '16:00',
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

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						visitDate: siteVisit.visitDate,
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
				expect(response.status).toEqual(200);
			});

			test('creates an Unaccompanied site visit and sends notify email to appellant/agent', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const visitData = {
					visitEndTime: '12:00',
					visitStartTime: '11:00',
					visitType: siteVisit.siteVisitType.name
				};

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						...visitData
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					...visitData
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitSchedule.unaccompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							end_time: '12:00',
							lpa_reference: '48269/APP/2021/1482',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '11:00',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});

			test('creates an Accompanied site visit and sends notify email to appellant/agent and lpa', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const visitData = {
					visitEndTime: '12:00',
					visitStartTime: '11:00',
					visitType: siteVisit.siteVisitType.name
				};

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						...visitData
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					...visitData
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitSchedule.accompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							end_time: '12:00',
							lpa_reference: '48269/APP/2021/1482',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '11:00',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitSchedule.accompanied.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							end_time: '12:00',
							lpa_reference: '48269/APP/2021/1482',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '11:00',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});

			test('creates an Access Required site visit and sends notify email to appellant/agent', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const visitData = {
					visitEndTime: '12:00',
					visitStartTime: '11:00',
					visitType: siteVisit.siteVisitType.name
				};

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						...visitData
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					...visitData
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);
				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitSchedule.accessRequired.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							end_time: '12:00',
							lpa_reference: '48269/APP/2021/1482',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '11:00',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				expect(response.status).toEqual(200);
			});

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
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
						visitDate: '2023-12-07',
						visitStartTime: '16:00',
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
						visitDate: '2023-12-07',
						visitEndTime: '16:00',
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
						visitDate: '2023-12-07',
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
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '56/12/2023',
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_DATE_FORMAT
					}
				});
			});

			test('returns an error if visitEndTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '56:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitEndTime: ERROR_MUST_BE_CORRECT_TIME_FORMAT
					}
				});
			});

			test('returns an error if visitStartTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '18:00',
						visitStartTime: '56:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_MUST_BE_CORRECT_TIME_FORMAT
					}
				});
			});

			test('returns an error if visitStartTime is not before visitEndTime', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '16:00',
						visitStartTime: '18:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
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

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitType: siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
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
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalledWith();
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitType: siteVisit.siteVisitType.name
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('updates a site visit with updating the status and time fields with leading zeros', async () => {
				householdAppeal.appealStatus[0].status = 'issue_determination';

				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
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
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '3:00',
						visitStartTime: '1:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '3:00',
						visitStartTime: '1:00',
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
					visitEndTime: '3:00',
					visitStartTime: '1:00',
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

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
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

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
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
				expect(response.body).toEqual({
					visitDate: siteVisit.visitDate,
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(0);
				expect(response.status).toEqual(200);
			});

			test('updates an Unaccompanied site visit with blank time fields', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '',
						visitStartTime: '',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '',
						visitStartTime: '',
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('updates a site visit from Unaccompanied to Access Required with visit-type change', async () => {
				const { siteVisit } = householdAppeal;

				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
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
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedToAccessRequired.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '01:00',
							end_time: '03:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Accompanied site visit to Unaccompanied and changing time and date, does not send notify emails', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
						siteVisitChangeType: 'all'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied',
					siteVisitChangeType: 'all'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('updates an Access required site visit to changing time and date, sends notify emails to Appellant', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Access required',
						siteVisitChangeType: 'date-time'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Access required',
					siteVisitChangeType: 'date-time'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accessRequiredDateChange.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Accompanied site visit to changing time and date, sends notify emails to Appellant & LPA', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
						siteVisitChangeType: 'date-time'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
					siteVisitChangeType: 'date-time'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedDateChange.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedDateChange.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Accompanied site visit to Unaccompanied, sends notify emails to Appellant & LPA', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: 'Accompanied',
						siteVisitChangeType: 'visit-type'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: 'Accompanied',
					siteVisitChangeType: 'visit-type'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedToUnaccompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedToUnaccompanied.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Unaccompanied site visit to Accompanied, sends notify emails to Appellant & LPA', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_UNACCOMPANIED,
					siteVisitChangeType: 'visit-type'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.unaccompaniedToAccompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.unaccompaniedToAccompanied.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Access required site visit to Accompanied, sends notify emails to Appellant & LPA', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
						siteVisitChangeType: 'visit-type'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
					siteVisitChangeType: 'visit-type'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accessRequiredToAccompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accessRequiredToAccompanied.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Accompanied site visit to Access Required, sends notify emails to Appellant & LPA', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: siteVisit.siteVisitType.name,
						previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
						siteVisitChangeType: 'visit-type'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: '18:00',
						visitStartTime: '16:00',
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
					visitEndTime: '18:00',
					visitStartTime: '16:00',
					visitType: siteVisit.siteVisitType.name,
					previousVisitType: SITE_VISIT_TYPE_ACCOMPANIED,
					siteVisitChangeType: 'visit-type'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(2);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedToAccessRequired.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accompaniedToAccessRequired.lpa.id,
					'maid@lpa-email.gov.uk',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: '16:00',
							end_time: '18:00',
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Access Required site visit to Unaccompanied, sends notify emails to Appellant', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_UNACCOMPANIED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
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
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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
					previousVisitType: SITE_VISIT_TYPE_ACCESS_REQUIRED,
					siteVisitChangeType: 'visit-type'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.accessRequiredToUnaccompanied.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: siteVisit.visitStartTime,
							end_time: siteVisit.visitEndTime,
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

			test('updates an Unaccompanied site visit to Access Required, sends notify emails to Appellant', async () => {
				const { siteVisit } = householdAppeal;
				siteVisit.siteVisitType.name = SITE_VISIT_TYPE_ACCESS_REQUIRED;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
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
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledTimes(1);

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).toHaveBeenCalledWith(
					config.govNotify.template.siteVisitChange.unaccompaniedToAccessRequired.appellant.id,
					'test@136s7.com',
					{
						emailReplyToId: null,
						personalisation: {
							appeal_reference_number: '1345264',
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							start_time: siteVisit.visitStartTime,
							end_time: siteVisit.visitEndTime,
							lpa_reference: '48269/APP/2021/1482',
							visit_date: '31 March 2022'
						},
						reference: null
					}
				);
			});

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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
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

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitDate is not given when visitEndTime and visitStartTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitEndTime is not given when visitDate and visitStartTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-12-07',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitType is not Unaccompanied and visitStartTime is not given when visitDate and visitEndTime are given', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-12-07',
						visitEndTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('updates a site visit with unchanged type and times, does not send notify emails', async () => {
				const { siteVisit } = householdAppeal;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisit.siteVisitType);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${siteVisit.id}`)
					.send({
						visitDate: siteVisit.visitDate.split('T')[0],
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
						visitType: siteVisit.siteVisitType.name,
						siteVisitChangeType: 'unchanged'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.update).toHaveBeenCalledWith({
					where: { id: siteVisit.id },
					data: {
						visitDate: siteVisit.visitDate,
						visitEndTime: siteVisit.visitEndTime,
						visitStartTime: siteVisit.visitStartTime,
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
					siteVisitChangeType: 'unchanged'
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitDate is in an invalid format', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '07/12/2023',
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_DATE_FORMAT
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitDate is not a valid date', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '56/12/2023',
						visitEndTime: '18:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitDate: ERROR_MUST_BE_CORRECT_DATE_FORMAT
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitEndTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '56:00',
						visitStartTime: '16:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitEndTime: ERROR_MUST_BE_CORRECT_TIME_FORMAT
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitStartTime is not a valid time', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '18:00',
						visitStartTime: '56:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_MUST_BE_CORRECT_TIME_FORMAT
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});

			test('returns an error if visitStartTime is not before visitEndTime', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/site-visits/${householdAppeal.siteVisit.id}`)
					.send({
						visitDate: '2023-07-12',
						visitEndTime: '16:00',
						visitStartTime: '18:00',
						visitType: householdAppeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						visitStartTime: ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME
					}
				});

				// eslint-disable-next-line no-undef
				expect(mockSendEmail).not.toHaveBeenCalled();
			});
		});
	});

	describe('fetchVisitNotificationTemplateIds', () => {
		test('returns an empty object for unaccompaniedToAccessRequired with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Access Required',
				'Unaccompanied',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: 'f9bd99e7-f3f1-4836-a2dc-018dfdece854' }
			});
		});

		test('returns an empty object for accessRequiredToUnaccompanied with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Unaccompanied',
				'Access Required',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: 'a4964a74-af84-45c2-a61b-162a92f94087' }
			});
		});

		test('returns appellant and lpa template IDs for unaccompaniedToAccompanied with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Accompanied',
				'Unaccompanied',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: '771691cb-81cc-444a-8db0-dbbd4f66b61f' },
				lpa: { id: '03a6616e-3e0c-4f28-acd5-f4e873847457' }
			});
		});

		test('returns appellant and lpa template IDs for accessRequiredToAccompanied with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Accompanied',
				'Access Required',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: '0b7d9246-99b8-43d7-8205-02a3c9762691' },
				lpa: { id: '03a6616e-3e0c-4f28-acd5-f4e873847457' }
			});
		});

		test('returns appellant and lpa template IDs for accompaniedToAccessRequired with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Access Required',
				'Accompanied',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: 'f9bd99e7-f3f1-4836-a2dc-018dfdece854' },
				lpa: { id: '15acdaee-ca9d-4001-bb93-9f50ab29226d' }
			});
		});

		test('returns appellant and lpa template IDs for accompaniedToUnaccompanied with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'Unaccompanied',
				'Accompanied',
				'visit-type'
			);
			expect(result).toEqual({
				appellant: { id: '5056b6fe-095f-45ad-abb5-0a582ef274c3' },
				lpa: { id: '15acdaee-ca9d-4001-bb93-9f50ab29226d' }
			});
		});

		test('returns an empty object for an unknown transition with visit-type', () => {
			const result = fetchVisitNotificationTemplateIds(
				'UnknownType',
				'AnotherUnknownType',
				'visit-type'
			);
			expect(result).toEqual({});
		});

		test('returns an empty object for unchanged transition type', () => {
			const result = fetchVisitNotificationTemplateIds('Accompanied', 'Accompanied', 'unchanged');
			expect(result).toEqual({});
		});

		test('returns templates for all transition types with all', () => {
			const result = fetchVisitNotificationTemplateIds('Accompanied', 'Unaccompanied', 'all');
			expect(result).toEqual({});
		});

		test('returns appellant template ID for Access Required visit date/time change', () => {
			const result = fetchVisitNotificationTemplateIds('Access required', 'AnyType', 'date-time');
			expect(result).toEqual({
				appellant: { id: '1b963d2c-ae50-45c4-abbb-149481c69074' }
			});
		});

		test('returns appellant and lpa template IDs for Accompanied visit date/time change', () => {
			const result = fetchVisitNotificationTemplateIds('Accompanied', 'AnyType', 'date-time');
			expect(result).toEqual({
				appellant: { id: '3bd2cd75-bf1e-4256-8a4c-5c5739bc0ecc' },
				lpa: { id: '5d23f669-a1d2-4232-9171-10f956dfb400' }
			});
		});
	});
});
