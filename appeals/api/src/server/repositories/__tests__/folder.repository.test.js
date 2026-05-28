// @ts-nocheck
/* eslint-disable no-restricted-syntax */
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import * as folderRepository from '../folder.repository.js';

describe('folder.repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getById', () => {
		it('retrieves high-volume folder and sequential batch loads latest document versions in chunks of 1000', async () => {
			const totalDocsCount = 2200;
			const mockDocuments = [];
			for (let i = 0; i < totalDocsCount; i++) {
				mockDocuments.push({
					guid: `doc-guid-${i}`,
					latestDocumentVersion: null
				});
			}

			const mockFolder = {
				id: 1,
				caseId: 2,
				documents: mockDocuments
			};

			databaseConnector.folder.findUnique.mockResolvedValue(mockFolder);
			databaseConnector.documentVersion.findMany.mockImplementation(({ where }) => {
				const chunkGuids = where.documentGuid.in;
				return Promise.resolve(
					chunkGuids.map((guid) => ({
						id: 999,
						documentGuid: guid,
						version: 2
					}))
				);
			});

			const result = await folderRepository.getById(1);

			expect(result).toEqual(mockFolder);
			expect(databaseConnector.folder.findUnique).toHaveBeenCalledTimes(1);

			// Assert findMany called exactly 3 times (1000 + 1000 + 200 = 2200)
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalledTimes(3);

			// Verify chunks
			expect(databaseConnector.documentVersion.findMany).toHaveBeenNthCalledWith(1, {
				where: { documentGuid: { in: mockDocuments.slice(0, 1000).map((d) => d.guid) } },
				include: { redactionStatus: true, representation: true }
			});
			expect(databaseConnector.documentVersion.findMany).toHaveBeenNthCalledWith(2, {
				where: { documentGuid: { in: mockDocuments.slice(1000, 2000).map((d) => d.guid) } },
				include: { redactionStatus: true, representation: true }
			});
			expect(databaseConnector.documentVersion.findMany).toHaveBeenNthCalledWith(3, {
				where: { documentGuid: { in: mockDocuments.slice(2000, 2200).map((d) => d.guid) } },
				include: { redactionStatus: true, representation: true }
			});

			// Verify mapping of all documents
			for (let i = 0; i < totalDocsCount; i++) {
				expect(mockFolder.documents[i].latestDocumentVersion).not.toBeNull();
				expect(mockFolder.documents[i].latestDocumentVersion.documentGuid).toBe(`doc-guid-${i}`);
				expect(mockFolder.documents[i].latestDocumentVersion.version).toBe(2);
			}
		});
	});
});
