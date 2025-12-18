// @ts-nocheck
import * as folderRepository from '#repositories/folder.repository.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import {
	addDocumentsRequest,
	addDocumentVersionRequest,
	blobInfo,
	documentCreated,
	documentUpdated,
	documentVersionCreated,
	documentVersionRetrieved,
	folder,
	savedFolder
} from '#tests/documents/mocks.js';
import { azureAdUserId, documentRedactionStatuses } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import * as controller from '../documents.controller.js';
import * as mappers from '../documents.mapper.js';
import * as service from '../documents.service.js';

const { databaseConnector } = await import('#utils/database-connector.js');
const { default: got } = await import('got');

const savedDocument = savedFolder.documents[0];

describe('/appeals/:appealId/document-folders/:folderId', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.documentVersionAvScan.upsert.mockResolvedValue({});
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET', () => {
		test('gets a single document folder', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.folder.findUnique.mockResolvedValue(savedFolder);

			const response = await request
				.get(`/appeals/${householdAppeal.id}/document-folders/${savedFolder.id}`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);

			expect(response.body).toEqual({
				folderId: savedFolder.id,
				path: savedFolder.path,
				caseId: savedFolder.caseId.toString(),
				documents: [
					{
						id: savedDocument.guid,
						caseId: savedFolder.caseId,
						folderId: savedFolder.id,
						createdAt: expect.any(String),
						isDeleted: false,
						latestDocumentVersion: {
							version: 1,
							blobStorageContainer: '',
							blobStoragePath: savedDocument.latestDocumentVersion.blobStoragePath,
							documentURI: '',
							dateReceived: '',
							size: savedDocument.latestDocumentVersion.size.toString(),
							mime: savedDocument.latestDocumentVersion.mime,
							fileName: '',
							originalFilename: '',
							redactionStatus: '',
							documentType: 'appellantCostApplication',
							stage: '',
							virusCheckStatus: 'not_scanned'
						},
						name: savedDocument.name,
						versionAudit: []
					}
				]
			});
		});
	});
});

describe('/appeals/documents/:documentId', () => {
	describe('GET', () => {
		test('gets a single document', async () => {
			databaseConnector.document.findUnique.mockResolvedValue(savedFolder.documents[0]);

			const response = await request
				.get(`/appeals/documents/${savedFolder.documents[0].guid}`)
				.set('azureAdUserId', azureAdUserId);

			console.log(response.body);
			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				id: savedDocument.guid,
				caseId: savedFolder.caseId,
				folderId: savedFolder.id,
				createdAt: expect.any(String),
				isDeleted: false,
				latestDocumentVersion: {
					version: 1,
					blobStorageContainer: '',
					blobStoragePath: savedDocument.latestDocumentVersion.blobStoragePath,
					documentURI: '',
					dateReceived: '',
					size: savedDocument.latestDocumentVersion.size.toString(),
					mime: savedDocument.latestDocumentVersion.mime,
					fileName: '',
					originalFilename: '',
					redactionStatus: '',
					documentType: 'appellantCostApplication',
					stage: '',
					virusCheckStatus: 'not_scanned'
				},
				name: savedFolder.documents[0].name,
				versionAudit: []
			});
		});
	});
});

