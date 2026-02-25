// @ts-nocheck
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_APPEAL_LINK_UNLINKED,
	AUDIT_TRAIL_APPEAL_LINK_UPDATED_AS_LEAD,
	LINK_APPEALS_CHANGE_LEAD_OPERATION,
	LINK_APPEALS_UNLINK_OPERATION
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STAGE } from '@planning-inspectorate/data-model';

jest.resetModules();

const mockCreateAuditTrail = jest.fn().mockResolvedValue(undefined);
const mockNotifySend = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule('#endpoints/audit-trails/audit-trails.service.js', () => ({
	createAuditTrail: mockCreateAuditTrail
}));

jest.unstable_mockModule('#notify/notify-send.js', () => ({
	notifySend: mockNotifySend,
	renderTemplate: jest.fn()
}));

const { request } = await import('#server/app-test.js');
const { eventClient } = await import('#infrastructure/event-client.js');
const { householdAppeal, linkedAppeals } = await import('#tests/appeals/mocks.js');
const { documentCreated, documentVersionCreated, savedFolder } =
	await import('#tests/documents/mocks.js');
const { horizonGetCaseSuccessResponse } = await import('#tests/horizon/mocks.js');
const { linkedAppealLegacyRequest, linkedAppealRequest } =
	await import('#tests/linked-appeals/mocks.js');
const { azureAdUserId } = await import('#tests/shared/mocks.js');
const { parseHorizonGetCaseResponse } = await import('#utils/mapping/map-horizon.js');
const { CASE_RELATIONSHIP_LINKED, CASE_RELATIONSHIP_RELATED } =
	await import('@pins/appeals/constants/support.js');
const { EventType } = await import('@pins/event-client');

const { databaseConnector } = await import('#utils/database-connector.js');
const { default: got } = await import('got');

const mockAppealA = {
	id: 456,
	reference: '456123'
};

const mockAppealB = {
	id: 789,
	reference: '789456'
};

const mockAppealC = {
	id: 123,
	reference: '123456'
};

const mockSavedFolderWithValidDates = {
	...savedFolder,
	documents: [
		{
			...savedFolder.documents[0],
			latestDocumentVersion: {
				...savedFolder.documents[0].latestDocumentVersion,
				dateReceived: new Date(),
				fileName: 'mydoc.pdf'
			}
		}
	]
};

