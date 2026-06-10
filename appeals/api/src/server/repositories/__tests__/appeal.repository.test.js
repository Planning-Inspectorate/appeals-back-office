// @ts-nocheck
/* eslint-disable no-restricted-syntax */
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import appealRepository, {
	appealDetailsInclude,
	buildAppealInclude
} from '../appeal.repository.js';

describe('buildAppealInclude', () => {
	it('throws error when selectedKeys is empty and selectAppealTypeKey is not provided', () => {
		expect(() => buildAppealInclude([], true)).toThrow(
			'Must provide at least one: selectedKeys or selectAppealTypeKey'
		);
	});

	it('returns null when selectedKeys is empty and includeDetails = false', () => {
		const result = buildAppealInclude([], false);
		expect(result).toBeNull();
	});

	it('returns object containing only the specified keys when multiple selectedKeys provided and includeDetails = true', () => {
		/** @type {Array<keyof typeof appealDetailsInclude>} */
		const selectedKeys = ['address', 'agent', 'appealStatus'];
		const result = buildAppealInclude(selectedKeys, true);

		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(selectedKeys);
		expect(result.address).toBe(true);
		expect(result.agent).toBe(true);
		expect(result.appealStatus).toBe(true);
	});

	it('returns the selected key with all children where the key has them', () => {
		const result = buildAppealInclude(['lpaQuestionnaire'], true);

		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(['lpaQuestionnaire']);
		expect(result.lpaQuestionnaire).toEqual(appealDetailsInclude.lpaQuestionnaire);
	});

	it('returns null when selectedKeys is not empty and includeDetails = false', () => {
		const result = buildAppealInclude(['lpaQuestionnaire'], false);
		expect(result).toBeNull();
	});

	it('returns appealType.key where includeDetails=true, selectAppealTypeKey=true and selectedKeys does not contain appealType', () => {
		const result = buildAppealInclude([], true, true);
		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(['appealType']);
		expect(result.appealType).toEqual({ select: { key: true } });
	});
});

describe('getFoldersWithDocumentsAndVersions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('limits version fetching to 30 visible documents when loadAllVersions = false', async () => {
		const mockFolders = [{ id: 1, caseId: 2, path: 'lpa-questionnaire' }];
		const mockDocs = [];
		for (let i = 0; i < 50; i++) {
			mockDocs.push({ guid: `doc-guid-${i}`, folderId: 1, isDeleted: false });
		}

		databaseConnector.folder.findMany.mockResolvedValue(mockFolders);
		databaseConnector.document.findMany.mockResolvedValue(mockDocs);
		databaseConnector.documentVersion.findMany.mockResolvedValue([]);

		await appealRepository.getFoldersWithDocumentsAndVersions(2, false);

		// Assert version lookups are limited to the top 30 visible docs
		expect(databaseConnector.documentVersion.findMany).toHaveBeenCalledTimes(1);
		const callArgs = databaseConnector.documentVersion.findMany.mock.calls[0][0];
		expect(callArgs.where.documentGuid.in.length).toBe(30);
		expect(callArgs.where.documentGuid.in).toEqual(mockDocs.slice(0, 30).map((d) => d.guid));
	});

	it('fetches all versions in batches when loadAllVersions = true', async () => {
		const mockFolders = [{ id: 1, caseId: 2, path: 'lpa-questionnaire' }];
		const mockDocs = [];
		for (let i = 0; i < 2200; i++) {
			mockDocs.push({ guid: `doc-guid-${i}`, folderId: 1, isDeleted: false });
		}

		databaseConnector.folder.findMany.mockResolvedValue(mockFolders);
		databaseConnector.document.findMany.mockResolvedValue(mockDocs);
		databaseConnector.documentVersion.findMany.mockResolvedValue([]);

		await appealRepository.getFoldersWithDocumentsAndVersions(2, true);

		// Assert version lookups fetched all 2200 docs in batches of 1000
		expect(databaseConnector.documentVersion.findMany).toHaveBeenCalledTimes(3);

		const firstCallArgs = databaseConnector.documentVersion.findMany.mock.calls[0][0];
		expect(firstCallArgs.where.documentGuid.in.length).toBe(1000);

		const secondCallArgs = databaseConnector.documentVersion.findMany.mock.calls[1][0];
		expect(secondCallArgs.where.documentGuid.in.length).toBe(1000);

		const thirdCallArgs = databaseConnector.documentVersion.findMany.mock.calls[2][0];
		expect(thirdCallArgs.where.documentGuid.in.length).toBe(200);
	});
});
