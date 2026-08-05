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
		it('retrieves paged results', async () => {
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

			const result = await folderRepository.getById(1, 1, 100, null);
			const query = databaseConnector.folder.findUnique.mock.calls[0][0];

			expect(result).toEqual(mockFolder);
			expect(databaseConnector.folder.findUnique).toHaveBeenCalledTimes(1);
			expect(query).toEqual(
				expect.objectContaining({
					select: expect.objectContaining({
						documents: expect.objectContaining({
							orderBy: { createdAt: 'desc' },
							skip: 0,
							take: 100,
							where: { isDeleted: false }
						})
					}),
					where: { id: 1 }
				})
			);
			expect(query.select.documents.select.latestDocumentVersion.select).toEqual(
				expect.objectContaining({
					documentGuid: true,
					version: true,
					published: true,
					virusCheckStatus: true,
					size: true,
					redactionStatus: true,
					dateReceived: true,
					isLateEntry: true,
					isDeleted: true,
					documentType: true,
					stage: true,
					representation: {
						select: {
							representationId: true
						}
					}
				})
			);
		});
	});

	describe('getRepresentationFolderSizeById', () => {
		it('counts documents in a folder for a specific representation', async () => {
			databaseConnector.document.count.mockResolvedValue(7);

			const result = await folderRepository.getRepresentationFolderSizeById(12, 34);

			expect(result).toBe(7);
			expect(databaseConnector.document.count).toHaveBeenCalledWith({
				where: {
					isDeleted: false,
					folderId: 12,
					latestDocumentVersion: {
						is: {
							representation: {
								is: {
									representationId: 34
								}
							}
						}
					}
				}
			});
		});
	});
});