describe('appeal linked appeals routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		describe('Linked appeals', () => {
			describe('/:appealId/link-appeal', () => {
				test('returns 400 when the ID in the request is null', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-appeal`)
						.send({
							...linkedAppealRequest,
							linkedAppealId: null
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
				});

				test('returns 400 when the ID in the request is not a number', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-appeal`)
						.send({
							...linkedAppealRequest,
							linkedAppealId: 'a string'
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
				});

				test('returns 404 when an internal appeal to link is not found', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValueOnce(null);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-appeal`)
						.send({
							...linkedAppealRequest,
							linkedAppealId: 100
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(404);
				});

				test('returns 409 when an internal appeal is already a parent', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValueOnce({
						...householdAppeal,
						childAppeals: linkedAppeals
					});

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-appeal`)
						.send({
							...linkedAppealRequest,
							isCurrentAppealParent: false
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(409);
				});

				test('returns 201 when an internal appeal is linked', async () => {
					const childAppeal = structuredClone({ ...householdAppeal, id: 2, reference: '4567654' });
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValueOnce(householdAppeal);
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValueOnce(childAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
					// @ts-ignore
					databaseConnector.folder.findMany.mockResolvedValue([mockSavedFolderWithValidDates]);
					databaseConnector.document.create.mockReturnValue(documentCreated);
					databaseConnector.documentVersion.create.mockResolvedValue(documentVersionCreated);

					got.post.mockReturnValueOnce({
						json: jest
							.fn()
							.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
					});

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-appeal`)
						.send({
							...linkedAppealRequest,
							linkedAppealReference: mockAppealC.reference
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(201);
					expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(1);
					expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
						data: {
							parentId: householdAppeal.id,
							parentRef: householdAppeal.reference,
							childRef: childAppeal.reference,
							childId: childAppeal.id,
							type: CASE_RELATIONSHIP_LINKED,
							externalSource: false
						}
					});

					expect(eventClient.sendEvents).toHaveBeenCalledWith(
						'appeal-document-to-move',
						[
							{
								importedURI: `https://127.0.0.1:10000/document-service-uploads/appeal/1345264/mock-uuid/v1/mydoc-4567654.pdf`,
								originalURI: `https://127.0.0.1:10000/document-service-uploads/appeal/6000001/27d0fda4-8a9a-4f5a-a158-68eaea676158/v1/mydoc.pdf`
							}
						],
						EventType.Create
					);

					expect(databaseConnector.document.create).toHaveBeenCalledWith({
						data: {
							caseId: 1,
							folderId: 23,
							guid: 'mock-uuid',
							name: 'mydoc-4567654.pdf'
						}
					});

					expect(databaseConnector.documentVersion.create).toHaveBeenCalledWith({
						data: {
							blobStorageContainer: 'document-service-uploads',
							blobStoragePath: 'appeal/1345264/mock-uuid/v1/mydoc-4567654.pdf',
							dateReceived: expect.any(Date),
							documentGuid: 'mock-uuid',
							documentType: 'appellantCostApplication',
							documentURI:
								'https://127.0.0.1:10000/document-service-uploads/appeal/1345264/mock-uuid/v1/mydoc-4567654.pdf',
							draft: false,
							fileName: 'mydoc.pdf',
							isLateEntry: false,
							lastModified: expect.any(Date),
							mime: 'application/pdf',
							originalFilename: 'mydoc-4567654.pdf',
							published: false,
							redactionStatusId: 1,
							size: 14699,
							stage: 'costs',
							version: 1,
							virusCheckStatus: 'affected'
						}
					});

					expect(mockNotifySend).toHaveBeenCalledTimes(2);

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: householdAppeal.reference,
							lead_appeal_reference_number: householdAppeal.reference,
							child_appeal_reference_number: childAppeal.reference,
							event_type: 'site visit',
							lpa_reference: householdAppeal.applicationReference,
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							linked_before_lpa_questionnaire: true,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: householdAppeal.agent.email,
						templateName: 'link-appeal'
					});

					expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
						notifyClient: expect.anything(),
						personalisation: {
							appeal_reference_number: householdAppeal.reference,
							lead_appeal_reference_number: householdAppeal.reference,
							child_appeal_reference_number: childAppeal.reference,
							event_type: 'site visit',
							lpa_reference: householdAppeal.applicationReference,
							site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
							linked_before_lpa_questionnaire: true,
							team_email_address: 'caseofficers@planninginspectorate.gov.uk'
						},
						recipientEmail: householdAppeal.agent.email,
						templateName: 'link-appeal'
					});
				});
			});
			describe('/:appealId/link-legacy-appeal', () => {
				test('returns 400 when an external appeal reference is empty', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-legacy-appeal`)
						.send({
							...linkedAppealLegacyRequest,
							linkedAppealReference: ''
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
				});

				test('returns 400 when an external appeal reference is null', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-legacy-appeal`)
						.send({
							...linkedAppealLegacyRequest,
							linkedAppealReference: null
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
				});

				test('returns 200 when an external appeal reference is received', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
					// @ts-ignore
					databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
					got.post.mockReturnValueOnce({
						json: jest
							.fn()
							.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
					});

					const response = await request
						.post(`/appeals/${householdAppeal.id}/link-legacy-appeal`)
						.send({
							...linkedAppealLegacyRequest,
							linkedAppealReference: mockAppealC.reference
						})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(200);
					expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(1);
					expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
						data: {
							parentId: null,
							parentRef: '1000000',
							childRef: householdAppeal.reference,
							childId: householdAppeal.id,
							type: CASE_RELATIONSHIP_LINKED,
							externalSource: true,
							externalAppealType: 'Planning Appeal (W)',
							externalId: '20486402'
						}
					});
				});
			});
			describe('/:appealId/update-linked-appeals', () => {
				test('returns 400 when the operation is missing', async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

					const response = await request
						.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
						.send({})
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.text).toEqual('Missing operation field');
				});

				test(`returns 400 when the operation is not "${LINK_APPEALS_CHANGE_LEAD_OPERATION}" or "${LINK_APPEALS_UNLINK_OPERATION}"`, async () => {
					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						...householdAppeal,
						childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, childRef: mockAppealC.reference }]
					});

					const response = await request
						.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
						.send({ operation: 'invalid' })
						.set('azureAdUserId', azureAdUserId);

					expect(response.status).toEqual(400);
					expect(response.text).toEqual('Invalid operation');
				});

				describe(`operation is "${LINK_APPEALS_CHANGE_LEAD_OPERATION}"`, () => {
					test('returns 400 when the appeal is not linked', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({ operation: LINK_APPEALS_CHANGE_LEAD_OPERATION })
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual('Operation is only valid for linked appeals');
					});

					test('returns 400 when the appeal is linked and appealRefToReplaceLead has not been set', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, childRef: mockAppealC.reference }]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({ operation: LINK_APPEALS_CHANGE_LEAD_OPERATION })
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual(
							`Appeal to replace lead is required for "${LINK_APPEALS_CHANGE_LEAD_OPERATION}" operation`
						);
					});

					test('returns 400 when the appeal is not a parent and appealRefToReplaceLead is set', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							parentAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({
								operation: LINK_APPEALS_CHANGE_LEAD_OPERATION,
								appealRefToReplaceLead: mockAppealA.reference
							})
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual('Switching the lead is only valid for parent appeals');
					});

					test('returns 400 when the appeal is a parent and appealRefToReplaceLead is not a child of this parent', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							childAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED,
									child: { ...mockAppealC, appellantCase: {} }
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({
								operation: LINK_APPEALS_CHANGE_LEAD_OPERATION,
								appealRefToReplaceLead: mockAppealA.reference
							})
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual('Appeal to replace lead is not a child of the lead');
					});

					test('returns 200 when the appeal is a parent and appealRefToReplaceLead is a child of this parent', async () => {
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appealRelationship.deleteMany.mockResolvedValue({});
						databaseConnector.appealRelationship.create.mockResolvedValue({});
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							childAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED,
									childId: mockAppealA.id,
									childRef: mockAppealA.reference,
									child: { ...mockAppealA, appellantCase: {} }
								},
								{
									type: CASE_RELATIONSHIP_LINKED,
									childId: mockAppealB.id,
									childRef: mockAppealB.reference,
									child: { ...mockAppealB, appellantCase: {} }
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({
								operation: LINK_APPEALS_CHANGE_LEAD_OPERATION,
								appealRefToReplaceLead: mockAppealA.reference
							})
							.set('azureAdUserId', azureAdUserId);

						expect(databaseConnector.folder.findMany).toHaveBeenCalledTimes(
							Object.values(APPEAL_CASE_STAGE).length * 2
						);

						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledTimes(1);
						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledWith({
							where: {
								parentId: householdAppeal.id
							}
						});

						expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(2);
						expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
							data: {
								childId: householdAppeal.id,
								childRef: householdAppeal.reference,
								parentId: mockAppealA.id,
								parentRef: mockAppealA.reference,
								type: CASE_RELATIONSHIP_LINKED
							}
						});
						expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
							data: {
								childId: mockAppealB.id,
								childRef: mockAppealB.reference,
								parentId: mockAppealA.id,
								parentRef: mockAppealA.reference,
								type: CASE_RELATIONSHIP_LINKED
							}
						});

						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledTimes(3);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(householdAppeal.id);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(mockAppealA.id);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(mockAppealB.id);

						expect(mockCreateAuditTrail).toHaveBeenCalledWith(
							expect.objectContaining({
								appealId: householdAppeal.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UPDATED_AS_LEAD, [
									mockAppealA.reference
								])
							})
						);

						expect(response.status).toEqual(200);
						expect(response.text).toEqual('true');
					});
				});

				describe(`operation is "${LINK_APPEALS_UNLINK_OPERATION}"`, () => {
					test('returns 400 when the appeal is not linked', async () => {
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({ operation: LINK_APPEALS_UNLINK_OPERATION })
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual('Operation is only valid for linked appeals');
					});

					test('returns 400 when the appeal is a child and appealRefToReplaceLead is set', async () => {
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appealRelationship.deleteMany.mockResolvedValue({});
						databaseConnector.appealRelationship.create.mockResolvedValue({});
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							parentAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED,
									parent: { ...mockAppealA, appellantCase: {} }
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({
								operation: LINK_APPEALS_UNLINK_OPERATION,
								appealRefToReplaceLead: mockAppealA.reference
							})
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual(
							'Unlinking a child appeal does not require replacing the lead'
						);
					});

					test('returns 400 when the appeal is a parent and appealRefToReplaceLead is not set', async () => {
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appealRelationship.deleteMany.mockResolvedValue({});
						databaseConnector.appealRelationship.create.mockResolvedValue({});
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							childAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({ operation: LINK_APPEALS_UNLINK_OPERATION })
							.set('azureAdUserId', azureAdUserId);

						expect(response.status).toEqual(400);
						expect(response.text).toEqual(
							'Appeal to replace lead is required for unlinking a parent appeal'
						);
					});

					test('returns 200 and creates audit trails when the appeal is a child and appealRefToReplaceLead is not set', async () => {
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appealRelationship.deleteMany.mockResolvedValue({});
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							parentAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED,
									parentId: mockAppealA.id,
									parentRef: mockAppealA.reference,
									parent: { ...mockAppealA, appellantCase: {} }
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({ operation: LINK_APPEALS_UNLINK_OPERATION })
							.set('azureAdUserId', azureAdUserId);

						expect(databaseConnector.folder.findMany).toHaveBeenCalledTimes(
							Object.values(APPEAL_CASE_STAGE).length * 2
						);

						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledTimes(1);
						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledWith({
							where: {
								childId: householdAppeal.id
							}
						});

						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledTimes(2);

						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(householdAppeal.id);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(mockAppealA.id);

						expect(mockCreateAuditTrail).toHaveBeenCalledTimes(2);
						expect(mockCreateAuditTrail).toHaveBeenNthCalledWith(
							1,
							expect.objectContaining({
								appealId: householdAppeal.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [
									mockAppealA.reference
								])
							})
						);
						expect(mockCreateAuditTrail).toHaveBeenNthCalledWith(
							2,
							expect.objectContaining({
								appealId: mockAppealA.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [
									householdAppeal.reference
								])
							})
						);

						expect(response.status).toEqual(200);
						expect(response.text).toEqual('true');
					});

					test('returns 200 when the appeal is a parent and appealRefToReplaceLead is a child of this parent', async () => {
						databaseConnector.folder.findMany.mockResolvedValue([]);
						databaseConnector.appealRelationship.deleteMany.mockResolvedValue({});
						databaseConnector.appealRelationship.create.mockResolvedValue({});
						// @ts-ignore
						databaseConnector.appeal.findUnique.mockResolvedValue({
							...householdAppeal,
							childAppeals: [
								{
									type: CASE_RELATIONSHIP_LINKED,
									childId: mockAppealA.id,
									childRef: mockAppealA.reference,
									child: { ...mockAppealA, appellantCase: {} }
								},
								{
									type: CASE_RELATIONSHIP_LINKED,
									childId: mockAppealB.id,
									childRef: mockAppealB.reference,
									child: { ...mockAppealB, appellantCase: {} }
								}
							]
						});

						const response = await request
							.post(`/appeals/${householdAppeal.id}/update-linked-appeals`)
							.send({
								operation: LINK_APPEALS_UNLINK_OPERATION,
								appealRefToReplaceLead: mockAppealA.reference
							})
							.set('azureAdUserId', azureAdUserId);

						expect(databaseConnector.folder.findMany).toHaveBeenCalledTimes(
							Object.values(APPEAL_CASE_STAGE).length * 2
						);

						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledTimes(2);
						expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledWith({
							where: {
								childId: householdAppeal.id
							}
						});

						expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(2);
						expect(databaseConnector.appealRelationship.create).toHaveBeenNthCalledWith(1, {
							data: {
								childId: householdAppeal.id,
								childRef: householdAppeal.reference,
								parentId: mockAppealA.id,
								parentRef: mockAppealA.reference,
								type: CASE_RELATIONSHIP_LINKED
							}
						});
						expect(databaseConnector.appealRelationship.create).toHaveBeenNthCalledWith(2, {
							data: {
								childId: mockAppealB.id,
								childRef: mockAppealB.reference,
								parentId: mockAppealA.id,
								parentRef: mockAppealA.reference,
								type: CASE_RELATIONSHIP_LINKED
							}
						});

						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledTimes(3);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(householdAppeal.id);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(mockAppealA.id);
						expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(mockAppealB.id);

						expect(mockCreateAuditTrail).toHaveBeenCalledTimes(3);
						expect(mockCreateAuditTrail).toHaveBeenNthCalledWith(
							1,
							expect.objectContaining({
								appealId: householdAppeal.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [
									householdAppeal.reference
								])
							})
						);
						expect(mockCreateAuditTrail).toHaveBeenNthCalledWith(
							2,
							expect.objectContaining({
								appealId: householdAppeal.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [
									householdAppeal.reference
								])
							})
						);
						expect(mockCreateAuditTrail).toHaveBeenNthCalledWith(
							3,
							expect.objectContaining({
								appealId: householdAppeal.id,
								details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UPDATED_AS_LEAD, [
									mockAppealA.reference
								])
							})
						);

						expect(response.status).toEqual(200);
						expect(response.text).toEqual('true');
					});
				});
			});
		});

		describe('Related appeals', () => {
			test('returns 400 when the ID in the request is null', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-appeal`)
					.send({
						...linkedAppealRequest,
						linkedAppealId: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when the ID in the request is not a number', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-appeal`)
					.send({
						...linkedAppealRequest,
						linkedAppealId: 'a string'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 404 when an internal appeal to link is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValueOnce(null);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-appeal`)
					.send({
						...linkedAppealRequest,
						linkedAppealId: 100
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
			});

			test('returns 400 when an external appeal reference is empty', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-legacy-appeal`)
					.send({
						...linkedAppealLegacyRequest,
						linkedAppealReference: ''
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when an external appeal reference is null', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-legacy-appeal`)
					.send({
						...linkedAppealLegacyRequest,
						linkedAppealReference: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 200 and creates audit trails when an external appeal reference is received', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				got.post.mockReturnValueOnce({
					json: jest
						.fn()
						.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-legacy-appeal`)
					.send({
						...linkedAppealLegacyRequest,
						linkedAppealReference: mockAppealC.reference
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
					data: {
						parentId: householdAppeal.id,
						parentRef: householdAppeal.reference,
						childRef: mockAppealC.reference,
						childId: null,
						type: CASE_RELATIONSHIP_RELATED,
						externalSource: true,
						externalAppealType: 'Planning Appeal (W)',
						externalId: '20486402'
					}
				});
			});

			test('returns 200 and creates audit trails with references when an internal appeal is related', async () => {
				const appealToRelate = structuredClone({ ...householdAppeal, id: 3, reference: 'REL-777' });

				databaseConnector.appeal.findUnique.mockResolvedValueOnce(householdAppeal);
				databaseConnector.appeal.findUnique.mockResolvedValueOnce(appealToRelate);
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				databaseConnector.appealRelationship.create.mockResolvedValue({});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-appeal`)
					.send({
						linkedAppealId: appealToRelate.id
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);

				expect(mockCreateAuditTrail).toHaveBeenCalledWith(
					expect.objectContaining({
						appealId: householdAppeal.id,
						details: expect.stringContaining('REL-777')
					})
				);
			});

			test('returns 200 and creates audit trail with reference when an external appeal is related', async () => {
				const externalRef = 'HORIZON-999';
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				got.post.mockReturnValueOnce({
					json: jest
						.fn()
						.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/associate-legacy-appeal`)
					.send({
						linkedAppealReference: externalRef
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);

				expect(mockCreateAuditTrail).toHaveBeenCalledWith(
					expect.objectContaining({
						appealId: householdAppeal.id,
						details: expect.stringContaining(externalRef)
					})
				);
			});
		});
	});
});
