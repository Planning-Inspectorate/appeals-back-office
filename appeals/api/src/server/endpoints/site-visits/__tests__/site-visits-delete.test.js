// @ts-nocheck
import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal as householdAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import {
	addStatusesToLinkedAppeals,
	getIdsOfLinkedGroup,
	mockAppealFindUnique
} from '#tests/shared/site-visits-test-helpers.js';
import { jest } from '@jest/globals';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { request } from '../../../app-test.js';
import { formatAddressSingleLine } from '../../addresses/addresses.formatter.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('DELETE /:appealId/site-visits/:siteVisitId', () => {
	const getHouseholdAppeal = () => JSON.parse(JSON.stringify(householdAppealData));
	const getEnforcementLeadAppeal = () =>
		JSON.parse(
			JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
		);

	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		// @ts-ignore
		databaseConnector.user.upsert.mockResolvedValue({
			id: 1,
			azureAdUserId
		});
		// @ts-ignore
		databaseConnector.appealStatus.deleteMany.mockResolvedValue();
		// @ts-ignore
		databaseConnector.appealStatus.update.mockResolvedValue();
	});
	afterEach(() => {
		databaseConnector.user.upsert.mockReset();
		databaseConnector.siteVisit.delete.mockReset();
		databaseConnector.appealStatus.deleteMany.mockReset();
		databaseConnector.appealStatus.update.mockReset();
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	describe.each([
		['single appeal', getHouseholdAppeal],
		['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
	])('%s', (_, getAppeal) => {
		test('deletes a site visit and moves the status back if the status is awaiting_event', async () => {
			const appeal = getAppeal();

			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);
			const sizeOfLinkedGroup = idsOfLinkedGroup.length;

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

			// get the ids of the event status for the linked group
			const eventStatusIdsOfLinkedGroup = [
				1,
				...idsOfLinkedGroup.slice(1).map((id) => id * 10 + 1)
			];

			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

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

			const response = await request
				.delete(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send()
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.deleteMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } }
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: 'Site visit cancelled',
					loggedAt: expect.any(Date),
					userId: 1
				}
			});

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

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ siteVisitId: 1 });

			databaseConnector.appeal.findUnique.mockReset();
			databaseConnector.appealStatus.findFirst.mockReset();
		});

		test('deletes a site visit and keeps the status if the status is LPAQ', async () => {
			const appeal = getAppeal();

			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			appeal.appealStatus[0] = 'lpa_questionnaire';
			addStatusesToLinkedAppeals(appeal, appeal.appealStatus);

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.delete(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send()
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.deleteMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } }
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: 'Site visit cancelled',
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
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
				personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
			}

			expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(0);
			expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(0);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: personalisation,
				recipientEmail: appeal.agent.email,
				templateName: 'site-visit-cancelled'
			});

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ siteVisitId: 1 });

			databaseConnector.appeal.findUnique.mockReset();
		});

		test('deletes a site visit and and notifies the LPA if visit type is accompanied', async () => {
			const appeal = getAppeal();
			const idsOfLinkedGroup = getIdsOfLinkedGroup(appeal);

			appeal.siteVisit.siteVisitType.name = 'Accompanied';

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));

			const response = await request
				.delete(`/appeals/${appeal.id}/site-visits/${appeal.siteVisit.id}`)
				.send()
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.siteVisit.deleteMany).toHaveBeenCalledWith({
				where: { appealId: { in: idsOfLinkedGroup } }
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: appeal.id,
					details: 'Site visit cancelled',
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
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			if (appeal.appealType.type == APPEAL_TYPE.ENFORCEMENT_NOTICE) {
				personalisation.enforcement_reference = appeal.appellantCase.enforcementReference;
			}

			expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledTimes(0);
			expect(databaseConnector.appealStatus.update).toHaveBeenCalledTimes(0);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: personalisation,
				recipientEmail: appeal.agent.email,
				templateName: 'site-visit-cancelled'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: personalisation,
				recipientEmail: appeal.lpa.email,
				templateName: 'site-visit-cancelled'
			});
			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ siteVisitId: 1 });

			databaseConnector.appeal.findUnique.mockReset();
		});
	});
});