describe('/appeals/:appealId/documents/:documentId', () => {
	describe('PATCH', () => {
		databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
		databaseConnector.user.upsert.mockResolvedValue({
			id: 1,
			azureAdUserId
		});
		databaseConnector.document.update = jest.fn().mockResolvedValue(null);

		const requestBody = {
			document: {
				id: '8b107895-b8c9-467f-aad0-c09daafeaaad',
				fileName: 'new_filename.txt'
			}
		};

		test('updates filename in document', async () => {
			const response = await request
				.patch(`/appeals/${householdAppeal.id}/documents/${documentCreated.guid}`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.document.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(response.status).toEqual(200);
		});
	});
});

describe('/appeals/:appealId/documents', () => {
	let requestBody;

	beforeEach(() => {
		requestBody = {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					receivedDate: '2023-09-22',
					latestVersion: 1,
					redactionStatus: 1
				},
				{
					id: '8b107895-b8c9-467f-aad0-c09daafeaaad',
					receivedDate: '2023-09-23',
					latestVersion: 1,
					redactionStatus: 2
				}
			]
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('POST', () => {
		test('creates multiple documents', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.documentRedactionStatus.findMany.mockResolvedValue(
				documentRedactionStatuses
			);
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});
			databaseConnector.document.create = jest.fn().mockResolvedValue(documentCreated);
			databaseConnector.documentVersion.create = jest
				.fn()
				.mockResolvedValue(documentVersionCreated);

			databaseConnector.$transaction = jest.fn().mockImplementation((callback) =>
				callback({
					document: {
						create: jest.fn().mockResolvedValue([
							{ ...documentCreated, guid: '987e66e0-1db4-404b-8213-8082919159e9' },
							{ ...documentCreated, guid: '8b107895-b8c9-467f-aad0-c09daafeaaad' }
						]),
						update: jest.fn().mockResolvedValue([
							{ ...documentUpdated, guid: '987e66e0-1db4-404b-8213-8082919159e9' },
							{ ...documentUpdated, guid: '8b107895-b8c9-467f-aad0-c09daafeaaad' }
						])
					},
					documentVersion: {
						create: jest.fn().mockResolvedValue([
							{ ...documentVersionCreated, guid: '987e66e0-1db4-404b-8213-8082919159e9' },
							{ ...documentVersionCreated, guid: '8b107895-b8c9-467f-aad0-c09daafeaaad' }
						]),
						upsert: jest.fn().mockResolvedValue([
							{ ...documentVersionCreated, guid: '987e66e0-1db4-404b-8213-8082919159e9' },
							{ ...documentVersionCreated, guid: '8b107895-b8c9-467f-aad0-c09daafeaaad' }
						]),
						findFirst: jest.fn().mockResolvedValue([
							{ ...documentVersionRetrieved, guid: '987e66e0-1db4-404b-8213-8082919159e9' },
							{ ...documentVersionRetrieved, guid: '8b107895-b8c9-467f-aad0-c09daafeaaad' }
						])
					},
					documentVersionAvScan: {
						findUnique: jest.fn().mockResolvedValue({})
					}
				})
			);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/documents`)
				.send({
					...requestBody,
					blobStorageHost: 'blobStorageHost',
					blobStorageContainer: 'blobStorageContainer'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.$transaction).toHaveBeenCalledTimes(2);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(3);
			expect(response.status).toEqual(204);
		});
	});

	describe('PATCH', () => {
		databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
		databaseConnector.documentRedactionStatus.findMany.mockResolvedValue(documentRedactionStatuses);
		databaseConnector.user.upsert.mockResolvedValue({
			id: 1,
			azureAdUserId
		});
		databaseConnector.documentVersion.update = jest.fn().mockResolvedValue(null);

		const requestBody = {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					receivedDate: new Date().toISOString(),
					redactionStatus: 2
				},
				{
					id: '8b107895-b8c9-467f-aad0-c09daafeaaad',
					receivedDate: new Date().toISOString(),
					redactionStatus: 2
				}
			]
		};

		test('updates received date and redaction status in document version', async () => {
			const response = await request
				.patch(`/appeals/${householdAppeal.id}/documents`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersion.update).toHaveBeenCalledTimes(2);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(2);
			expect(response.status).toEqual(200);
		});
	});
});

describe('appeals documents', () => {
	describe('appeals folders', () => {
		test('all document folders are linked to the correct appeal', async () => {
			const appealId = 2000;
			const foldersForCase = mappers.mapDefaultCaseFolders(appealId);
			expect(foldersForCase.length).toBeGreaterThan(0);
			foldersForCase.forEach((f) => expect(f.caseId).toEqual(appealId));
		});

		test('finds all top level folders when case has folders attached', async () => {
			databaseConnector.folder.findMany.mockResolvedValue(mappers.mapDefaultCaseFolders(10));
			const folders = await folderRepository.getByCaseId(10);
			expect(folders).toEqual(mappers.mapDefaultCaseFolders(10));
		});
	});

	describe('mappers', () => {
		test('appeal reference is safely escaped for blob URLs', async () => {
			const mappedRef = mappers.mapCaseReferenceForStorageUrl(householdAppeal.reference);
			expect(mappedRef).not.toContain('/');
			expect(blobInfo.blobStoreUrl).toContain(mappedRef);
		});

		test('blob URL includes GUID and version', async () => {
			const mappedPath = mappers.mapBlobPath(
				blobInfo.GUID,
				blobInfo.caseReference,
				blobInfo.documentName || 'test',
				1
			);
			expect(mappedPath).toContain('/v1/');
			expect(mappedPath).toContain(blobInfo.GUID);
		});
	});

	describe('post documents', () => {
		test('post single document throws error when case not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			got.post.mockReturnValue({ json: jest.fn().mockResolvedValue(null) });
			await expect(controller.addDocuments).rejects.toThrow(Error);
		});

		test('add new version thows error when document not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.document.findUnique.mockResolvedValue(null);
			got.post.mockReturnValue({ json: jest.fn().mockResolvedValue(null) });

			await expect(service.addVersionToDocument).rejects.toThrow(Error);
		});

		test('post single document', async () => {
			const mappedReq = mappers.mapDocumentsForDatabase(
				householdAppeal.id,
				addDocumentsRequest.blobStorageHost,
				addDocumentsRequest.blobStorageContainer,
				addDocumentsRequest.documents
			);
			mappedReq.forEach((m) => {
				expect(m.blobStorageHost).toEqual(addDocumentsRequest.blobStorageHost);
				expect(m.blobStorageContainer).toEqual(addDocumentsRequest.blobStorageContainer);
			});

			const prismaMock = {
				document: {
					create: jest.fn().mockResolvedValue(documentCreated),
					update: jest.fn().mockResolvedValue(documentUpdated)
				},
				documentVersion: {
					create: jest.fn().mockResolvedValue(documentVersionCreated),
					upsert: jest.fn().mockResolvedValue(documentVersionCreated),
					findFirst: jest.fn().mockResolvedValue(documentVersionRetrieved)
				},
				documentVersionAvScan: {
					findUnique: jest.fn().mockResolvedValue({})
				}
			};

			databaseConnector.$transaction = jest
				.fn()
				.mockImplementation((callback) => callback(prismaMock));
			const response = await service.addDocumentsToAppeal(addDocumentsRequest, householdAppeal);
			expect(response).toEqual({
				documents: [
					{
						GUID: blobInfo.GUID,
						documentName: blobInfo.documentName,
						redactionStatus: undefined,
						versionId: 1
					}
				]
			});
		});

		test('post new document version', async () => {
			const mappedReq = mappers.mapDocumentsForDatabase(
				householdAppeal.id,
				addDocumentVersionRequest.blobStorageHost,
				addDocumentVersionRequest.blobStorageContainer,
				[addDocumentVersionRequest.document]
			);
			mappedReq.forEach((m) => {
				expect(m.blobStorageHost).toEqual(addDocumentVersionRequest.blobStorageHost);
				expect(m.blobStorageContainer).toEqual(addDocumentVersionRequest.blobStorageContainer);
			});

			const prismaMock = {
				document: {
					findFirst: jest.fn().mockResolvedValue(documentCreated),
					update: jest.fn().mockResolvedValue(documentUpdated)
				},
				documentVersion: {
					create: jest.fn().mockResolvedValue(documentVersionCreated),
					findFirst: jest.fn().mockResolvedValue(documentVersionRetrieved)
				},
				documentVersionAvScan: {
					findUnique: jest.fn().mockResolvedValue({})
				}
			};

			databaseConnector.$transaction = jest
				.fn()
				.mockImplementation((callback) => callback(prismaMock));

			const response = await service.addVersionToDocument(
				addDocumentVersionRequest,
				householdAppeal,
				documentCreated.guid
			);
			expect(response).toEqual({
				documents: [
					{
						GUID: '27d0fda4-8a9a-4f5a-a158-68eaea676158',
						documentName: 'mydoc.pdf',
						redactionStatus: undefined,
						versionId: 1
					}
				]
			});
		});
	});

	describe('documents services', () => {
		test('get folders for appeal', async () => {
			databaseConnector.folder.findMany.mockReturnValue([folder]);
			const folders = await service.getFoldersForAppeal(householdAppeal.id, 'appellantCase');
			expect(folders).toEqual([folder]);
		});
	});

	describe('documents AV scanning', () => {
		test('validate AV scan result: no UUID provided', async () => {
			databaseConnector.document.findUnique.mockReturnValue(null);
			const requestBody = {
				documents: [
					{
						id: 'incorrect-id',
						version: 0,
						virusCheckStatus: 'scanned'
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
		test('validate AV scan result: no status provided', async () => {
			const requestBody = {
				documents: [
					{
						id: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882',
						version: 1,
						virusCheckStatus: ''
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
		test('validate AV scan result: incorrect status provided', async () => {
			const requestBody = {
				documents: [
					{
						id: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882',
						version: 1,
						virusCheckStatus: 'something-wrong'
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
		test('validate AV scan result: document not found / scan result requested', async () => {
			databaseConnector.document.findUnique.mockReturnValue(null);
			const requestBody = {
				documents: [
					{
						id: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882',
						version: 1,
						virusCheckStatus: 'scanned'
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersionAvScan.upsert).toHaveBeenCalled();
			expect(response.status).toEqual(200);
		});
		test('validate AV scan result: version not found / scan result requested', async () => {
			databaseConnector.document.findUnique.mockReturnValue(documentCreated);
			const requestBody = {
				documents: [
					{
						id: documentCreated.guid,
						version: 3,
						virusCheckStatus: 'scanned'
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersionAvScan.upsert).toHaveBeenCalled();
			expect(response.status).toEqual(200);
		});
		test('validate AV scan result: document found', async () => {
			databaseConnector.document.findUnique.mockReturnValue({
				...documentCreated,
				allVersions: [documentCreated.latestDocumentVersion]
			});
			databaseConnector.documentVersion.update.mockReturnValue({
				...documentCreated,
				latestDocumentVersion: {
					...documentCreated.latestDocumentVersion,
					virusCheckStatus: 'scanned'
				}
			});
			const requestBody = {
				documents: [
					{
						id: documentCreated.guid,
						version: documentCreated.latestDocumentVersion.version,
						virusCheckStatus: 'scanned'
					}
				]
			};

			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send(requestBody)
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersionAvScan.upsert).toHaveBeenCalled();
			expect(databaseConnector.document.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(200);
		});

		test('updates AV scan document not yet saved', async () => {
			jest.clearAllMocks();
			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send({
					documents: [
						{
							id: documentCreated.guid,
							version: 1,
							virusCheckStatus: 'scanned'
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersionAvScan.upsert).toHaveBeenCalledTimes(1);
			expect(databaseConnector.documentVersion.update).not.toHaveBeenCalled();
			expect(response.body).toEqual({
				documents: [
					{
						id: documentCreated.guid,
						version: 1,
						virusCheckStatus: 'scanned'
					}
				]
			});
			expect(response.status).toEqual(200);
		});

		test('updates AV scan document already saved', async () => {
			jest.clearAllMocks();
			databaseConnector.document.findUnique.mockResolvedValue({
				guid: documentCreated.guid,
				versions: [
					{
						version: 1,
						virusCheckStatus: 'not scanned'
					}
				]
			});
			const response = await request
				.patch(`/appeals/documents/avcheck`)
				.send({
					documents: [
						{
							id: documentCreated.guid,
							version: 1,
							virusCheckStatus: 'scanned'
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.documentVersionAvScan.upsert).toHaveBeenCalledTimes(1);
			expect(databaseConnector.documentVersion.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.document.findUnique).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual({
				documents: [
					{
						id: documentCreated.guid,
						version: 1,
						virusCheckStatus: 'scanned'
					}
				]
			});
			expect(response.status).toEqual(200);
		});
	});
});
