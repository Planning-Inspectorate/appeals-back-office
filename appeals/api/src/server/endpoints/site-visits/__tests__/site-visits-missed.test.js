// @ts-nocheck
import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal as householdAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { dateISOStringToDisplayDate, formatTime } from '@pins/appeals/utils/date-formatter.js';
import { request } from '../../../app-test.js';
import { formatAddressSingleLine } from '../../addresses/addresses.formatter.js';

import {
	addStatusesToLinkedAppeals,
	getIdsOfLinkedGroup,
	mockAppealFindUnique
} from '#tests/shared/site-visits-test-helpers.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('POST /:appealId/site-visits/:siteVisitId/missed', () => {
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
		describe('current status is awaiting_event', () => {
			let appeal;
			let idsOfLinkedGroup;
			let sizeOfLinkedGroup;
			let eventStatusIdsOfLinkedGroup;

			beforeEach(() => {
				appeal = getAppeal();
				idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
				sizeOfLinkedGroup = idsOfLinkedGroup.length;
				eventStatusIdsOfLinkedGroup = [1, ...idsOfLinkedGroup.slice(1).map((id) => id * 10 + 1)];

				appeal.appealStatus = [
					{
						id: 1,
						status: 'event',
						createdAt: '2025-09-18T10:07:15.406Z',
						valid: false,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					},
					{
						id: 2,
						status: 'awaiting_event',
						createdAt: '2025-09-18T10:07:22.069Z',
						valid: true,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					}
				];
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				// We only check for the siteVisit once before it is deleted
				// @ts-ignore
				databaseConnector.appeal.findUnique
					.mockImplementationOnce(mockAppealFindUnique(appeal))
					.mockImplementation(mockAppealFindUnique({ ...appeal, siteVisit: null }));

				// @ts-ignore
				databaseConnector.siteVisit.findUnique.mockResolvedValue({
					...appeal.siteVisit,
					appeal: appeal
				});

				// mock appealStatus.findFirst to give the correct statuses in the right order (each linked child then the lead)
				for (const childAppeal of appeal.childAppeals) {
					if (childAppeal.type == CASE_RELATIONSHIP_LINKED) {
						databaseConnector.appealStatus.findFirst.mockImplementationOnce(
							({ where: { status } }) => {
								switch (status) {
									case 'event':
										return childAppeal.child.appealStatus[0];
									case 'awaiting_event':
										return childAppeal.child.appealStatus[1];
									default:
										return null;
								}
							}
						);
					}
				}
				databaseConnector.appealStatus.findFirst.mockImplementationOnce(({ where: { status } }) => {
					switch (status) {
						case 'event':
							return appeal.appealStatus[0];
						case 'awaiting_event':
							return appeal.appealStatus[1];
						default:
							return null;
					}
				});

				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.appealStatus.deleteMany.mockResolvedValue();
				// @ts-ignore
				databaseConnector.appealStatus.update.mockResolvedValue();
				jest.useFakeTimers().setSystemTime(new Date('2025-10-01T10:00:00.000Z'));
			});
			afterEach(() => {
				// reset the mocks
				databaseConnector.appeal.findUnique.mockReset();
				databaseConnector.appealStatus.findFirst.mockReset();
				databaseConnector.user.upsert.mockReset();
				databaseConnector.appealStatus.deleteMany.mockReset();
				databaseConnector.appealStatus.update.mockReset();
				jest.useRealTimers();
			});
			test('record a missed site visit for an appellant and moves the status back from awaiting_event to event', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'appellant' })
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'appellant' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(sizeOfLinkedGroup + 1);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: appeal.id,
						details: 'Appellant missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: id,
							details: 'Case progressed to event',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
				}

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(sizeOfLinkedGroup);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(sizeOfLinkedGroup);

				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
						where: {
							appealId: id,
							createdAt: {
								gt: '2025-09-18T10:07:15.406Z' //createdAt for the 'event' status
							}
						}
					});
				}

				for (const id of eventStatusIdsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.update).toHaveBeenCalledWith({
						where: { id: id },
						data: { valid: true }
					});
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.appellant.email,
					templateName: 'record-missed-site-visit-appellant'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});

			test('record a missed site visit for an LPA and moves the status back from awaiting_event to event', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'lpa' })
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'lpa' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(sizeOfLinkedGroup + 1);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: appeal.id,
						details: 'LPA missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: id,
							details: 'Case progressed to event',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
				}

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')), // 5 business days later
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(sizeOfLinkedGroup);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(sizeOfLinkedGroup);

				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
						where: {
							appealId: id,
							createdAt: {
								gt: '2025-09-18T10:07:15.406Z' //createdAt for the 'event' status
							}
						}
					});
				}

				for (const id of eventStatusIdsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.update).toHaveBeenCalledWith({
						where: { id: id },
						data: { valid: true }
					});
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.lpa.email,
					templateName: 'record-missed-site-visit-lpa'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});

			test('record missed site visit for LPA sends LPA email even when appellant has no email', async () => {
				appeal.appellant.email = null;
				appeal.agent = null;

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'lpa' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'lpa' }
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					notifyClient: expect.anything(),
					templateName: 'record-missed-site-visit-lpa',
					recipientEmail: appeal.lpa.email,
					personalisation: expect.objectContaining({
						appeal_reference_number: appeal.reference
					})
				});

				expect(response.status).toEqual(200);
			});

			test('record missed site visit for LPA sends LPA email even when agent has no email', async () => {
				appeal.agent.email = null;
				appeal.appellant = null;

				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'lpa' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'lpa' }
				});

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId,
					notifyClient: expect.anything(),
					templateName: 'record-missed-site-visit-lpa',
					recipientEmail: appeal.lpa.email,
					personalisation: expect.objectContaining({
						appeal_reference_number: appeal.reference
					})
				});

				expect(response.status).toEqual(200);
			});

			test('record missed site visit for inspector sends no notification emails', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'inspector' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'inspector' }
				});

				expect(mockNotifySend).not.toHaveBeenCalled();

				expect(response.status).toBe(200);
			});
		});

		describe('current status is before the event set up', () => {
			let appeal;
			let idsOfLinkedGroup;

			beforeEach(() => {
				appeal = getAppeal();
				idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

				appeal.appealStatus = [
					{
						id: 1,
						status: 'lpa_questionnaire',
						createdAt: '2025-09-18T10:07:15.406Z',
						valid: true,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					}
				];
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				// We only check for the siteVisit once before it is deleted
				// @ts-ignore
				databaseConnector.appeal.findUnique
					.mockImplementationOnce(mockAppealFindUnique(appeal))
					.mockImplementation(mockAppealFindUnique({ ...appeal, siteVisit: null }));

				// mock appealStatus.findFirst to give the correct statuses in the right order (each linked child then the lead)
				for (const childAppeal of appeal.childAppeals) {
					if (childAppeal.type == CASE_RELATIONSHIP_LINKED) {
						databaseConnector.appealStatus.findFirst.mockImplementationOnce(
							({ where: { status } }) => {
								switch (status) {
									case 'lpa_questionnaire':
										return childAppeal.child.appealStatus[0];
									default:
										return null;
								}
							}
						);
					}
				}
				databaseConnector.appealStatus.findFirst.mockImplementationOnce(({ where: { status } }) => {
					switch (status) {
						case 'lpa_questionnaire':
							return appeal.appealStatus[0];
						default:
							return null;
					}
				});

				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.appealStatus.deleteMany.mockResolvedValue();
				// @ts-ignore
				databaseConnector.appealStatus.update.mockResolvedValue();
				jest.useFakeTimers().setSystemTime(new Date('2025-10-01T10:00:00.000Z'));
			});
			afterEach(() => {
				// reset the mocks
				databaseConnector.appeal.findUnique.mockReset();
				databaseConnector.appealStatus.findFirst.mockReset();
				databaseConnector.user.upsert.mockReset();
				databaseConnector.appealStatus.deleteMany.mockReset();
				databaseConnector.appealStatus.update.mockReset();
				jest.useRealTimers();
			});

			test('record a missed site visit for an appellant and the status remains the same', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'appellant' })
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'appellant' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appeal.id,
						details: 'Appellant missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(0);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(0);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.appellant.email,
					templateName: 'record-missed-site-visit-appellant'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});

			test('record a missed site visit for an LPA and the status remains the same', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'lpa' })
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'lpa' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: appeal.id,
						details: 'LPA missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')), // 5 business days later
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(0);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(0);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.lpa.email,
					templateName: 'record-missed-site-visit-lpa'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});
		});

		describe('current status is after the event', () => {
			let appeal;
			let idsOfLinkedGroup;
			let sizeOfLinkedGroup;
			let eventStatusIdsOfLinkedGroup;

			beforeEach(() => {
				appeal = getAppeal();
				idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
				sizeOfLinkedGroup = idsOfLinkedGroup.length;
				eventStatusIdsOfLinkedGroup = [1, ...idsOfLinkedGroup.slice(1).map((id) => id * 10 + 1)];

				appeal.appealStatus = [
					{
						id: 1,
						status: 'event',
						createdAt: '2025-09-18T10:07:15.406Z',
						valid: false,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					},
					{
						id: 2,
						status: 'awaiting_event',
						createdAt: '2025-09-18T10:07:22.069Z',
						valid: false,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					},
					{
						id: 3,
						status: 'issue_determination',
						createdAt: '2025-09-20T10:07:22.069Z',
						valid: true,
						appealId: appeal.id,
						subStateMachineName: null,
						compoundStateName: null
					}
				];
				addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

				// We only check for the siteVisit once before it is deleted
				// @ts-ignore
				databaseConnector.appeal.findUnique
					.mockImplementationOnce(mockAppealFindUnique(appeal))
					.mockImplementation(mockAppealFindUnique({ ...appeal, siteVisit: null }));

				// mock appealStatus.findFirst to give the correct statuses in the right order (each linked child then the lead)
				for (const childAppeal of appeal.childAppeals) {
					if (childAppeal.type == CASE_RELATIONSHIP_LINKED) {
						databaseConnector.appealStatus.findFirst.mockImplementationOnce(
							({ where: { status } }) => {
								switch (status) {
									case 'event':
										return childAppeal.child.appealStatus[0];
									case 'awaiting_event':
										return childAppeal.child.appealStatus[1];
									case 'issue_determination':
										return childAppeal.child.appealStatus[2];
									default:
										return null;
								}
							}
						);
					}
				}
				databaseConnector.appealStatus.findFirst.mockImplementationOnce(({ where: { status } }) => {
					switch (status) {
						case 'event':
							return appeal.appealStatus[0];
						case 'awaiting_event':
							return appeal.appealStatus[1];
						case 'issue_determination':
							return appeal.appealStatus[2];
						default:
							return null;
					}
				});

				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({
					id: 1,
					azureAdUserId
				});
				// @ts-ignore
				databaseConnector.appealStatus.deleteMany.mockResolvedValue();
				// @ts-ignore
				databaseConnector.appealStatus.update.mockResolvedValue();

				jest.useFakeTimers().setSystemTime(new Date('2025-10-01T10:00:00.000Z'));
			});
			afterEach(() => {
				// reset the mocks
				databaseConnector.appeal.findUnique.mockReset();
				databaseConnector.appealStatus.findFirst.mockReset();
				databaseConnector.user.upsert.mockReset();
				databaseConnector.appealStatus.deleteMany.mockReset();
				databaseConnector.appealStatus.update.mockReset();
				jest.useRealTimers();
			});

			test('record a missed site visit for an appellant and moves the status back from issue_determination to event', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'appellant' })
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'appellant' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(sizeOfLinkedGroup + 1);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: appeal.id,
						details: 'Appellant missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: id,
							details: 'Case progressed to event',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
				}

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(sizeOfLinkedGroup);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(sizeOfLinkedGroup);

				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
						where: {
							appealId: id,
							createdAt: {
								gt: '2025-09-18T10:07:15.406Z' //createdAt for the 'event' status
							}
						}
					});
				}

				for (const id of eventStatusIdsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.update).toHaveBeenCalledWith({
						where: { id: id },
						data: { valid: true }
					});
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.appellant.email,
					templateName: 'record-missed-site-visit-appellant'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});

			test('record a missed site visit for an LPA and moves the status back from issue_determination to event', async () => {
				const response = await request
					.post(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}/missed`)
					.send({ whoMissedSiteVisit: 'lpa' })
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.siteVisit.updateMany).toHaveBeenCalledWith({
					where: { appealId: { in: idsOfLinkedGroup } },
					data: { whoMissedSiteVisit: 'lpa' }
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(sizeOfLinkedGroup + 1);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: appeal.id,
						details: 'LPA missed the site visit',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
						data: {
							appealId: id,
							details: 'Case progressed to event',
							loggedAt: expect.any(Date),
							userId: 1
						}
					});
				}

				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
					start_time: formatTime(appeal.siteVisit.visitStartTime),
					'5_day_deadline': dateISOStringToDisplayDate(new Date('2025-10-08T10:00:00.000Z')),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
				}

				expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(sizeOfLinkedGroup);
				expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(sizeOfLinkedGroup);

				for (const id of idsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
						where: {
							appealId: id,
							createdAt: {
								gt: '2025-09-18T10:07:15.406Z' //createdAt for the 'event' status
							}
						}
					});
				}

				for (const id of eventStatusIdsOfLinkedGroup) {
					expect(databaseConnector.appealStatus.update).toHaveBeenCalledWith({
						where: { id: id },
						data: { valid: true }
					});
				}

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.anything(),
					personalisation: personalisation,
					recipientEmail: appeal.lpa.email,
					templateName: 'record-missed-site-visit-lpa'
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({ siteVisitId: 1 });
			});
		});
	});
});
