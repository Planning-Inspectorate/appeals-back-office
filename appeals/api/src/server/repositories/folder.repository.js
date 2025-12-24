import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */

/**
 * @param {number} id
 * @returns {PrismaPromise<Folder|null>}
 */
export const getById = (id) => {
	// @ts-ignore
	return databaseConnector.folder.findUnique({
		where: { id },
		include: {
			documents: {
				where: { isDeleted: false },
				include: {
					latestDocumentVersion: {
						include: {
							redactionStatus: true,
							representation: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});
};

/**
 * Returns array of folders in a folder or case (if parentFolderId is null)
 *
 * @param {number} caseId
 * @returns {PrismaPromise<Folder[]>}
 */
export const getByCaseId = (caseId) => {
	return databaseConnector.folder.findMany({
		where: { caseId },
		include: {
			documents: {
				where: { isDeleted: false },
				include: {
					latestDocumentVersion: {
						include: {
							redactionStatus: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});
};

/**
 * Returns array of folders in a folder or case (if parentFolderId is null)
 *
 * @param {number} caseId
 * @param {string[]} paths
 * @returns {PrismaPromise<Folder[]>}
 */
export const getByCaseIdAndPaths = (caseId, paths) => {
	return databaseConnector.folder.findMany({
		where: {
			caseId,
			path: { in: paths }
		},
		include: {
			documents: {
				where: { isDeleted: false },
				include: {
					latestDocumentVersion: {
						include: {
							redactionStatus: true
						}
					}
				},
				orderBy: {
					createdAt: 'asc'
				}
			}
		}
	});
};
