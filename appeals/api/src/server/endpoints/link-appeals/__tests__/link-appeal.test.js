// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { householdAppeal, linkedAppeals } from '#tests/appeals/mocks.js';
import { documentCreated, documentVersionCreated, savedFolder } from '#tests/documents/mocks.js';
import { horizonGetCaseSuccessResponse } from '#tests/horizon/mocks.js';
import { linkedAppealLegacyRequest, linkedAppealRequest } from '#tests/linked-appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { parseHorizonGetCaseResponse } from '#utils/mapping/map-horizon.js';
import { jest } from '@jest/globals';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '@pins/appeals/constants/support.js';
import { cloneDeep } from 'lodash-es';

const { databaseConnector } = await import('#utils/database-connector.js');
const { default: got } = await import('got');

describe('appeal linked appeals routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		describe('Linked appeals', () => {
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
				const childAppeal = cloneDeep({ ...householdAppeal, id: 2, reference: '4567654' });
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValueOnce(householdAppeal);
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValueOnce(childAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([savedFolder]);
				databaseConnector.document.create = jest.fn().mockImplementation(() => {
					return documentCreated;
				});
				databaseConnector.documentVersion.create = jest
					.fn()
					.mockResolvedValue(documentVersionCreated);

				got.post.mockReturnValueOnce({
					json: jest
						.fn()
						.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
				});

				const response = await request
					.post(`/appeals/${householdAppeal.id}/link-appeal`)
					.send({
						...linkedAppealRequest,
						linkedAppealReference: '123456'
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
						fileName: 'mydoc-4567654.pdf',
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
						linked_before_lpa_questionnaire: true
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
						linked_before_lpa_questionnaire: true
					},
					recipientEmail: householdAppeal.agent.email,
					templateName: 'link-appeal'
				});
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
						linkedAppealReference: '123456'
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
					.post(`/appeals/${householdAppeal.id}/associate-legacy-appeal`)
					.send({
						...linkedAppealLegacyRequest,
						linkedAppealReference: '123456'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(databaseConnector.appealRelationship.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appealRelationship.create).toHaveBeenCalledWith({
					data: {
						parentId: householdAppeal.id,
						parentRef: householdAppeal.reference,
						childRef: '123456',
						childId: null,
						type: CASE_RELATIONSHIP_RELATED,
						externalSource: true,
						externalAppealType: 'Planning Appeal (W)',
						externalId: '20486402'
					}
				});
			});
		});
	});
});
