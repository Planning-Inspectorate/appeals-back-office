// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal as householdAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import {
	addStatusesToLinkedAppeals,
	getIdsOfLinkedGroup
} from '#tests/shared/site-visits-test-helpers.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('POST /:appealId/site-visits (rearrange site visit)', () => {
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
		['single appeal', getHouseholdAppeal],
		['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
	])('%s', (_, getAppeal) => {
		describe('status tests', () => {
			let appeal;
			let idsOfLinkedGroup;
			let sizeOfLinkedGroup;

			beforeEach(() => {
				appeal = getAppeal();
				idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
				sizeOfLinkedGroup = idsOfLinkedGroup.length;

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.siteVisit.findFirst.mockResolvedValue(appeal.siteVisit);
				databaseConnector.siteVisitType.findUnique.mockResolvedValue(
					appeal.siteVisit.siteVisitType
				);
				databaseConnector.appealStatus.updateMany.mockResolvedValue();
				databaseConnector.appealStatus.create.mockResolvedValue();
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
			});
			afterEach(() => {
				databaseConnector.appeal.findUnique.mockClear();
				databaseConnector.siteVisit.findFirst.mockClear();
				databaseConnector.siteVisitType.findUnique.mockClear();
				databaseConnector.appealStatus.updateMany.mockClear();
				databaseConnector.appealStatus.create.mockClear();
				databaseConnector.user.upsert.mockClear();
			});
			test('updates a site visit and updates the status when status is event', async () => {
				const { siteVisit } = appeal;
				appeal.appealStatus[0].status = 'event';
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T17:00:00.000Z',
						visitType: appeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalled();

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T17:00:00.000Z',
					visitType: siteVisit.siteVisitType.name
				});

				expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledTimes(sizeOfLinkedGroup);
				expect(databaseConnector.appealStatus.create).toHaveBeenCalledTimes(sizeOfLinkedGroup);

				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledWith({
						where: { appealId: id },
						data: { valid: false }
					});

					expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
						data: {
							appealId: id,
							createdAt: expect.any(Date),
							status: 'awaiting_event',
							valid: true
						}
					});
				}

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appeal.id,
						details: 'Case progressed to awaiting_event',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
			});

			test('updates a site visit and keeps the same status when status is lpa questionnaire', async () => {
				const { siteVisit } = appeal;
				appeal.appealStatus[0].status = 'lpa_questionnaire';
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T17:00:00.000Z',
						visitType: appeal.siteVisit.siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalled();

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T17:00:00.000Z',
					visitType: siteVisit.siteVisitType.name
				});

				expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledTimes(0);
				expect(databaseConnector.appealStatus.create).toHaveBeenCalledTimes(0);
			});
		});

		describe('notify tests', () => {
			let appeal;

			beforeEach(() => {
				appeal = getAppeal();

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.siteVisit.findFirst.mockResolvedValue(appeal.siteVisit);
				databaseConnector.appealStatus.updateMany.mockResolvedValue();
				databaseConnector.appealStatus.create.mockResolvedValue();
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
			});
			afterEach(() => {
				databaseConnector.appeal.findUnique.mockClear();
				databaseConnector.siteVisit.findFirst.mockClear();
				databaseConnector.siteVisitType.findUnique.mockClear();
				databaseConnector.appealStatus.updateMany.mockClear();
				databaseConnector.appealStatus.create.mockClear();
				databaseConnector.user.upsert.mockClear();
			});
			test('updates a site visit to access required and sends the correct notify', async () => {
				const siteVisitType = {
					id: 1,
					name: 'Access required',
					key: 'site_visit_access_required'
				};
				appeal.appealStatus[0].status = 'event';
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisitType);

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T17:00:00.000Z',
						visitType: siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalled();

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T17:00:00.000Z',
					visitType: siteVisitType.name
				});

				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '18:00',
					visit_date: '12 July 2023',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'missed-site-visit-rearranged-appellant',
					personalisation: personalisation,
					recipientEmail: appeal.agent.email
				});
			});

			test('updates a site visit to accompanied and sends the correct notify', async () => {
				const siteVisitType = {
					id: 2,
					name: 'Accompanied',
					key: 'site_visit_accompanied'
				};
				appeal.appealStatus[0].status = 'event';
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisitType);

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T17:00:00.000Z',
						visitType: siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalled();

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T17:00:00.000Z',
					visitType: siteVisitType.name
				});

				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '18:00',
					visit_date: '12 July 2023',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'missed-site-visit-rearranged-appellant',
					personalisation: personalisation,
					recipientEmail: appeal.agent.email
				});

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'missed-site-visit-rearranged-lpa',
					personalisation: personalisation,
					recipientEmail: appeal.lpa.email
				});
			});

			test('updates a site visit to unaccompanied and sends the correct notify', async () => {
				const siteVisitType = {
					id: 3,
					name: 'Unaccompanied',
					key: 'site_visit_unaccompanied'
				};
				appeal.appealStatus[0].status = 'event';
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				databaseConnector.siteVisitType.findUnique.mockResolvedValue(siteVisitType);

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits`)
					.send({
						visitDate: '2023-07-12T00:00:00.000Z',
						visitEndTime: '2023-07-12T18:00:00.000Z',
						visitStartTime: '2023-07-12T17:00:00.000Z',
						visitType: siteVisitType.name
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalled();

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					visitDate: '2023-07-12T00:00:00.000Z',
					visitEndTime: '2023-07-12T18:00:00.000Z',
					visitStartTime: '2023-07-12T17:00:00.000Z',
					visitType: siteVisitType.name
				});

				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					start_time: '18:00',
					visit_date: '12 July 2023',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'missed-site-visit-rearranged-unaccompanied-appellant',
					personalisation: personalisation,
					recipientEmail: appeal.agent.email
				});
			});
		});
	});
});
