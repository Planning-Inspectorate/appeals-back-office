import { databaseConnector } from '#utils/database-connector.js';
import { getSkipValue } from '#utils/database-pagination.js';

/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */

/**
 * Helper to load document versions in batches of 1000 to bypass SQL Server parameter limit
 * @param {any[]} folders
 * @returns {Promise<void>}
 */
const batchLoadDocumentVersions = async (folders) => {
	const allDocuments = folders.flatMap((f) => f.documents || []).filter(Boolean);
	if (allDocuments.length === 0) {
		return;
	}

	const guidsToFetch = allDocuments.map((d) => d.guid).filter(Boolean);
	if (guidsToFetch.length === 0) {
		return;
	}

	const batchSize = 1000;
	const documentVersions = [];

	for (let i = 0; i < guidsToFetch.length; i += batchSize) {
		const chunk = guidsToFetch.slice(i, i + batchSize);
		const chunkVersions = await databaseConnector.documentVersion.findMany({
			where: {
				documentGuid: { in: chunk }
			},
			include: {
				redactionStatus: true,
				representation: true
			}
		});
		if (chunkVersions && Array.isArray(chunkVersions)) {
			documentVersions.push(...chunkVersions);
		}
	}

	const versionsByGuid = new Map();
	for (const version of documentVersions) {
		versionsByGuid.set(version.documentGuid, version);
	}

	for (const doc of allDocuments) {
		const newVersion = versionsByGuid.get(doc.guid);
		if (newVersion) {
			doc.latestDocumentVersion = newVersion;
		} else if (!doc.latestDocumentVersion) {
			doc.latestDocumentVersion = null;
		}
	}
};

/**
 * @param {number|null} repId
 */
const documentRepWhere = (repId) => {
	if (!repId) {
		return undefined;
	}
	return {
		is: {
			representation: {
				is: {
					representationId: repId
				}
			}
		}
	};
};

/**
 * @param {number} id
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {number|null} repId
 * @returns {Promise<Folder|null>}
 */
export const getById = async (id, pageNumber, pageSize, repId) => {
	const folder = await databaseConnector.folder.findUnique({
		where: { id },
		select: {
			id: true,
			caseId: true,
			path: true,
			documents: {
				select: {
					guid: true,
					name: true,
					createdAt: true,
					isDeleted: true,
					latestDocumentVersion: {
						select: {
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
						}
					}
				},
				where: {
					isDeleted: false,
					...(repId ? { latestDocumentVersion: documentRepWhere(repId) } : {})
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: pageSize,
				skip: getSkipValue(pageNumber, pageSize)
			}
		}
	});

	if (!folder) {
		return null;
	}

	// @ts-ignore
	return folder;
};

/**
 * @param {number} id
 * @returns {Promise<number>}
 */
export const getFolderSizeById = async (id) =>
	databaseConnector.document.count({
		where: { isDeleted: false, folderId: id }
	});

/**
 * @param {number} id
 * @param {number} repId
 * @returns {Promise<number>}
 */
export const getRepresentationFolderSizeById = async (id, repId) => {
	return databaseConnector.document.count({
		where: {
			isDeleted: false,
			folderId: id,
			latestDocumentVersion: documentRepWhere(repId)
		}
	});
};

/**
 * Returns array of folders in a folder or case (if parentFolderId is null)
 *
 * @param {number} caseId
 * @returns {Promise<Folder[]>}
 */
export const getByCaseId = async (caseId) => {
	const folders = await databaseConnector.folder.findMany({
		where: { caseId },
		include: {
			documents: {
				where: { isDeleted: false },
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});

	await batchLoadDocumentVersions(folders);
	return folders;
};

/**
 * Returns array of folders in a folder or case (if parentFolderId is null)
 *
 * @param {number} caseId
 * @param {string[]} paths
 * @returns {Promise<Folder[]>}
 */
export const getByCaseIdAndPaths = async (caseId, paths) => {
	const folders = await databaseConnector.folder.findMany({
		where: {
			caseId,
			path: { in: paths }
		},
		include: {
			documents: {
				where: { isDeleted: false },
				orderBy: {
					createdAt: 'asc'
				}
			}
		}
	});

	await batchLoadDocumentVersions(folders);
	return folders;
};
